param(
  [string]$BaseUrl = "http://localhost:5129",
  [string]$Nombre = "Prueba Nombre",
  [string]$Correo = "prueba@example.com",
  [string]$Password = "P@ssw0rd!",
  [string]$Path = "/api/auth/register"
)

# Resolve logs directory relative to this script (../logs)
$logsDir = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\logs"))
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$url = "$BaseUrl$Path"

$bodyObj = @{ nombre = $Nombre; correo = $Correo; password = $Password }
$bodyJson = $bodyObj | ConvertTo-Json -Depth 5

Write-Host "POST $url" -ForegroundColor Cyan

try {
  $resp = Invoke-WebRequest -Uri $url -Method POST -ContentType "application/json" -Body $bodyJson -ErrorAction Stop
  $outPath = Join-Path $logsDir "register-success-$ts.txt"
  "URL: $url`nStatus: $($resp.StatusCode)`nRequest:`n$bodyJson`nResponse:`n$($resp.Content)" | Out-File -FilePath $outPath -Encoding UTF8
  Write-Host "Guardado: $outPath" -ForegroundColor Green
} catch {
  $webEx = $_.Exception
  $status = "(sin status)"
  $errBody = "(sin body)"
  if ($webEx.Response) {
    try {
      $status = [int]$webEx.Response.StatusCode
    } catch {}
    try {
      $reader = New-Object System.IO.StreamReader($webEx.Response.GetResponseStream())
      $errBody = $reader.ReadToEnd()
      $reader.Close()
    } catch {}
  }
  $outPath = Join-Path $logsDir "register-400-$ts.txt"
  "URL: $url`nStatus: $status`nRequest:`n$bodyJson`nResponse:`n$errBody" | Out-File -FilePath $outPath -Encoding UTF8
  Write-Host "Guardado: $outPath" -ForegroundColor Yellow
}