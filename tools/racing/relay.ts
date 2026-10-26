/** Optional in-memory HTTP/SSE race relay. No database, accounts, video, GPS or external dependencies. */
import { createServer, type ServerResponse } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { MAX_PILOTS, parseRacePack, type RacePack } from '../../src/app/core/racing/race';
interface Owner {
  id: string;
  updated: number;
  pack: RacePack;
}
interface Room {
  frame: string;
  owners: Map<string, Owner>;
  clients: Map<string, ServerResponse>;
  changed: number;
}
interface Options {
  token: string;
  origins: string[];
  now?: () => number;
}
const MAX_BODY = 2 * 1024 * 1024,
  MAX_ROOM = 4 * 1024 * 1024,
  TTL = 20 * 60 * 1000;
export function createRaceRelay(options: Options) {
  if (options.token.length < 16) throw new Error('RACE_TOKEN must have at least 16 characters');
  const now = options.now ?? Date.now,
    rooms = new Map<string, Room>();
  let sequence = 0;
  const secret = Buffer.from(`Bearer ${options.token}`);
  const snapshot = (room: Room) =>
    `data: ${JSON.stringify({ owners: [...room.owners.values()] })}\n\n`;
  const send = (room: Room) => {
    const data = snapshot(room);
    for (const client of room.clients.values()) {
      if (client.writableLength > MAX_ROOM) client.end();
      else client.write(data);
    }
  };
  const server = createServer(async (req, res) => {
    const origin = req.headers.origin;
    if (origin && !options.origins.includes(origin)) {
      res.writeHead(403).end('Origin not allowed');
      return;
    }
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method === 'OPTIONS') {
      res
        .writeHead(204, {
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Race-Client',
        })
        .end();
      return;
    }
    const auth = Buffer.from(req.headers.authorization ?? '');
    if (auth.length !== secret.length || !timingSafeEqual(auth, secret)) {
      res.writeHead(401).end('Unauthorized');
      return;
    }
    const url = new URL(req.url ?? '/', 'http://relay.local'),
      match = /^\/rooms\/([a-zA-Z0-9_-]{1,48})$/.exec(url.pathname);
    if (!match) {
      res.writeHead(404).end('Unknown room endpoint');
      return;
    }
    const key = match[1]!;
    const getRoom = (frame: string): Room => {
      let room = rooms.get(key);
      if (room && room.frame !== frame) {
        if (room.clients.size || room.owners.size) throw new Error('409');
        room.frame = frame;
      }
      if (!room) {
        if (rooms.size >= 8) throw new Error('503');
        room = { frame, owners: new Map(), clients: new Map(), changed: now() };
        rooms.set(key, room);
      }
      return room;
    };
    try {
      if (req.method === 'GET') {
        const frame = url.searchParams.get('frame') ?? '',
          id = req.headers['x-race-client'];
        if (
          !/^race-[a-z0-9:-]{1,80}$/.test(frame) ||
          typeof id !== 'string' ||
          !/^[a-zA-Z0-9_-]{1,64}$/.test(id)
        ) {
          res.writeHead(400).end('Frame and client required');
          return;
        }
        const room = getRoom(frame);
        if (room.clients.size >= 8 || room.clients.has(id)) {
          res.writeHead(429).end('Room is full');
          return;
        }
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        });
        room.clients.set(id, res);
        res.write(snapshot(room));
        res.on('close', () => {
          if (room.clients.get(id) === res) {
            room.clients.delete(id);
            room.owners.delete(id);
            room.changed = now();
            send(room);
          }
        });
      } else if (req.method === 'POST') {
        let size = 0;
        const body = await new Promise<string>((resolve, reject) => {
          const chunks: Buffer[] = [];
          let failed = false;
          req.on('data', (chunk: Buffer) => {
            size += chunk.length;
            if (failed) return;
            if (size > MAX_BODY) {
              failed = true;
              chunks.length = 0;
              reject(new Error('413'));
              return;
            }
            chunks.push(chunk);
          });
          req.on('end', () => {
            if (!failed) resolve(Buffer.concat(chunks).toString('utf8'));
          });
          req.on('error', reject);
        });
        const raw = JSON.parse(body) as { id?: unknown; pack?: unknown };
        if (typeof raw.id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(raw.id))
          throw new Error('400');
        const pack = parseRacePack(raw.pack),
          room = getRoom(pack.frame);
        if (!room.clients.has(raw.id)) {
          res.writeHead(403).end('Join before publishing');
          return;
        }
        if (!room.owners.has(raw.id) && room.owners.size >= 8) throw new Error('429');
        const owner = { id: raw.id, updated: ++sequence, pack };
        const next = [...room.owners.values()].filter((x) => x.id !== raw.id);
        next.push(owner);
        if (next.reduce((sum, entry) => sum + entry.pack.tracks.length, 0) > MAX_PILOTS) throw new Error('429');
        if (Buffer.byteLength(JSON.stringify(next)) > MAX_ROOM) throw new Error('413');
        room.owners.set(raw.id, owner);
        room.changed = now();
        send(room);
        res.writeHead(204).end();
      } else res.writeHead(405, { Allow: 'GET, POST, OPTIONS' }).end();
    } catch (e) {
      const message = (e as Error).message;
      const code = /^(400|409|413|429|503)$/.test(message) ? +message : 400;
      if (!res.headersSent) res.writeHead(code).end('Race request rejected');
      else res.end();
    }
  });
  server.requestTimeout = 10000;
  server.headersTimeout = 5000;
  server.maxConnections = 64;
  const timer = setInterval(() => {
    for (const [key, room] of rooms) {
      for (const client of room.clients.values()) client.write(': heartbeat\n\n');
      if (!room.clients.size && now() - room.changed > TTL) rooms.delete(key);
    }
  }, 10000);
  timer.unref();
  server.on('close', () => clearInterval(timer));
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const token = process.env['RACE_TOKEN'] ?? '';
  const origins = (process.env['RACE_ORIGINS'] ?? 'http://localhost:4200,http://localhost:4300')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  const server = createRaceRelay({ token, origins });
  const host = process.env['RACE_HOST'] ?? '127.0.0.1',
    port = Number(process.env['RACE_PORT'] ?? 8787);
  server.listen(port, host, () => console.log(`Race relay listening on ${host}:${port}`));
  const stop = () => {
    server.close();
    server.closeAllConnections();
  };
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}
