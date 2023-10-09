@echo off

call ..\..\node_modules\.bin\tsc

if %errorlevel% neq 0 (
    exit /b
)

xcopy .\js\web\ts\ .\js\ /S /Y
rd .\js\web\ /s /q