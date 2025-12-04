using System.Security.Claims;
using System.Linq;
using System;
using VentifyAPI.Services;
using Microsoft.AspNetCore.Http;

namespace VentifyAPI.Middleware
{
    public class TenantMiddleware
    {
        private readonly RequestDelegate _next;

        // Rutas públicas que no requieren claim negocioId (login, register, swagger, health, dev tools)
        private static readonly string[] _publicPaths = new[]
        {
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/api/auth/logout",
            "/api/auth/empleado",
            "/swagger",
            "/swagger/index.html",
            "/swagger/v1/swagger.json",
            "/health",
            "/favicon.ico",
            "/api/usuarios/dev/reset-password"
        };

        public TenantMiddleware(RequestDelegate next) => _next = next;

        public async Task InvokeAsync(HttpContext ctx, ITenantContext tenant)
        {
            if (ctx.User?.Identity?.IsAuthenticated == true)
            {
                // Extraer negocioId del token
                var negocioClaim = ctx.User.FindFirst("negocioId")?.Value;
                if (int.TryParse(negocioClaim, out var nId))
                    tenant.NegocioId = nId;

                // Extraer userId
                var userClaim = ctx.User.FindFirst("userId")?.Value
                                ?? ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userClaim, out var uId))
                    tenant.UserId = uId;

                // Extraer rol
                tenant.Rol = ctx.User.FindFirst("rol")?.Value
                             ?? ctx.User.FindFirst(ClaimTypes.Role)?.Value;
            }

            // Si la ruta es pública, permitir aunque no exista negocioId (ej: login, register)
            var path = ctx.Request.Path.HasValue ? ctx.Request.Path.Value! : string.Empty;
            var isPublic = _publicPaths.Any(p => path.StartsWith(p, StringComparison.OrdinalIgnoreCase));

            if (!isPublic && tenant.NegocioId == null)
            {
                ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await ctx.Response.WriteAsync("Falta claim negocioId");
                return;
            }

            await _next(ctx);
        }
    }
}
