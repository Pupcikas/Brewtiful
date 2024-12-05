using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MongoDB.Driver;
using Microsoft.AspNetCore.Http;
using FluentValidation;
using System.Text.Json.Serialization;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.Logging;

namespace Brewtiful
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<JwtSettings>(Configuration.GetSection("Jwt"));
            var jwtSettings = Configuration.GetSection("Jwt").Get<JwtSettings>();
            var key = Encoding.UTF8.GetBytes(jwtSettings.Key);

            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend",
                 builder => builder
                .WithOrigins("http://localhost:3000") // Replace with your frontend's origin
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials());
            });

            // Enable controller services
            services.AddControllers();

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    ValidateLifetime = true,

                };
                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        Console.WriteLine("Authentication failed: " + context.Exception.Message);
                        return Task.CompletedTask;
                    }
                };
                options.IncludeErrorDetails = true;
            });
            services.AddAuthorization();


            // MongoDB setup - register the MongoClient
            services.AddSingleton<IMongoClient>(serviceProvider =>
            {
                var connectionString = Configuration.GetConnectionString("MongoDb");
                return new MongoClient(connectionString);
            });

            // Create and register the MongoDB database instance for dependency injection
            services.AddScoped<IMongoDatabase>(serviceProvider =>
            {
                var client = serviceProvider.GetRequiredService<IMongoClient>();
                var databaseName = Configuration["MongoDatabase"];
                return client.GetDatabase(databaseName);
            });

            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });


            // Enable HTTP Context Access to use session in controllers
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            // Register validators
            services.AddValidatorsFromAssemblyContaining<UserValidator>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {

            if (!env.IsDevelopment())
            {
                app.UseHsts();
                app.UseHttpsRedirection();
            }

            app.UseStaticFiles(); // Serve static files (if you have any, like images or frontend code)

            app.UseRouting(); // Enable endpoint routing

            app.UseCors("AllowFrontend"); // Apply CORS policy

            app.UseAuthentication(); // Enable JWT Authentication
            app.UseAuthorization(); // Handle authorization logic (if needed)

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers(); // Map controller routes to handle API requests
            });

            // In Startup.cs or Program.cs
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

        }
    }
}
