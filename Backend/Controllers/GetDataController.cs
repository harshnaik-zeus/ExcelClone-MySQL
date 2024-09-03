using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api")]
    public class GetDataController : ControllerBase
    {
        private readonly IMongoCollection<BsonDocument> _collection;

        public GetDataController()
        {
            var mongoClient = new MongoClient("mongodb://localhost:27017");
            var database = mongoClient.GetDatabase("EmployeeDB");
            _collection = database.GetCollection<BsonDocument>("employeeinfo");
        }

        [HttpGet("getPageData")]
        public async Task<ActionResult> GetPageData([FromQuery] int id = 0)
        {
            try
            {
                var filter = Builders<BsonDocument>.Filter.Empty;
                var sort = Builders<BsonDocument>.Sort.Ascending("1");

                var result = await _collection
                    .Find(filter)
                    .Sort(sort)
                    .Skip(id)
                    .Limit(100)
                    .ToListAsync();

                var formattedResult = new List<Dictionary<string, object>>();
                foreach (var document in result)
                {
                    var row = new Dictionary<string, object>();
                    var elements = document.Elements;
                    for (int i = 0; i < elements.Count() - 1; i++)
                    {
                        var element = elements.ElementAt(i);
                        row[element.Name] = element.Value.ToString();
                    }
                    formattedResult.Add(row);
                }

                return Ok(formattedResult);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
