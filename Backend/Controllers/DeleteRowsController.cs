using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api")]
    public class DeleteRowsController : ControllerBase
    {
        private readonly IMongoCollection<BsonDocument> _collection;

        public class DeleteRowsRequest
        {
            public string? What { get; set; }
            public int Start { get; set; }
            public int End { get; set; }
        }

        public DeleteRowsController()
        {
            var mongoClient = new MongoClient("mongodb://localhost:27017");
            var database = mongoClient.GetDatabase("EmployeeDB");
            _collection = database.GetCollection<BsonDocument>("employeeinfo");
        }

        [HttpDelete("deleteRows")]
        public async Task<ActionResult> DeleteRows([FromBody] DeleteRowsRequest request)
        {
            var ops = request.What;
            var start = request.Start;
            var end = request.End;

            try
            {
                if (ops == "cols")
                {
                    // Deleting columns from 'start' to 'end'
                    var updates = new List<UpdateDefinition<BsonDocument>>();
                    for (int i = start; i <= end; i++)
                    {
                        updates.Add(Builders<BsonDocument>.Update.Unset($"c{i}"));
                    }
                    var update = Builders<BsonDocument>.Update.Combine(updates);
                    var result = await _collection.UpdateManyAsync(new BsonDocument(), update);
                    return Ok(new { deletedCount = result.ModifiedCount });
                }
                else if (ops == "rows")
                {
                    // Deleting rows from 'start' to 'end'
                    var filter = Builders<BsonDocument>.Filter.And(
                        Builders<BsonDocument>.Filter.Gte("1", start),
                        Builders<BsonDocument>.Filter.Lte("1", end)
                    );
                    var result = await _collection.DeleteManyAsync(filter);
                    return Ok(new { deletedCount = result.DeletedCount });
                }
                else
                {
                    return BadRequest(new { message = "Invalid operation type" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
