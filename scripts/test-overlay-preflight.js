'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const source = fs.readFileSync(path.join(__dirname, '../files/usr/sbin/afzoonctl'), 'utf8');
const definitions = source.slice(source.indexOf('json_quote()'), source.indexOf('\ncase "$1"'));
const guards = '\nusb_block() { return 0; }\ncat() { echo 1000000; }\ncommand() { return 0; }\nparted() { echo UNEXPECTED_DESTRUCTIVE_CALL; return 1; }\nswapoff() { echo UNEXPECTED_DESTRUCTIVE_CALL; return 1; }\numount() { echo UNEXPECTED_DESTRUCTIVE_CALL; return 1; }\n';
const cases = [
    ['awk() { return 0; }\noverlay_ready() { return 1; }', /mounted \/overlay.*no partitions were changed/],
    ['awk() { return 0; }\noverlay_ready() { return 0; }\ndf() { return 1; }', /Cannot read overlay capacity.*no partitions were changed/],
    ['awk() { echo /dev/sda1; }', /Active extroot/]
];
for (const [mocks, message] of cases) {
    const input = definitions + guards + mocks + '\napply /dev/sda 128 256\n';
    const executable = process.platform === 'win32' ? 'wsl.exe' : 'sh';
    const args = process.platform === 'win32' ? ['-e', 'sh', '-s'] : ['-s'];
    const result = spawnSync(executable, args, { input, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const reply = JSON.parse(result.stdout.trim());
    assert.equal(reply.ok, false);
    assert.match(reply.error, message);
}
console.log('PASS: missing/unreadable overlay and active root stop before destructive commands');
