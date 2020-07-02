using System;
using System.Text;
using BackendFramework.Contexts;
using BackendFramework.Interfaces;
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
using SIL.Lift.Parsing;

namespace BackendFramework
{
    public class Startup
    {
        private const string AllowedOrigins = "AllowAll";

        private readonly ILogger<Startup> _logger;

        public IConfiguration Configuration { get; }

        public Startup(ILogger<Startup> logger, IConfiguration configuration)
        {
            _logger = logger;
            Configuration = configuration;
        }

        public class Settings
        {
            public string ConnectionString { get; set; }
            public string CombineDatabase { get; set; }
            public string SmtpServer { get; set; }
            public int SmtpPort { get; set; }
            public string SmtpUsername { get; set; }
            public string SmtpPassword { get; set; }
            public string SmtpAddress { get; set; }
            public string FrontendUrl { get; set; }
        }

        private class EnvironmentNotConfiguredException : Exception
        {
        }

        /// <summary> Determine if executing within a container (e.g. Docker). </summary>
        private static bool IsInContainer()
        {
            return Environment.GetEnvironmentVariable("ASPNETCORE_IS_IN_CONTAINER") != null;
        }

        /// <summary> This method gets called by the runtime. Use this method to add services for dependency injection.
        /// </summary>
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy(AllowedOrigins,
                    builder => builder
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowAnyOrigin());
            });

            // Configure JWT Authentication
            const string secretKeyEnvName = "ASPNETCORE_JWT_SECRET_KEY";
            var secretKey = Environment.GetEnvironmentVariable(secretKeyEnvName);

            // The JWT key size must be at least 128 bits long.
            const int minKeyLength = 128 / 8;
            if (secretKey == null || secretKey.Length < minKeyLength)
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
                .AddNewtonsoftJson();
            services.Configure<Settings>(
            options =>
            {
                var connectionStringKey = IsInContainer() ? "ContainerConnectionString" : "ConnectionString";
                options.ConnectionString = Configuration[$"MongoDB:{connectionStringKey}"];
                options.CombineDatabase = Configuration["MongoDB:CombineDatabase"];
                options.SmtpServer = Configuration["Email:SmtpServer"];
                options.SmtpPort = int.Parse(Configuration["Email:SmtpPort"]);
                options.SmtpUsername = Configuration["Email:SmtpUsername"];
                options.SmtpPassword = Configuration["Email:SmtpPassword"];
                options.SmtpAddress = Configuration["Email:SmtpAddress"];
                options.FrontendUrl = Configuration["Frontend:Url"];
            });

            // Register concrete types for dependency injection
            // Word Types
            services.AddTransient<IWordContext, WordContext>();
            services.AddTransient<IWordService, WordService>();
            services.AddTransient<IWordRepository, WordRepository>();

            // User types
            services.AddTransient<IUserContext, UserContext>();
            services.AddScoped<IUserService, UserService>();
            services.AddTransient<IUserService, UserService>();

            // Lift types
            services.AddTransient<ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample>, LiftService>();

            // User edit types
            services.AddTransient<IUserEditContext, UserEditContext>();
            services.AddTransient<IUserEditService, UserEditService>();
            services.AddTransient<IUserEditRepository, UserEditRepository>();

            // User role types
            services.AddTransient<IUserRoleContext, UserRoleContext>();
            services.AddTransient<IUserRoleService, UserRoleService>();

            // Project types
            services.AddTransient<IProjectContext, ProjectContext>();
            services.AddTransient<IProjectService, ProjectService>();
            services.AddTransient<ISemDomParser, SemDomParser>();

            // Permission types
            services.AddTransient<IPermissionService, PermissionService>();

            // Email types
            services.AddTransient<IEmailService, EmailService>();
            services.AddTransient<IEmailContext, EmailContext>();

            // Password ResetTypes
            services.AddTransient<IPasswordResetContext, PasswordResetContext>();
            services.AddTransient<IPasswordResetService, PasswordResetService>();

            services.AddTransient<IFrontendContext, FrontendContext>();
        }

        /// <summary> This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        /// </summary>
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
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

            // In container deployment, NGINX acts as reverse proxy and handles HTTPS connections.
            if (!IsInContainer())
            {
                app.UseHttpsRedirection();
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
            });
        }
    }
}
