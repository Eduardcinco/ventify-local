# capture-endpoint-error.ps1
# Captura errores de cualquier endpoint para análisis rápido
param(
  [Parameter(Mandatory=$true)]
  [string]$Method,  # GET, POST, PUT, DELETE
  
  [Parameter(Mandatory=$true)]
  [string]$Endpoint, # Ej: /api/productos, /api/clientes/123
  
  [string]$BaseUrl = "http://localhost:5129",
  
  [string]$Token = "",  # JWT access token (opcional para endpoints protegidos)
  
  [string]$BodyJson = ""  # JSON body para POST/PUT (opcional)
)

$logsDir = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\logs"))
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$url = "$BaseUrl$Endpoint"

$headers = @{
  "Content-Type" = "application/json"
}

if ($Token -ne "") {
  $headers["Authorization"] = "Bearer $Token"
}

Write-Host "$Method $url" -ForegroundColor Cyan

try {
  $params = @{
    Uri = $url
    Method = $Method
    Headers = $headers
    ErrorAction = "Stop"
  }
  
  if ($BodyJson -ne "" -and ($Method -eq "POST" -or $Method -eq "PUT" -or $Method -eq "PATCH")) {
    $params["Body"] = $BodyJson
  }
  
  $resp = Invoke-WebRequest @params
  $outPath = Join-Path $logsDir "success-$Method-$ts.txt"
  $output = "URL: $url`nMethod: $Method`nStatus: $($resp.StatusCode)"
  
  if ($BodyJson -ne "") {
    $output += "`nRequest Body:`n$BodyJson"
  }
  
  $output += "`nResponse:`n$($resp.Content)"
  $output | Out-File -FilePath $outPath -Encoding UTF8
  
  Write-Host "✓ Success - guardado: $outPath" -ForegroundColor Green
  
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
  
  $outPath = Join-Path $logsDir "error-$Method-$status-$ts.txt"
  $output = "URL: $url`nMethod: $Method`nStatus: $status"
  
  if ($BodyJson -ne "") {
    $output += "`nRequest Body:`n$BodyJson"
  }
  
  $output += "`nResponse:`n$errBody`n`nException:`n$($webEx.Message)"
  $output | Out-File -FilePath $outPath -Encoding UTF8
  
  Write-Host "✗ Error $status - guardado: $outPath" -ForegroundColor Red
}
