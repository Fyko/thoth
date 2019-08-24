const { writeFileSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

module.exports = (() => {
    const _version = execSync('git rev-parse HEAD').toString().trim();
    return writeFileSync(join(__dirname, 'version.ts'), `export const VERSION = '${_version}'\n`); 
})()