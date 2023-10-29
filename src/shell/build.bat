@echo off

rem TypeScriptファイルをコンパイル
echo Compiling npm sources (1/3)...
cd ..\npm\ts
call ..\..\..\node_modules\.bin\tsc

echo Compiling server sources (2/3)...
cd ..\..\server\ts
call ..\..\..\node_modules\.bin\tsc

echo Compiling client sources (3/3)...
cd ..\..\web\ts
call ..\..\..\node_modules\.bin\tsc

cd ..\..\shell