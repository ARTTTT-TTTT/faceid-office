# * [CMD] powershell.exe -ExecutionPolicy Bypass -File "prisma\apply-sql.ps1"
# * [PS] .\prisma\apply-sql.ps1

Get-Content .env | Where-Object { $_ -notmatch '^#' -and $_ -match '=' } | ForEach-Object {
    $name, $value = $_.split('=', 2)
    Set-Item -Path "env:$name" -Value $value
}

$finalUrl = $env:POSTGRES_URL

if ($finalUrl -match '\$\{.*\}') {
    $matches = [regex]::Matches($finalUrl, '\$\{(.*?)\}')
    foreach ($match in $matches) {
        $varName = $match.Groups[1].Value
        $varValue = Get-Item -Path "env:$varName" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Value
        if ($varValue) {
            $finalUrl = $finalUrl.Replace($match.Value, $varValue)
        }
    }
}

Write-Output "Connecting to PostgreSQL: $finalUrl"

# * Apply triggers
psql -d "$finalUrl" -f prisma/sql/triggers/apply-triggers.sql

if ($LASTEXITCODE -eq 0) {
    Write-Output "[OK] SQL applied successfully"
} else {
    Write-Output "[FAIL] Failed to apply SQL"
    exit 1
}