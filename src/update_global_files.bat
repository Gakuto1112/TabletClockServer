@echo off

rem ローバルファイルをコピー
xcopy .\global\ .\server\global\ /S /Y
xcopy .\global\ .\web\ts\global\ /S /Y