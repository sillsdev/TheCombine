﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Context;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

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
            public string NamesCollectionLanguage { get; set; }
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

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
            services.Configure<Settings>(
        options =>
        {
            options.ConnectionString = Configuration.GetSection("MongoDB:ConnectionString").Value;
            options.WordsDatabase = Configuration.GetSection("MongoDB:WordsDatabase").Value;
            options.UsersDatabase = Configuration.GetSection("MongoDB:UsersDatabase").Value;
            options.UserRolesDatabase = Configuration.GetSection("MongoDB:UserRolesDatabase").Value;
            options.NamesCollectionLanguage = Configuration.GetSection("MongoDB:NamesCollectionLanguage").Value;
        });
            services.AddTransient<IWordContext, WordContext>();
            services.AddTransient<IWordService, WordService>();
            services.AddTransient<IUserContext, UserContext>();
            services.AddTransient<IUserService, UserService>();
            services.AddTransient<IUserRoleContext, UserRoleContext>();
            services.AddTransient<IUserRoleService, UserRoleService>();
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
            app.UseMvc();
        }
    }
}
