# TypeScriptファイルをコンパイル

echo Compiling npm sources (1/3)...
cd ../npm/ts
../../../node_modules/.bin/tsc

echo Compiling server sources (2/3)...
cd ../../server/ts
../../../node_modules/.bin/tsc

echo Compiling client sources (3/3)...
cd ../../web/ts
../../../node_modules/.bin/tsc

cd ../../shell