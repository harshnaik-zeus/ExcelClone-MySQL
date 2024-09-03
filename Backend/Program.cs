using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;

public class Program
{
    public static void Main(string[] args)
    {
        var host = CreateHostBuilder(args).Build();
        host.Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            });
}

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // Configuration
        var chunkSize = 5000;
        var mongoConnectionString = "mongodb://localhost:27017";

        // Register RabbitMQ services
        services.AddSingleton<IConnectionFactory>(sp => new ConnectionFactory()
        {
            HostName = "localhost",
        });
        services.AddSingleton(sp =>
        {
            var factory = sp.GetRequiredService<IConnectionFactory>();
            return factory.CreateConnection();
        });
        services.AddSingleton(sp =>
        {
            var connection = sp.GetRequiredService<IConnection>();
            return connection.CreateModel();
        });

        // Register custom services
        services.AddSingleton<CsvChunkService>(sp => new CsvChunkService(chunkSize));
        services.AddSingleton<ProducerService>();
        services.AddSingleton<ConsumerService>(sp => new ConsumerService(
            sp.GetRequiredService<IModel>(),
            mongoConnectionString
        ));

        // Register the worker as a hosted service
        services.AddHostedService<Worker>();

        // Add controllers
        services.AddControllers();

        services.AddCors(options =>
        {
            options.AddPolicy(
                "AllowAllOrigins",
                builder =>
                {
                    builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
                }
            );
        });
    }

    public void Configure(IApplicationBuilder app, IHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseRouting();
        app.UseCors("AllowAllOrigins");

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}

public class Worker : BackgroundService
{
    private readonly ProducerService _producerService;
    private readonly ConsumerService _consumerService;

    public Worker(ProducerService producerService, ConsumerService consumerService)
    {
        _producerService = producerService;
        _consumerService = consumerService;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.CompletedTask;
    }
}
