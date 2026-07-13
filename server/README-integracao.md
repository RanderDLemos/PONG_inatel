# Como integrar este scaffold ao seu repositório do Pong

## 1. Onde colocar estes arquivos

No seu repositório do Pong, crie a estrutura abaixo e copie estes arquivos
para dentro da pasta `/server`:

```
PONG_inatel/                 <- raiz do repositório (branch feature/controle-celular)
  /jogo
    pong_web.html            <- mova o arquivo que já existe pra dentro desta pasta
  /server
    package.json             <- (arquivo deste scaffold)
    server.js                <- (arquivo deste scaffold)
    /public
      controle.html          <- (arquivo deste scaffold)
  README.md                  <- já existe, pode ficar na raiz
```

## 2. Instalar e rodar localmente

Dentro da pasta `/server`:

```bash
npm install
npm start
```

Isso sobe o servidor em `http://localhost:3000`, servindo:
- o jogo em `http://localhost:3000/jogo/pong_web.html`
- a página de controle em `http://localhost:3000/controle/controle.html?sala=CODIGO`
  (o QR Code gerado já aponta pro link certo automaticamente)

## 3. Ajustes necessários no `pong_web.html`

O jogo já tem um objeto `keys = { up: false, down: false }` e a função
`movePlayer()` lê esse objeto a cada frame. A integração mais simples é
fazer o celular ligar/desligar esses mesmos booleanos, sem tocar em mais
nada da lógica do jogo.

Adicione **antes do fechamento do `</body>`**, logo após o `<script>` que
já existe (ou dentro dele mesmo, no final):

```html
<img id="qrcode" style="display:none; position:fixed; top:20px; right:20px; width:150px;">
<div id="codigo-sala" style="display:none; position:fixed; top:180px; right:20px; color:#fff; font-size:1.2rem;"></div>

<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();

  // Ao carregar o jogo, cria uma sala e mostra o QR Code na tela
  fetch('/api/nova-sala')
    .then(res => res.json())
    .then(({ codigo, qrDataUrl }) => {
      socket.emit('entrar-jogo', codigo);

      const img = document.getElementById('qrcode');
      img.src = qrDataUrl;
      img.style.display = 'block';

      const codigoEl = document.getElementById('codigo-sala');
      codigoEl.textContent = `Sala: ${codigo}`;
      codigoEl.style.display = 'block';
    });

  socket.on('controle-conectado', () => {
    document.getElementById('qrcode').style.display = 'none';
  });

  // Início do movimento = equivalente ao keydown
  socket.on('mover-start', ({ direcao }) => {
    if (direcao === 'cima') keys.up = true;
    if (direcao === 'baixo') keys.down = true;
  });

  // Fim do movimento = equivalente ao keyup
  socket.on('mover-parar', ({ direcao }) => {
    if (direcao === 'cima') keys.up = false;
    if (direcao === 'baixo') keys.down = false;
  });
</script>
```

> Não precisa criar nenhuma função nova nem mexer em `movePlayer()` — como
> o jogo já lê `keys.up`/`keys.down` a cada frame, o celular só precisa
> ligar e desligar essas duas variáveis, exatamente como o teclado já faz.

## 4. Testando com o celular de verdade

1. Rode `npm start` no computador.
2. Descubra o IP local do computador (ex: `192.168.0.10`) — no Windows,
   `ipconfig`; no Mac/Linux, `ifconfig` ou `ip a`.
3. Abra o jogo no navegador do PC via `http://192.168.0.10:3000/jogo`
   (em vez de `localhost`, para o celular conseguir acessar).
4. No celular (mesma rede Wi-Fi), escaneie o QR Code exibido na tela do jogo.
5. Os botões do celular devem mover a raquete no jogo.

## 5. Deploy (depois de validar localmente)

- **Servidor** (`/server`): subir em Render, Railway ou Fly.io — esses
  serviços sustentam WebSocket persistente, diferente do Vercel.
- **Jogo e Controle**: podem continuar servidos pelo próprio Node (mais
  simples pro piloto) ou ser publicados separadamente no Vercel, apontando
  as chamadas de socket para a URL do servidor hospedado.

## 6. Próximo passo depois disso funcionar

Marque no checklist da documentação principal
(`celular-controle-pong-documentacao.md`) os itens já concluídos e registre
aqui qualquer ajuste feito (ex: nome real da função de mover raquete, IP
usado nos testes, etc.) para quem for continuar o projeto.
