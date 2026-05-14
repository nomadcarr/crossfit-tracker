@echo off
echo === Инсталиране на CrossFit Tracker ===
echo.
cd /d "%~dp0"
echo Инсталиране на root пакети...
call npm install
echo.
echo Инсталиране на server пакети...
cd server
call npm install
cd ..
echo.
echo Инсталиране на client пакети...
cd client
call npm install
cd ..
echo.
echo === Готово! ===
echo Стартирай с: start.bat
pause
