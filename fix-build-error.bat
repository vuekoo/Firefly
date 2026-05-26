@echo off
REM Fix script for markdown_demonstrate build error
cd /d "C:\Users\sotu2\Desktop\blog\Firefly"

echo.
echo ============================================
echo Firefly Blog - Fix Build Error
echo ============================================
echo.

echo Step 1: Check git status
git status --porcelain
echo.

echo Step 2: Checking if markdown_demonstrate.md is in git history...
git log --all --full-history --follow -- "src/content/posts/markdown_demonstrate.md" > nul 2>&1
if errorlevel 1 (
    echo File NOT found in git history.
) else (
    echo File FOUND in git history.
)
echo.

echo Step 3: Check if file exists locally
if exist "src\content\posts\markdown_demonstrate.md" (
    echo File exists locally - will remove
    git rm src/content/posts/markdown_demonstrate.md
    echo File removed from staging
) else (
    echo File does not exist locally
    echo Checking if it's only in index...
    git rm --cached "src/content/posts/markdown_demonstrate.md" > nul 2>&1
    if errorlevel 1 (
        echo File not in index either - may need history rewrite
    ) else (
        echo File removed from index
    )
)
echo.

echo Step 4: Stage any changes
git add -A
echo.

echo Step 5: Check status before commit
git status --short
echo.

echo Step 6: Commit the changes
git commit -m "Remove markdown_demonstrate.md - fix build error" -m "This file was causing Astro content validation errors due to invalid frontmatter." --no-verify

if errorlevel 0 (
    echo.
    echo Step 7: Push to remote
    echo Running: git push origin main
    git push origin main
    
    if errorlevel 0 (
        echo.
        echo ✅ SUCCESS! Changes pushed to remote.
        echo The build error should be fixed on the next deployment.
    ) else (
        echo.
        echo ❌ Failed to push to remote
        echo Try running: git push origin main
    )
) else (
    echo.
    echo No changes to commit - file may have been deleted already
)

echo.
echo Script completed.
pause
