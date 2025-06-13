@echo off
setlocal EnableDelayedExpansion

REM .\scripts\windows\generate_config.bat

for /f "usebackq delims=" %%A in (".env") do (
    set "line=%%A"
    echo !line! | findstr /b /v "#" >nul
    if not errorlevel 1 (
        for /f "tokens=1,2 delims==" %%B in ("!line!") do (
            set "%%B=%%C"
        )
    )
)

echo Generating livekit.yaml...
(
  for /f "delims=" %%L in (livekit.yaml.template) do (
    set "line=%%L"
    call set "line=%%line:${TURN_SECRET}=%TURN_SECRET%%%"
    echo !line!
  )
) > livekit.yaml

echo Generating turnserver.conf...
(
  for /f "delims=" %%L in (turnserver.conf.template) do (
    set "line=%%L"
    call set "line=%%line:${TURN_SECRET}=%TURN_SECRET%%%"
    echo !line!
  )
) > turnserver.conf

echo Done.
pause
