../../node_modules/.bin/tsc

rsync -a ./js/web/ts/* ./js
rm -r ./js/web/