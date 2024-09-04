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
    public class DeleteCellsController : ControllerBase
    {
        private readonly IMongoCollection<BsonDocument> _collection;

        public DeleteCellsController()
        {
            var mongoClient = new MongoClient("mongodb://localhost:27017");
            var database = mongoClient.GetDatabase("EmployeeDB");
            _collection = database.GetCollection<BsonDocument>("employeeinfo");
        }

        [HttpDelete("deleteCells")]
        public async Task<ActionResult> DeleteCells(
            [FromQuery] int r1 = 0,
            [FromQuery] int c1 = 0,
            [FromQuery] int r2 = 0,
            [FromQuery] int c2 = 0
        )
        {
            try
            {
                // Filter to specify rows to update
                var Mydb = Builders<BsonDocument>.Filter;
                var filter = Mydb.And(Mydb.Gte("1", r1), Mydb.Lte("1", r2));

                // List to hold update operations
                var updateDefinitions = new List<UpdateDefinition<BsonDocument>>();

                // Add Unset operations for each column in the range
                for (int i = c1; i <= c2; i++)
                {
                    updateDefinitions.Add(Builders<BsonDocument>.Update.Unset($"{i}"));
                }

                // Combine all Unset operations into a single update definition
                var update = Builders<BsonDocument>.Update.Combine(updateDefinitions);

                // Apply the update to all matching documents
                var result = await _collection.UpdateManyAsync(filter, update);

                return Ok(
                    new { matchedCount = result.MatchedCount, modifiedCount = result.ModifiedCount }
                );
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
