using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BackendFramework.Context;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace BackendFramework
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public class Settings
        {
            public string ConnectionString { get; set; }
            public string WordsDatabase { get; set; }
            public string UsersDatabase { get; set; }
            public string UserRolesDatabase { get; set; }
            public string ProjectsDatabase { get; set; }
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    builder => builder
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowAnyOrigin());
            });

            // configure strongly typed settings objects
            var appSettingsSection = Configuration.GetSection("AppSettings");
            services.Configure<AppSettings>(appSettingsSection);

            // configure jwt authentication
            var appSettings = appSettingsSection.Get<AppSettings>();
            var key = Encoding.ASCII.GetBytes(appSettings.Secret);
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

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
            services.Configure<Settings>(
            options =>
            {
                options.ConnectionString = Configuration.GetSection("MongoDB:ConnectionString").Value;
                options.WordsDatabase = Configuration.GetSection("MongoDB:WordsDatabase").Value;
                options.UsersDatabase = Configuration.GetSection("MongoDB:UsersDatabase").Value;
                options.ProjectsDatabase = Configuration.GetSection("MongoDB:ProjectsDatabase").Value;
                options.UserRolesDatabase = Configuration.GetSection("MongoDB:UserRolesDatabase").Value;
              

            });

            services.AddTransient<IWordContext, WordContext>();
            services.AddTransient<IWordService, WordService>();
            services.AddTransient<IUserContext, UserContext>();
            services.AddTransient<IUserService, UserService>();
            services.AddTransient<IUserRoleContext, UserRoleContext>();
            services.AddTransient<IUserRoleService, UserRoleService>();
            services.AddTransient<IProjectContext, ProjectContext>();
            services.AddTransient<IProjectService, ProjectService>();

            services.AddScoped<IUserService, UserService>();

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseCors(builder =>
                builder
                    .AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod());

            app.UseAuthentication();

            app.UseMvc();
        }
    }
}
