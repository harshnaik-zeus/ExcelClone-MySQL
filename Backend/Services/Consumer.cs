using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

public class ConsumerService
{
    private readonly IModel _channel;
    private readonly IMongoCollection<BsonDocument> _collection;

    public ConsumerService(IModel channel, string mongoConnectionString)
    {
        _channel = channel;

        // Initialize MongoDB client and collection
        var mongoClient = new MongoClient(mongoConnectionString);
        var database = mongoClient.GetDatabase("EmployeeDB");
        _collection = database.GetCollection<BsonDocument>("employeeinfo");
    }

    public void StartConsuming()
    {
        var consumer = new EventingBasicConsumer(_channel);
        consumer.Received += async (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            var lines = message.Split('\n');

            var documents = new List<BsonDocument>();

            foreach (var line in lines)
            {
                var values = line.Split(',');
                if (values.Length >= 14)
                {
                    // Try to parse the first value as an integer
                    if (int.TryParse(values[0], out int id))
                    {
                        var document = new BsonDocument
                        {
                            { "1", id },
                            { "2", values[1] },
                            { "3", values[2] },
                            { "4", values[3] },
                            { "5", values[4] },
                            { "6", values[5] },
                            { "7", values[6] },
                            { "8", values[7] },
                            { "9", values[8] },
                            { "10", values[9] },
                            { "11", values[10] },
                            { "12", values[11] },
                            { "13", values[12] },
                            { "14", values[13] },
                            // { "15", values[14] }
                        };
                        // System.Console.WriteLine(values[1]);
                        documents.Add(document);
                    }
                }
            }

            if (documents.Count > 0)
            {
                await _collection.InsertManyAsync(documents);
            }
            System.Console.WriteLine("got chunk");
        };

        _channel.BasicConsume(queue: "csv_queue", autoAck: true, consumer: consumer);
    }
}
