@echo off
setlocal

REM Always run git from this project folder
set "REPO_ROOT=c:\Dev\QuantRx"

cd /d "%REPO_ROOT%"
if not exist ".git" (
    echo ERROR: Not a git repository.
    echo Current directory: %CD%
    echo Expected: %REPO_ROOT%
    echo.
    echo Edit REPO_ROOT at the top of this script if the project is elsewhere.
    pause
    exit /b 1
)

set /p msg="Enter commit message: "
if "%msg%"=="" set "msg=Quick Update"

echo.
echo Adding all changes...
git add .
if errorlevel 1 (
    echo ERROR: git add failed.
    pause
    exit /b 1
)

echo Committing with message: %msg%
git commit -m "%msg%"
if errorlevel 1 (
    echo.
    echo NOTE: Commit failed. Common causes: nothing to commit, or merge in progress.
    echo Skipping push. Fix any issues and run again.
    pause
    exit /b 1
)

echo Pushing to remote...
git push
if errorlevel 1 (
    echo ERROR: git push failed. Check remote and branch.
    pause
    exit /b 1
)

echo.
echo Done. Changes committed and pushed.
pause
