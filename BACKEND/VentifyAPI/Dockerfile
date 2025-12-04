# Dockerfile for VentifyAPI (ASP.NET Core)
# Use official .NET SDK image for build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY . .
RUN dotnet restore "VentifyAPI.csproj"
RUN dotnet publish "VentifyAPI.csproj" -c Release -o /out

# Use official .NET runtime image for production
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out .

# Expose default port
EXPOSE 80

# Environment variables for Azure (set in portal, not here)
# ENV MYSQL_CONN=""
# ENV JWT_SECRET=""
# ENV ALLOWED_ORIGINS=""

ENTRYPOINT ["dotnet", "VentifyAPI.dll"]
