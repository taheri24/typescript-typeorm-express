const config = require('./launch-config');
const path = require('path');
const targetDir = path.join(process.cwd(), 'build');
const chokidar = require('chokidar');
let occured=false;
function restartWindowService(){
    console.log('TODO: Restart Window Service by PowerShell');
}
const watcher = chokidar.watch(targetDir, {
    persistent: true,
    ignoreInitial: true,
    followSymlinks: true,
    cwd: targetDir,
    usePolling: true,
    interval: 100,
    binaryInterval: 300,
    alwaysStat: false,
    depth: 99,
    awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100
    },

    ignorePermissionErrors: false,
    atomic: true // or a custom 'atomicity delay', in milliseconds (default 100)
});
watcher.on('all', async () => {
    if(occured) return;
    occured=true;
   restartWindowService();
});