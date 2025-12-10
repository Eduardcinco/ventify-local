using System;
using Microsoft.EntityFrameworkCore;
using VentifyAPI.Data;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using VentifyAPI.Services;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// MySQL Connection: prefer environment variable 'MYSQL_CONN' or 'ConnectionStrings__MySqlConnection'
var envConn = Environment.GetEnvironmentVariable("MYSQL_CONN") ?? Environment.GetEnvironmentVariable("ConnectionStrings__MySqlConnection");
var connectionString = !string.IsNullOrEmpty(envConn) ? envConn : builder.Configuration.GetConnectionString("MySqlConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Tenant context per-request
builder.Services.AddScoped<VentifyAPI.Services.ITenantContext, VentifyAPI.Services.TenantContext>();

builder.Services.AddControllers();

// Register token service
builder.Services.AddSingleton<ITokenService, TokenService>();

// Register PDF service
builder.Services.AddScoped<PdfService>();

// Register report services
builder.Services.AddScoped<ReporteExcelService>();
builder.Services.AddScoped<ReportePdfService>();
builder.Services.AddScoped<TicketService>();
// AI: OpenRouter proxy service
builder.Services.AddHttpClient("openrouter", client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
});
builder.Services.AddScoped<AiService>();

// Configure JWT Authentication
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? builder.Configuration["JWT_SECRET"];
var key = Encoding.UTF8.GetBytes(jwtSecret ?? "fallback_secret_please_configure");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // Permitir JWT desde cookie HttpOnly 'access_token' si no viene Authorization header
            if (string.IsNullOrEmpty(context.Token))
            {
                var cookieToken = context.Request.Cookies["access_token"];
                if (!string.IsNullOrEmpty(cookieToken))
                {
                    context.Token = cookieToken;
                }
            }
            return Task.CompletedTask;
        }
    };
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateLifetime = true
    };
});

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        var envOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS");
        string[] origins = new[] { "http://localhost:4200" };
        if (!string.IsNullOrWhiteSpace(envOrigins))
        {
            origins = envOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        }
        policy.WithOrigins(origins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Habilitar Swagger (opcional pero recomendado durante desarrollo)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "VentifyAPI", Version = "v1" });
});

var app = builder.Build();

// Migración automática desactivada para evitar errores si las tablas ya existen

// Configure EPPlus license context for NonCommercial usage (EPPlus 8+)
var epplusEnv = Environment.GetEnvironmentVariable("EPPlusLicenseContext");
if (string.IsNullOrWhiteSpace(epplusEnv))
{
    Environment.SetEnvironmentVariable("EPPlusLicenseContext", "NonCommercial");
}

// Usar CORS ANTES de MapControllers
app.UseCors("CorsPolicy");

// Swagger visual para probar endpoints
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
// Tenant middleware: must run after authentication so claims are available
app.UseMiddleware<VentifyAPI.Middleware.TenantMiddleware>();
app.UseAuthorization();

// Servir archivos estáticos (wwwroot) para foto de perfil y otros assets
app.UseStaticFiles();

// Middleware para validar tokenVersion en cada request autenticado
app.Use(async (context, next) =>
{
    // Si no hay usuario autenticado, continuar
    var user = context.User;
    if (user?.Identity?.IsAuthenticated != true)
    {
        await next();
        return;
    }

    try
    {
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var tokenVersionClaim = user.FindFirst("tokenVersion")?.Value;
        if (!string.IsNullOrEmpty(userIdClaim) && !string.IsNullOrEmpty(tokenVersionClaim) && int.TryParse(userIdClaim, out var uid) && int.TryParse(tokenVersionClaim, out var tokenVer))
        {
            using var scopeMw = app.Services.CreateScope();
            var db = scopeMw.ServiceProvider.GetRequiredService<AppDbContext>();
            var dbUser = await db.Usuarios.FindAsync(uid);
            if (dbUser != null && dbUser.TokenVersion != tokenVer)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsJsonAsync(new { message = "Sesión inválida. Por favor inicie sesión nuevamente." });
                return;
            }
        }
    }
    catch
    {
        // En caso de error silencioso, continuar
    }

    await next();
});

app.MapControllers();

app.Run();
