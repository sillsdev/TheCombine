using System;
using System.Text;
using BackendFramework.Contexts;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Repositories;
using BackendFramework.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Converters;

namespace BackendFramework
{
    public class Startup
    {
        private const string AllowedOrigins = "AllowAll";

        private readonly ILogger<Startup> _logger;

        private IConfiguration Configuration { get; }

        public Startup(ILogger<Startup> logger, IConfiguration configuration)
        {
            _logger = logger;
            Configuration = configuration;
        }

        public class Settings
        {
            public const int DefaultPasswordResetExpireTime = 15;

            public string ConnectionString { get; set; }
            public string CombineDatabase { get; set; }
            public string? SmtpServer { get; set; }
            public int? SmtpPort { get; set; }
            public string? SmtpUsername { get; set; }
            public string? SmtpPassword { get; set; }
            public string? SmtpAddress { get; set; }
            public string? SmtpFrom { get; set; }
            public int PassResetExpireTime { get; set; }

            public Settings()
            {
                ConnectionString = "";
                CombineDatabase = "";
                PassResetExpireTime = DefaultPasswordResetExpireTime;
            }
        }

        [Serializable]
        private class EnvironmentNotConfiguredException : Exception
        {
        }

        private string? CheckedEnvironmentVariable(string name, string? defaultValue, string error = "")
        {
            var contents = Environment.GetEnvironmentVariable(name);
            if (contents != null)
            {
                return contents;
            }

            _logger.LogError($"Environment variable: `{name}` is not defined. {error}");
            return defaultValue;
        }

        /// <summary> Determine if executing within a container (e.g. Docker). </summary>
        private static bool IsInContainer()
        {
            return Environment.GetEnvironmentVariable("COMBINE_IS_IN_CONTAINER") != null;
        }

        [Serializable]
        private class AdminUserCreationException : Exception
        {
        }

        /// <summary> This method gets called by the runtime. Use this method to add services for dependency injection.
        /// </summary>
        public void ConfigureServices(IServiceCollection services)
        {
            // Only add CORS rules if running outside of Docker/NGINX environment. Rules are not needed in a
            // true reverse proxy setup.
            if (!IsInContainer())
            {
                services.AddCors(options =>
                {
                    options.AddPolicy(AllowedOrigins,
                        builder => builder
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                            // Add URL for React CLI using during development.
                            .WithOrigins("http://localhost:3000")
                            .AllowCredentials());
                });
            }

            // Configure JWT Authentication
            const string secretKeyEnvName = "COMBINE_JWT_SECRET_KEY";
            var secretKey = Environment.GetEnvironmentVariable(secretKeyEnvName);

            // The JWT key size must be at least 128 bits long.
            const int minKeyLength = 128 / 8;
            if (secretKey is null || secretKey.Length < minKeyLength)
            {
                _logger.LogError($"Must set {secretKeyEnvName} environment variable " +
                                 $"to string of length {minKeyLength} or longer.");
                throw new EnvironmentNotConfiguredException();
            }

            var key = Encoding.ASCII.GetBytes(secretKey);
            services.AddAuthentication(x =>
                {
                    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(x =>
                {
                    x.RequireHttpsMetadata = false;
                    x.SaveToken = true;
                    x.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = false,
                        ValidateAudience = false
                    };
                });

            services.AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_3_0)
                // NewtonsoftJson needed when porting from .NET Core 2.2 to 3.0
                // https://dev.to/wattengard/why-your-posted-models-may-stop-working-after-upgrading-to-asp-net-core-3-1-4ekp
                // TODO: This may be able to be removed by reviewing the raw JSON from the frontend to see if there
                //    is malformed data, such as an integer sent as a string ("10"). .NET Core 3.0's JSON parser
                //    no longer automatically tries to coerce these values.
                .AddNewtonsoftJson(options =>
                    // Required so that integer enum's can be passed in JSON as their descriptive string names, rather
                    //  than by opaque integer values. This makes the OpenAPI schema much more expressive for
                    //  integer enums. https://stackoverflow.com/a/55541764
                    options.SerializerSettings.Converters.Add(new StringEnumConverter()));

            services.AddSignalR();
            services.AddSwaggerGen();
            // TODO: Remove this when NewtonsoftJson support is removed.
            services.AddSwaggerGenNewtonsoftSupport();

            services.Configure<Settings>(
                options =>
                {
                    var connectionStringKey = IsInContainer() ? "ContainerConnectionString" : "ConnectionString";
                    options.ConnectionString = Configuration[$"MongoDB:{connectionStringKey}"];
                    options.CombineDatabase = Configuration["MongoDB:CombineDatabase"];

                    const string emailServiceFailureMessage = "Email services will not work.";
                    options.SmtpServer = CheckedEnvironmentVariable(
                        "COMBINE_SMTP_SERVER",
                        null,
                        emailServiceFailureMessage);
                    options.SmtpPort = int.Parse(CheckedEnvironmentVariable(
                        "COMBINE_SMTP_PORT",
                        IEmailContext.InvalidPort.ToString(),
                        emailServiceFailureMessage)!);
                    options.SmtpUsername = CheckedEnvironmentVariable(
                        "COMBINE_SMTP_USERNAME",
                        null,
                        emailServiceFailureMessage);
                    options.SmtpPassword = CheckedEnvironmentVariable(
                        "COMBINE_SMTP_PASSWORD",
                        null,
                        emailServiceFailureMessage);
                    options.SmtpAddress = CheckedEnvironmentVariable(
                        "COMBINE_SMTP_ADDRESS",
                        null,
                        emailServiceFailureMessage);
                    options.SmtpFrom = CheckedEnvironmentVariable(
                        "COMBINE_SMTP_FROM",
                        null,
                        emailServiceFailureMessage);
                    options.PassResetExpireTime = int.Parse(CheckedEnvironmentVariable(
                        "COMBINE_PASSWORD_RESET_EXPIRE_TIME",
                        Settings.DefaultPasswordResetExpireTime.ToString(),
                        $"Using default value: {Settings.DefaultPasswordResetExpireTime}")!);
                });

            // Register concrete types for dependency injection

            // Email types
            services.AddTransient<IEmailContext, EmailContext>();
            services.AddTransient<IEmailService, EmailService>();
            services.AddTransient<IInviteService, InviteService>();

            // Lift Service - Singleton to avoid initializing the Sldr multiple times,
            // also to avoid leaking LanguageTag data
            services.AddSingleton<ILiftService, LiftService>();

            // Merge types
            services.AddTransient<IMergeBlacklistContext, MergeBlacklistContext>();
            services.AddTransient<IMergeBlacklistRepository, MergeBlacklistRepository>();
            services.AddTransient<IMergeService, MergeService>();

            // Password Reset types
            services.AddTransient<IPasswordResetContext, PasswordResetContext>();
            services.AddTransient<IPasswordResetService, PasswordResetService>();

            // Permission types
            services.AddTransient<IPermissionService, PermissionService>();

            // Project types
            services.AddTransient<IProjectContext, ProjectContext>();
            services.AddTransient<IProjectRepository, ProjectRepository>();
            services.AddTransient<ISemanticDomainService, SemanticDomainService>();

            // User types
            services.AddTransient<IUserContext, UserContext>();
            services.AddTransient<IUserRepository, UserRepository>();

            // User Edit types
            services.AddTransient<IUserEditContext, UserEditContext>();
            services.AddTransient<IUserEditRepository, UserEditRepository>();
            services.AddTransient<IUserEditService, UserEditService>();

            // User Role types
            services.AddTransient<IUserRoleContext, UserRoleContext>();
            services.AddTransient<IUserRoleRepository, UserRoleRepository>();

            // Word types (includes Frontier types)
            services.AddTransient<IWordContext, WordContext>();
            services.AddTransient<IWordRepository, WordRepository>();
            services.AddTransient<IWordService, WordService>();
        }

        /// <summary> This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        /// </summary>
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IHostApplicationLifetime appLifetime)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios,
                // see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseRouting();
            app.UseCors(AllowedOrigins);

            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapDefaultControllerRoute();
                endpoints.MapHub<CombineHub>("/hub");
            });

            // Configure OpenAPI (Formerly Swagger) schema generation
            const string openApiRoutePrefix = "openapi";
            app.UseSwagger(c =>
            {
                c.RouteTemplate = $"/{openApiRoutePrefix}/{{documentName}}/openapi.{{json|yaml}}";
            });
            // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.), specifying the Swagger JSON endpoint.
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint($"/{openApiRoutePrefix}/v1/openapi.json", "Combine API V1");
                c.RoutePrefix = openApiRoutePrefix;
            });

            // If an admin user has been created via the commandline, treat that as a single action and shut the
            // server down so the calling script knows it's been completed successfully or unsuccessfully.
            if (CreateAdminUser(app.ApplicationServices.GetService<IUserRepository>()))
            {
                _logger.LogInformation("Stopping application");
                appLifetime.StopApplication();
            }
        }

        /// <summary>
        /// Create a new user with administrator privileges or change the password of an existing user and grant
        /// administrator privileges.
        /// </summary>
        /// <returns> Whether the application should be stopped. </returns>
        /// <exception cref="EnvironmentNotConfiguredException">
        /// If required environment variables are not set.
        /// </exception>
        /// <exception cref="AdminUserCreationException">
        /// If the requested admin user could not be created or updated.
        /// </exception>
        private bool CreateAdminUser(IUserRepository userRepo)
        {
            const string createAdminUsernameArg = "create-admin-username";
            const string createAdminPasswordEnv = "COMBINE_ADMIN_PASSWORD";
            const string createAdminEmailEnv = "COMBINE_ADMIN_EMAIL";

            var username = Configuration.GetValue<string>(createAdminUsernameArg);
            if (username is null)
            {
                _logger.LogInformation("No admin user name provided, skipped admin creation");
                return false;
            }

            var password = Environment.GetEnvironmentVariable(createAdminPasswordEnv);
            if (password is null)
            {
                _logger.LogError($"Must set {createAdminPasswordEnv} environment variable " +
                                 $"when using {createAdminUsernameArg} command line option.");
                throw new EnvironmentNotConfiguredException();
            }

            var adminEmail = Environment.GetEnvironmentVariable(createAdminEmailEnv);
            if (adminEmail is null)
            {
                _logger.LogError($"Must set {createAdminEmailEnv} environment variable " +
                                 $"when using {createAdminUsernameArg} command line option.");
                throw new EnvironmentNotConfiguredException();
            }

            var existingUser = userRepo.GetAllUsers().Result.Find(x => x.Username == username);
            if (existingUser != null)
            {
                _logger.LogInformation($"User {username} already exists. Updating password and granting " +
                                       "admin permissions.");
                if (userRepo.ChangePassword(existingUser.Id, password).Result == ResultOfUpdate.NotFound)
                {
                    _logger.LogError($"Failed to find user {username}.");
                    throw new AdminUserCreationException();
                }

                existingUser.IsAdmin = true;
                if (userRepo.Update(existingUser.Id, existingUser, true).Result == ResultOfUpdate.NotFound)
                {
                    _logger.LogError($"Failed to find user {username}.");
                    throw new AdminUserCreationException();
                }

                return true;
            }

            _logger.LogInformation($"Creating admin user: {username} ({adminEmail})");
            var user = new User { Username = username, Password = password, Email = adminEmail, IsAdmin = true };
            var returnedUser = userRepo.Create(user).Result;
            if (returnedUser is null)
            {
                _logger.LogError($"Failed to create admin user {username}, {adminEmail}.");
                throw new AdminUserCreationException();
            }

            return true;
        }
    }
}
