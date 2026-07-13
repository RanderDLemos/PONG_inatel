const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const QRCode = require('qrcode');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Sala única e fixa: assim o QR Code impresso nunca muda.
// Se um dia vocês quiserem várias telas/mesas ao mesmo tempo,
// cada uma precisa de um código fixo diferente (ex: '0001', '0002'...).
const SALA_FIXA = '0001';

app.use('/jogo', express.static(path.join(__dirname, '../jogo')));
app.use('/controle', express.static(path.join(__dirname, 'public')));

// Gera o QR Code sob demanda (usado pela página de impressão)
app.get('/api/qrcode', async (req, res) => {
  const urlControle = `${req.protocol}://${req.get('host')}/controle/controle.html?sala=${SALA_FIXA}`;
  const qrDataUrl = await QRCode.toDataURL(urlControle, { width: 500, margin: 1 });
  res.json({ sala: SALA_FIXA, urlControle, qrDataUrl });
});

io.on('connection', (socket) => {
  socket.on('entrar-jogo', () => {
    socket.join(SALA_FIXA);
    console.log(`Jogo conectado na sala ${SALA_FIXA}`);
  });

  socket.on('entrar-controle', () => {
    socket.join(SALA_FIXA);
    console.log(`Controle conectado na sala ${SALA_FIXA}`);
  });

  // Início do movimento (equivalente a segurar a tecla)
  socket.on('mover-start', ({ direcao }) => {
    socket.to(SALA_FIXA).emit('mover-start', { direcao });
  });

  // Fim do movimento (equivalente a soltar a tecla)
  socket.on('mover-parar', ({ direcao }) => {
    socket.to(SALA_FIXA).emit('mover-parar', { direcao });
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});