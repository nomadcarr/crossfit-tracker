@echo off
title CrossFit Tracker
echo.
echo  ==============================
echo   CrossFit Tracker
echo  ==============================
echo.
cd /d "%~dp0"
echo  Стартиране на сървъра...
echo  Приложението ще се отвори на:
echo  http://localhost:3001
echo.
echo  За да спреш: затвори този прозорец
echo.
node server/index.js
