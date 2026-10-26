import test from 'node:test';
import assert from 'node:assert/strict';
import { createRaceRelay } from '../../.angular/race-relay.mjs';
const token = 'test-token-with-32-characters-long';
const track = {
  id: 'p',
  name: 'Pilot',
  color: '#38bdf8',
  offset: 0,
  visible: true,
  closed: false,
  live: false,
  points: [
    { x: 0, y: 2, z: 0, t: 0 },
    { x: 3, y: 2, z: 0, t: 1 },
  ],
};
const pack = {
  format: 'openbando-race',
  version: 1,
  frame: 'race-test:1000',
  gate: null,
  tracks: [track],
};
async function setup(t) {
  const server = createRaceRelay({ token, origins: ['http://localhost:4200'] });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/rooms/test`;
  const aborts = [];
  t.after(async () => {
    aborts.forEach((a) => a.abort());
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  });
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const post = (id, value = pack) =>
    fetch(base, { method: 'POST', headers, body: JSON.stringify({ id, pack: value }) });
  const join = async (id, frame = pack.frame) => {
    const abort = new AbortController();
    aborts.push(abort);
    const res = await fetch(`${base}?frame=${frame}`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Race-Client': id },
      signal: abort.signal,
    });
    return { res, abort };
  };
  return { base, post, join };
}
test('two devices exchange sanitized paths only in the same coordinate frame', async (t) => {
  const { join, post } = await setup(t);
  const a = await join('alice');
  assert.equal(a.res.status, 200);
  const b = await join('bob');
  assert.equal(b.res.status, 200);
  const reader = b.res.body.getReader(),
    decoder = new TextDecoder();
  let pending = '';
  async function event() {
    for (;;) {
      const end = pending.indexOf('\n\n');
      if (end >= 0) {
        const part = pending.slice(0, end);
        pending = pending.slice(end + 2);
        if (part.startsWith('data: ')) return JSON.parse(part.slice(6));
        continue;
      }
      const r = await reader.read();
      assert.equal(r.done, false);
      pending += decoder.decode(r.value, { stream: true });
    }
  }
  assert.deepEqual((await event()).owners, []);
  const response = await post('alice', {
    ...pack,
    latitude: 45,
    tracks: [{ ...track, gps: 'private' }],
  });
  assert.equal(response.status, 204);
  const received = await event();
  assert.equal(received.owners[0].id, 'alice');
  assert.equal(received.owners[0].pack.tracks[0].points[1].x, 3);
  assert.equal(JSON.stringify(received).includes('gps'), false);
  assert.equal((await post('alice', { ...pack, frame: 'race-other:1000' })).status, 409);
  a.abort.abort();
  const gone = await event();
  assert.deepEqual(gone.owners, []);
});
test('rejects unauthorized origins, unjoined publishers, invalid points and oversized bodies', async (t) => {
  const { base, post, join } = await setup(t);
  assert.equal((await fetch(base)).status, 401);
  assert.equal(
    (await fetch(base, { headers: { Origin: 'https://untrusted.invalid' } })).status,
    403,
  );
  assert.equal((await post('outsider')).status, 403);
  await join('alice');
  assert.equal(
    (
      await post('alice', {
        ...pack,
        tracks: [
          {
            ...track,
            points: [
              { x: 0, y: 0, z: 0, t: 0 },
              { x: 0, y: 0, z: 0, t: 0 },
            ],
          },
        ],
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await fetch(base, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: 'x'.repeat(2 * 1024 * 1024 + 1),
      })
    ).status,
    413,
  );
});

test('the eight-pilot limit applies to the whole room, not each publisher', async (t) => {
  const { join, post } = await setup(t);
  await join('alice');
  await join('bob');
  const full = { ...pack, tracks: Array.from({length: 8}, (_, i) => ({...track, id: `p${i}`})) };
  assert.equal((await post('alice', full)).status, 204);
  assert.equal((await post('bob')).status, 429);
});
