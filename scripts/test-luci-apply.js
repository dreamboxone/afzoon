'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../files/www/luci-static/resources/view/afzoon/overview.js'), 'utf8');
const helpers = source.slice(source.indexOf('function cmd('), source.indexOf('function esc('));

function client(replies) {
    const calls = [];
    const api = new Function('fs', 'window', helpers + 'return { cmd, runApply };')({
        exec_direct: (command, args, type) => {
            calls.push(args);
            assert.equal(command, '/usr/sbin/afzoonctl');
            assert.equal(type, 'text');
            const reply = replies.shift();
            if (reply instanceof Error) return Promise.reject(reply);
            return Promise.resolve(typeof reply === 'string' ? reply : JSON.stringify(reply));
        }
    }, { setTimeout: callback => setImmediate(callback) });
    return { api, calls };
}

(async () => {
    const success = client([
        { ok: true, running: true, job_id: 'test-job' },
        { ok: true, running: true },
        new Error('Transient connection failure'),
        { ok: true, reboot_required: true }
    ]);
    assert.deepEqual(await success.api.runApply(['/dev/sda', '128', '256']), { ok: true, reboot_required: true });
    assert.deepEqual(success.calls[0], ['start-apply', '/dev/sda', '128', '256']);
    assert(success.calls.slice(1).every(call => call[0] === 'apply-status' && call[1] === 'test-job'));

    const failure = client([{ ok: true, running: true, job_id: 'test-job' }, { ok: false, error: 'Format failed' }]);
    assert.equal((await failure.api.runApply(['/dev/sda', '128', '256'])).error, 'Format failed');

    const busy = client([{ ok: false, error: 'An Apply operation is already in progress' }]);
    assert.equal((await busy.api.runApply(['/dev/sda', '128', '256'])).ok, false);
    assert.equal(busy.calls.length, 1);

    const empty = client(['']);
    await assert.rejects(empty.api.cmd(['status']), /Empty response from router/);

    const lost = client([{ ok: true, running: true, job_id: 'test-job' }, ...Array.from({ length: 5 }, () => new Error('Connection lost'))]);
    await assert.rejects(lost.api.runApply(['/dev/sda', '128', '256']), /Connection lost/);
    assert.equal(lost.calls.length, 6);
    console.log('PASS: LuCI async Apply, polling retries, busy/error results and empty responses');
})().catch(error => { console.error(error); process.exitCode = 1; });
