using System;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;
using BackendFramework.Contexts;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using BackendFramework.Repositories;
using BackendFramework.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using static System.Text.Encoding;

namespace BackendFramework
{
    [ExcludeFromCodeCoverage]
    public class Startup
    {
        private const string LocalhostCorsPolicy = "LocalhostCorsPolicy";

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

            public bool CaptchaEnabled { get; set; }
            public string? CaptchaSecretKey { get; set; }
            public string? CaptchaVerifyUrl { get; set; }
            public string ConnectionString { get; set; }
            public string CombineDatabase { get; set; }
            public bool EmailEnabled { get; set; }
            public string? SmtpServer { get; set; }
            public int? SmtpPort { get; set; }
            public string? SmtpUsername { get; set; }
            public string? SmtpPassword { get; set; }
            public string? SmtpAddress { get; set; }
            public string? SmtpFrom { get; set; }
            public int PassResetExpireTime { get; set; }

            public Settings()
            {
                CaptchaEnabled = true;
                ConnectionString = "";
                CombineDatabase = "";
                EmailEnabled = false;
                PassResetExpireTime = DefaultPasswordResetExpireTime;
            }
        }

        private sealed class EnvironmentNotConfiguredException : Exception { }

        private string? CheckedEnvironmentVariable(string name, string? defaultValue, string error = "", bool info = false)
        {
            var contents = Environment.GetEnvironmentVariable(name);
            if (contents is not null)
            {
                return contents;
            }

            if (info)
            {
                _logger.LogInformation("Environment variable: {Name} is not defined. {Error}", name, error);
            }
            else
            {
                _logger.LogError("Environment variable: {Name} is not defined. {Error}", name, error);
            }
            return defaultValue;
        }

        /// <summary> Determine if executing within a container (e.g. Docker). </summary>
        private static bool IsInContainer()
        {
            return Environment.GetEnvironmentVariable("COMBINE_IS_IN_CONTAINER") is not null;
        }

        private sealed class AdminUserCreationException : Exception { }

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
                    options.AddPolicy(LocalhostCorsPolicy,
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

            // The JWT key size must be at least 256 bits long.
            const int minKeyLength = 256 / 8;
            if (secretKey is null || secretKey.Length < minKeyLength)
            {
                _logger.LogError("Must set {EnvName} environment variable to string of length {MinLength} or longer.",
                    secretKeyEnvName, minKeyLength);
                throw new EnvironmentNotConfiguredException();
            }

            var key = ASCII.GetBytes(secretKey);
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

            services.AddControllersWithViews()
                // Required so that integer enum's can be passed in JSON as their descriptive string names, rather
                //  than by opaque integer values. This makes the OpenAPI schema much more expressive for
                //  integer enums. https://stackoverflow.com/a/55541764
                .AddJsonOptions(options =>
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

            services.AddSignalR();

            // Configure Swashbuckle OpenAPI generation.
            // https://docs.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-swashbuckle
            services.AddSwaggerGen();

            services.Configure<Settings>(
                options =>
                {
                    var connectionStringKey = IsInContainer() ? "ContainerConnectionString" : "ConnectionString";
                    options.ConnectionString = Configuration[$"MongoDB:{connectionStringKey}"]
                        ?? throw new EnvironmentNotConfiguredException();
                    options.CombineDatabase = Configuration["MongoDB:CombineDatabase"]
                        ?? throw new EnvironmentNotConfiguredException();

                    options.CaptchaEnabled = bool.Parse(CheckedEnvironmentVariable(
                        "COMBINE_CAPTCHA_REQUIRED",
                        "true",
                        "CAPTCHA should be explicitly required or not required.")!);
                    if (options.CaptchaEnabled)
                    {
                        options.CaptchaSecretKey = CheckedEnvironmentVariable(
                            "COMBINE_CAPTCHA_SECRET_KEY",
                            null,
                            "CAPTCHA secret key required.");
                        options.CaptchaVerifyUrl = CheckedEnvironmentVariable(
                            "COMBINE_CAPTCHA_VERIFY_URL",
                            null,
                            "CAPTCHA verification URL required.");
                    }

                    const string emailServiceFailureMessage = "Email services will not work.";
                    options.EmailEnabled = bool.Parse(CheckedEnvironmentVariable(
                        "COMBINE_EMAIL_ENABLED",
                        "false",
                        emailServiceFailureMessage,
                        true)!);
                    if (options.EmailEnabled)
                    {
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
                    }

                    options.PassResetExpireTime = int.Parse(CheckedEnvironmentVariable(
                        "COMBINE_PASSWORD_RESET_EXPIRE_TIME",
                        Settings.DefaultPasswordResetExpireTime.ToString(),
                        $"Using default value: {Settings.DefaultPasswordResetExpireTime}")!);
                });

            // Register concrete types for dependency injection

            // Banner types
            services.AddTransient<IBannerContext, BannerContext>();
            services.AddTransient<IBannerRepository, BannerRepository>();

            // CAPTCHA types
            services.AddTransient<ICaptchaContext, CaptchaContext>();
            services.AddTransient<ICaptchaService, CaptchaService>();

            // Email types
            services.AddTransient<IEmailContext, EmailContext>();
            services.AddTransient<IEmailService, EmailService>();
            services.AddTransient<IInviteService, InviteService>();

            // Lift Service - Singleton to avoid initializing the Sldr multiple times,
            // also to avoid leaking LanguageTag data
            services.AddSingleton<ILiftService, LiftService>();

            // Merge types
            services.AddTransient<IMergeBlacklistContext, MergeBlacklistContext>();
            services.AddTransient<IMergeGraylistContext, MergeGraylistContext>();
            services.AddTransient<IMergeBlacklistRepository, MergeBlacklistRepository>();
            services.AddTransient<IMergeGraylistRepository, MergeGraylistRepository>();
            services.AddSingleton<IMergeService, MergeService>();

            // Password Reset types
            services.AddTransient<IPasswordResetContext, PasswordResetContext>();
            services.AddTransient<IPasswordResetService, PasswordResetService>();

            // Permission types
            services.AddTransient<IPermissionService, PermissionService>();

            // Project types
            services.AddTransient<IProjectContext, ProjectContext>();
            services.AddTransient<IProjectRepository, ProjectRepository>();

            // Semantic Domain types
            services.AddSingleton<ISemanticDomainContext, SemanticDomainContext>();
            services.AddSingleton<ISemanticDomainRepository, SemanticDomainRepository>();

            // Speaker types
            services.AddTransient<ISpeakerContext, SpeakerContext>();
            services.AddTransient<ISpeakerRepository, SpeakerRepository>();

            // Statistics types
            services.AddSingleton<IStatisticsService, StatisticsService>();

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

            // OpenTelemetry
            services.AddHttpClient();
            services.AddMemoryCache();
            services.AddHttpContextAccessor();
            services.AddTransient<ILocationProvider, LocationProvider>();
            services.AddOpenTelemetryInstrumentation();
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
            // Apply CORS policy to all requests.
            app.UseCors(LocalhostCorsPolicy);

            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapDefaultControllerRoute();
                // Each MapHub<T> needs a unique T for the controllers to resolve the correct hub.
                endpoints.MapHub<ExportHub>($"/{ExportHub.Url}");
                endpoints.MapHub<MergeHub>($"/{MergeHub.Url}");
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

            // If an admin user has been created via the command line, treat that as a single action and shut the
            // server down so the calling script knows it's been completed successfully or unsuccessfully.
            var userRepo = app.ApplicationServices.GetService<IUserRepository>();
            if (userRepo is not null && CreateAdminUser(userRepo))
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
            if (existingUser is not null)
            {
                _logger.LogInformation(
                    "User {User} already exists. Updating password and granting admin permissions.", username);
                if (userRepo.ChangePassword(existingUser.Id, password).Result == ResultOfUpdate.NotFound)
                {
                    _logger.LogError("Failed to find user {User}.", username);
                    throw new AdminUserCreationException();
                }

                existingUser.IsAdmin = true;
                if (userRepo.Update(existingUser.Id, existingUser, true).Result == ResultOfUpdate.NotFound)
                {
                    _logger.LogError("Failed to find user {User}.", username);
                    throw new AdminUserCreationException();
                }

                return true;
            }

            _logger.LogInformation("Creating admin user: {User} ({Email}).", username, adminEmail);
            var user = new User { Username = username, Password = password, Email = adminEmail, IsAdmin = true };
            var returnedUser = userRepo.Create(user).Result;
            if (returnedUser is null)
            {
                _logger.LogError("Failed to create admin user {User} ({Email}).", username, adminEmail);
                throw new AdminUserCreationException();
            }

            return true;
        }
    }
}
