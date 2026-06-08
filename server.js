const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const port = process.env.PORT || 3000;
const publicFolder = path.resolve(__dirname);

const questions = [
  { text: 'Travel to the past', options: ['Visit your childhood', 'Meet future you'] },
  { text: 'Live in the clouds', options: ['Sky castle', 'Undersea palace'] },
  { text: 'Choose a superpower', options: ['Teleport anywhere', 'Read minds'] },
  { text: 'Pick a party theme', options: ['Neon rave', 'Retro arcade'] },
  { text: 'Best weekend plan', options: ['City nightlife', 'Quiet nature escape'] },
  { text: 'Dream pet', options: ['Dragon companion', 'Robot buddy'] },
  { text: 'Ultimate snack', options: ['Hot spicy wings', 'Sweet candy tower'] },
  { text: 'Ideal vacation', options: ['Mystery island', 'Space station'] },
  { text: 'Epic game mode', options: ['Speed round', 'Story quest'] }
];

const rooms = new Map();

function randomId(length = 6) {
  return Math.random().toString(36).substr(2, length).toUpperCase();
}

function getRandomQuestion() {
  return questions[Math.floor(Math.random() * questions.length)];
}

function createRoom(hostName, ws) {
  const code = randomId(5);
  const room = {
    code,
    hostId: null,
    phase: 'waiting',
    currentQuestion: getRandomQuestion(),
    players: new Map(),
    chat: [],
    createdAt: Date.now(),
    results: null
  };

  const playerId = randomId(8);
  room.hostId = playerId;
  room.players.set(playerId, {
    id: playerId,
    name: hostName || 'Host',
    isHost: true,
    selected: null,
    joinedAt: Date.now()
  });
  room.wsMap = new Map([[playerId, ws]]);
  rooms.set(code, room);
  return { room, playerId };
}

function buildRoomState(room, selfId) {
  const players = Array.from(room.players.values()).map((player) => ({
    id: player.id,
    name: player.name,
    isHost: player.isHost,
    selected: player.selected
  }));

  return {
    code: room.code,
    phase: room.phase,
    currentQuestion: room.currentQuestion,
    players,
    hostId: room.hostId,
    chat: room.chat.slice(-50),
    results: room.results,
    roomLink: `${room.code}`
  };
}

function broadcastRoom(room, type, extra = {}) {
  const payload = JSON.stringify({ type, payload: extra });
  for (const ws of room.wsMap.values()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

function sendRoomState(room) {
  const roomState = buildRoomState(room);
  broadcastRoom(room, 'room-state', roomState);
}

function sendPlayerId(ws, playerId) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'player-id', payload: { playerId } }));
  }
}

function sendError(ws, message) {
  ws.send(JSON.stringify({ type: 'error', payload: { message } }));
}

function assignPlayerToRoom(room, playerId, ws) {
  room.wsMap.set(playerId, ws);
}

function cleanupPlayer(room, playerId) {
  room.players.delete(playerId);
  room.wsMap.delete(playerId);
  if (room.hostId === playerId) {
    const next = room.players.values().next();
    if (!next.done) {
      const newHost = next.value;
      newHost.isHost = true;
      room.hostId = newHost.id;
    }
  }
}

function getPercentage(total, count) {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}

function updateResults(room) {
  const totals = { 0: 0, 1: 0 };
  for (const player of room.players.values()) {
    if (player.selected === 0 || player.selected === 1) {
      totals[player.selected]++;
    }
  }
  const totalVotes = totals[0] + totals[1];
  room.results = {
    optionA: { count: totals[0], percent: getPercentage(totalVotes, totals[0]) },
    optionB: { count: totals[1], percent: getPercentage(totalVotes, totals[1]) },
    totalVotes
  };
}

const server = http.createServer((req, res) => {
  let filePath = path.join(publicFolder, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath).toLowerCase();

  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  };

  if (!Object.keys(contentTypes).includes(ext) && !ext) {
    filePath += '.html';
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
    res.end(content);
  });
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  let attachedRoom = null;
  let attachedPlayerId = null;

  ws.on('message', (message) => {
    try {
      const { type, payload } = JSON.parse(message.toString());

      if (type === 'create-room') {
        const { name } = payload;
        const { room, playerId } = createRoom(name, ws);
        attachedRoom = room;
        attachedPlayerId = playerId;
        sendPlayerId(ws, playerId);
        sendRoomState(room);
      }

      else if (type === 'join-room') {
        const { name, roomCode } = payload;
        const room = rooms.get(roomCode.toUpperCase());
        if (!room) {
          sendError(ws, 'Room not found. Check the code and try again.');
          return;
        }
        const playerId = randomId(8);
        room.players.set(playerId, {
          id: playerId,
          name: name || 'Player',
          isHost: false,
          selected: null,
          joinedAt: Date.now()
        });
        assignPlayerToRoom(room, playerId, ws);
        attachedRoom = room;
        attachedPlayerId = playerId;
        sendPlayerId(ws, playerId);
        sendRoomState(room);
        broadcastRoom(room, 'room-announcement', { message: `${name || 'Player'} joined the room.` });
      }

      else if (type === 'start-game') {
        if (!attachedRoom || attachedRoom.hostId !== attachedPlayerId) {
          sendError(ws, 'Only the host can start the game.');
          return;
        }
        attachedRoom.phase = 'voting';
        attachedRoom.currentQuestion = getRandomQuestion();
        attachedRoom.results = null;
        attachedRoom.players.forEach((player) => { player.selected = null; });
        sendRoomState(attachedRoom);
      }

      else if (type === 'select-answer') {
        if (!attachedRoom) return;
        const player = attachedRoom.players.get(attachedPlayerId);
        if (!player || attachedRoom.phase !== 'voting') return;
        player.selected = payload.answer;
        const allSelected = Array.from(attachedRoom.players.values()).every((p) => p.selected !== null);
        if (allSelected) {
          attachedRoom.phase = 'results';
          updateResults(attachedRoom);
        }
        sendRoomState(attachedRoom);
      }

      else if (type === 'next-question') {
        if (!attachedRoom || attachedRoom.hostId !== attachedPlayerId) return;
        attachedRoom.phase = 'voting';
        attachedRoom.currentQuestion = getRandomQuestion();
        attachedRoom.results = null;
        attachedRoom.players.forEach((player) => { player.selected = null; });
        sendRoomState(attachedRoom);
      }

      else if (type === 'send-chat') {
        if (!attachedRoom) return;
        const player = attachedRoom.players.get(attachedPlayerId);
        if (!player) return;
        attachedRoom.chat.push({ name: player.name, message: payload.message, timestamp: Date.now() });
        sendRoomState(attachedRoom);
      }

      else if (type === 'rate-app') {
        if (!attachedRoom) return;
        const rating = Number(payload.rating) || 0;
        attachedRoom.rating = attachedRoom.rating || [];
        attachedRoom.rating.push(rating);
        const average = attachedRoom.rating.reduce((sum, item) => sum + item, 0) / attachedRoom.rating.length;
        broadcastRoom(attachedRoom, 'rating-update', { average: Math.round(average * 10) / 10, total: attachedRoom.rating.length });
      }

    } catch (error) {
      sendError(ws, 'Invalid message format.');
    }
  });

  ws.on('close', () => {
    if (!attachedRoom || !attachedPlayerId) return;
    cleanupPlayer(attachedRoom, attachedPlayerId);
    if (attachedRoom.players.size === 0) {
      rooms.delete(attachedRoom.code);
      return;
    }
    sendRoomState(attachedRoom);
  });
});

server.listen(port, () => {
  console.log(`Choice Clash server running at http://localhost:${port}`);
});
