// Assembles the App Engine deployment in deploy/ from the server and the production frontend build.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const deploy = path.join(root, 'deploy');

fs.copyFileSync(path.join(root, 'app.js'), path.join(deploy, 'app.js'));
fs.rmSync(path.join(deploy, 'frontend'), { recursive: true, force: true });
fs.cpSync(path.join(root, 'frontend', 'dist', 'frontend'), path.join(deploy, 'frontend'), { recursive: true });
