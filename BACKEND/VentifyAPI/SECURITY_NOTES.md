SECURITY NOTES - hiding DB credentials

This project is configured to not store database credentials in repository files.

- Production / Development: set the connection string using an environment variable named `MYSQL_CONN` or `ConnectionStrings__MySqlConnection`.
  Example (PowerShell):
    $env:MYSQL_CONN = "Server=localhost;Database=zona30;User=root;Password=YOUR_PASSWORD;"

- For local development use `dotnet user-secrets` instead of committing credentials:
    dotnet user-secrets init
    dotnet user-secrets set "ConnectionStrings:MySqlConnection" "Server=localhost;Database=zona30;User=root;Password=YOUR_PASSWORD;"

- Do NOT commit real passwords. Use `appsettings.json` without credentials and keep `appsettings.Development.json` out of source control.
