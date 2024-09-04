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
    public class PasteDataController : ControllerBase
    {
        private readonly IMongoCollection<BsonDocument> _collection;

        public PasteDataController()
        {
            var mongoClient = new MongoClient("mongodb://localhost:27017");
            var database = mongoClient.GetDatabase("EmployeeDB");
            _collection = database.GetCollection<BsonDocument>("employeeinfo");
        }

        public class PasteDataRequest
        {
            public List<List<string>> Data { get; set; }
            public int Row { get; set; }
            public int Col { get; set; }
        }

        [HttpPost("PasteData")]
        public async Task<ActionResult> PasteData([FromBody] PasteDataRequest request)
        {
            List<List<string>> data = request.Data;
            int row = request.Row;
            int col = request.Col;
            try
            {
                return Ok(new { Status = true, RowsAffected = request.Data.Count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            finally
            {
                if (connection.State == System.Data.ConnectionState.Open)
                {
                    await connection.CloseAsync();
                }
            }
        }
    }
}
