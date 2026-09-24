const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
  <h2>PAIRING SITE</h2>
  <form action="/pair" method="get">
  <input type="text" name="number" placeholder="91XXXXXXXXXX ke saath number daalo" required>
  <button type="submit">GET PAIR CODE</button>
  </form>
  `);
});

app.get('/pair', async (req, res) => {
  let num = req.query.number;
  if (!num) return res.send({ error: "Number do" });
  num = num.replace(/[^0-9]/g, '');

  try {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    
    const sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
      },
      printQRInTerminal: false,
      logger: pino({ level: "fatal" }),
      browser: ["Chrome (Linux)", "", ""]
    });

    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
      await delay(1500);
      let code = await sock.requestPairingCode(num);
      code = code?.match(/.{1,4}/g)?.join("-") || code;
      console.log("PAIR CODE:", code);
      res.send({ code: code, message: "WhatsApp me jaake Linked Devices > Link with phone number pe ye code daalo" });
    }

    sock.ev.on('connection.update', async (s) => {
      const { connection, lastDisconnect } = s;
      if (connection === 'open') {
        console.log("CONNECTED SUCCESS");
      }
    });

  } catch (e) {
    console.log(e);
    res.send({ error: e.message });
  }
});

app.listen(PORT, () => console.log("Server running"));
module.exports = app;