@echo off

rem ローバルファイルをコピー
echo Copying global files...
xcopy ..\global\ ..\server\ts\global\ /S /Y
xcopy ..\global\ ..\web\ts\global\ /S /Y