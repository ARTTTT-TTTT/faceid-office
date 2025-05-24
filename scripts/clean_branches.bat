@echo off
setlocal EnableDelayedExpansion

REM .\scripts\clean_branches.bat

git remote prune origin

for /f "delims=" %%A in ('git branch --show-current') do set CURRENT=%%A

for /f "tokens=* delims= " %%A in ('git branch -r') do (
    set "line=%%A"
    call set "line=%%line:origin/=%%"
    echo !line!>> remote.tmp
)

for /f "tokens=* delims= " %%B in ('git branch') do (
    set "branch=%%B"
    set "branch=!branch:~2!"
    if not "!branch!"=="%CURRENT%" if not "!branch!"=="main" (
        findstr /x /c:"!branch!" remote.tmp >nul
        if errorlevel 1 (
            echo Deleting local branch "!branch!" as it no longer exists on origin
            git branch -D "!branch!"
        )
    )
)

del remote.tmp
echo Done.
pause
