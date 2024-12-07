using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Brewtiful.Models;
using MongoDB.Driver;

namespace Brewtiful
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
                    Host.CreateDefaultBuilder(args)
                        .ConfigureWebHostDefaults(webBuilder =>
                        {
                            webBuilder.ConfigureKestrel(serverOptions =>
                            {
                                // Read the PORT environment variable, default to 8080 if not set
                                var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
                                serverOptions.ListenAnyIP(int.Parse(port));
                            })
                            .UseStartup<Startup>();
                        });
    }

}
