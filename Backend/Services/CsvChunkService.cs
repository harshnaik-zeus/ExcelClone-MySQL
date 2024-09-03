using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using CsvHelper;
using MySql.Data.MySqlClient;

public class CsvChunkService
{
    private readonly int _chunkSize;

    public CsvChunkService(int chunkSize)
    {
        _chunkSize = chunkSize;
    }

    public List<string> GetChunk(string filePath, int chunkIndex)
    {
        var chunk = new List<string>();
        var startLine = chunkIndex * _chunkSize;

        using (var reader = new StreamReader(filePath))
        using (
            var csv = new CsvReader(
                reader,
                new CsvHelper.Configuration.CsvConfiguration(CultureInfo.InvariantCulture)
            )
        )
        {
            csv.Read();
            for (int i = 0; i < startLine && csv.Read(); i++) { }

            while (csv.Read() && chunk.Count < _chunkSize)
            {
                startLine++;
                var row = csv.Parser.Record;
                var list = new List<string>();
                list.Add(startLine.ToString());
                foreach (var item in row)
                {
                    list.Add(item);
                }
                chunk.Add(string.Join(",", list));
            }
        }

        return chunk;
    }

    // public async void GetChunkCount(string filePath)
    // {
    //     int lineCount = 0;

    //     using (var reader = new StreamReader(filePath))
    //     {
    //         while (reader.ReadLine() != null)
    //         {
    //             lineCount++;
    //         }
    //     }

    //     var chunkstotal = lineCount / _chunkSize;

    //     var connectionString =
    //         "Server=localhost;User ID=root;Password=Interstellar@2014;Database=employeedb";
    //     var dbConnection = new MySqlConnection(connectionString);

    //     await dbConnection.OpenAsync();

    //     var query =
    //         $"DELETE FROM employeedb.chunkinfo; INSERT INTO employeedb.chunkinfo (totalchunks) VALUES('{chunkstotal}');";
    //     var command = new MySqlCommand(query, dbConnection);

    //     var rowsAffected = command.ExecuteNonQuery();

    //     await dbConnection.CloseAsync();
    // }
}
