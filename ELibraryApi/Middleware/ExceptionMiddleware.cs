using System.Net;
using System.Text.Json;

namespace ELibraryApi.Middleware
{
    // Centralised error handler - every unhandled exception becomes a clean JSON payload
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;     // Next middleware in pipeline
        private readonly ILogger<ExceptionMiddleware> _logger;  // Logger for server side tracing

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        // Called once per request
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);   // Continue the pipeline
            }
            catch (Exception ex)
            {
                // Logs full exception so you can debug from server logs
                _logger.LogError(ex, "Unhandled exception while processing {Path}", context.Request.Path);

                // Prepare the standardised JSON response
                context.Response.ContentType = "application/json";      // JSON content type
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError; // 500

                // Build a predictable shape the React client can always parse
                var payload = new
                {
                    statusCode = context.Response.StatusCode, // 500
                    message = ex.Message,       // Human message
                    detail = ex.InnerException?.Message // Inner expression if presents
                };

                // Write JSON - camelCase so JS reads it naturally
                var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });


                await context.Response.WriteAsync(json);    // Send to client
            }
        }
    }
}