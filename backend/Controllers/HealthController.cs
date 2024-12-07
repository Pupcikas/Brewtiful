using Microsoft.AspNetCore.Mvc;

namespace Brewtiful.Controllers
{
    [ApiController]
    [Route("health")]
    public class HealthController : ControllerBase
    {
        /// <summary>
        /// GET /health
        /// Simple endpoint to check if the service is running.
        /// </summary>
        /// <returns>A message indicating the service status.</returns>
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { Status = "Service is running" });
        }
    }
}
