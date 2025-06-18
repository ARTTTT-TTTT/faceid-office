@echo off
echo Cleaning node_modules, lock files, and build caches...

REM .\scripts\windows\clean_packages.bat

set ROOT_DIR=%cd%
set CLIENT_DIR=%ROOT_DIR%\client
set SERVER_DIR=%ROOT_DIR%\server

call :clean_workspace "%ROOT_DIR%"
call :clean_workspace "%CLIENT_DIR%"
call :clean_workspace "%SERVER_DIR%"

echo All clean completed.
goto :eof

:clean_workspace
setlocal
set TARGET=%~1
echo Cleaning: %TARGET%

if exist "%TARGET%\node_modules" (
    rmdir /s /q "%TARGET%\node_modules"
)

if exist "%TARGET%\.next" (
    rmdir /s /q "%TARGET%\.next"
)

if exist "%TARGET%\.turbo" (
    rmdir /s /q "%TARGET%\.turbo"
)

if exist "%TARGET%\.cache" (
    rmdir /s /q "%TARGET%\.cache"
)

if exist "%TARGET%\dist" (
    rmdir /s /q "%TARGET%\dist"
)

del /f /q "%TARGET%\package-lock.json" >nul 2>&1
del /f /q "%TARGET%\pnpm-lock.yaml" >nul 2>&1
del /f /q "%TARGET%\yarn.lock" >nul 2>&1


echo Done: %TARGET%
echo.
endlocal
goto :eof
