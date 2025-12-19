using System;
using Microsoft.EntityFrameworkCore;
using VentifyAPI.Data;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using VentifyAPI.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

using VentifyAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// MySQL Connection
var envConn = Environment.GetEnvironmentVariable("MYSQL_CONN") ?? Environment.GetEnvironmentVariable("ConnectionStrings__MySqlConnection");
var connectionString = !string.IsNullOrEmpty(envConn) ? envConn : builder.Configuration.GetConnectionString("MySqlConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddHttpContextAccessor(); // Necesario para acceder al HttpContext en el fallback

// TenantContext con fallback seguro (evita el error en Railway)
builder.Services.AddScoped<VentifyAPI.Services.ITenantContext>(sp =>
{
    var httpContextAccessor = sp.GetService<IHttpContextAccessor>();
    if (httpContextAccessor?.HttpContext?.Items.TryGetValue("TenantId", out var tenantIdObj) == true &&
        tenantIdObj is int tenantId)
    {
        return new TenantContext { NegocioId = tenantId };
    }

    // Fallback: tenant 1 cuando no hay contexto de request (startup, Railway, etc.)
    return new TenantContext { NegocioId = 1 };
});

builder.Services.AddControllers();

// Register services
builder.Services.AddSingleton<ITokenService, TokenService>();
builder.Services.AddScoped<PdfService>();
builder.Services.AddScoped<ReporteExcelService>();
builder.Services.AddScoped<ReportePdfService>();
builder.Services.AddScoped<TicketService>();

builder.Services.AddHttpClient("openrouter", client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
});
builder.Services.AddScoped<AiService>();

// JWT Authentication
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

// CORS (ya tienes ALLOWED_ORIGINS con tu Netlify, así que funciona)
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

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "VentifyAPI", Version = "v1" });
});

var app = builder.Build();

// EPPlus license
var epplusEnv = Environment.GetEnvironmentVariable("EPPlusLicenseContext");
if (string.IsNullOrWhiteSpace(epplusEnv))
{
    Environment.SetEnvironmentVariable("EPPlusLicenseContext", "NonCommercial");
}

app.UseCors("CorsPolicy");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseMiddleware<VentifyAPI.Middleware.TenantMiddleware>();
app.UseAuthorization();
app.UseStaticFiles();

// Middleware de validación de tokenVersion
app.Use(async (context, next) =>
{
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
        if (!string.IsNullOrEmpty(userIdClaim) && !string.IsNullOrEmpty(tokenVersionClaim) &&
            int.TryParse(userIdClaim, out var uid) && int.TryParse(tokenVersionClaim, out var tokenVer))
        {
            using var scopeMw = app.Services.CreateScope();
            var db = scopeMw.ServiceProvider.GetRequiredService<AppDbContext>();
            var dbUser = await db.Set<Usuario>().FindAsync(uid);
            if (dbUser != null && dbUser.TokenVersion != tokenVer)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsJsonAsync(new { message = "Sesión inválida. Por favor inicie sesión nuevamente." });
                return;
            }
        }
    }
    catch { /* silencioso */ }

    await next();
});

app.MapControllers();

app.Run();