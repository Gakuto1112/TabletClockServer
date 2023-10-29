# グローバルファイルをコピー

echo Copying global files...
rsync -a ../global/ ../server/ts/global/
rsync -a ../global/ ../web/ts/global/