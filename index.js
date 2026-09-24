const express = require('express');
const app = express();
const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

app.get('/', (req, res) => {
  res.send(`
  <html><body style="background:#000;color:#fff;text-align:center;padding-top:50px;font-family:sans-serif">
  <h2>PAIR BOT - FIXED</h2>
  <form action="/pair">
  <input name="number" placeholder="919876543210" style="padding:10px;width:250px" required><br><br>
  <button style="padding:10px 20px;background:#00ff00">GET CODE</button>
  </form>
  </body></html>
  `);
});

app.get('/pair', async (req, res) => {
  let num = (req.query.number || "").replace(/[^0-9]/g, '');
  if (!num) return res.json({ error: "number do" });

  // Vercel fix - temp folder use karo
  if (!fs.existsSync('/tmp/session')) {
    fs.mkdirSync('/tmp/session', { recursive: true });
  }

  try {
    const { state, saveCreds } = await useMultiFileAuthState('/tmp/session');

    const sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }).child({})),
      },
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    sock.ev.on('creds.update', saveCreds);

    if (!state.creds.registered) {
      await delay(2000);
      const code = await sock.requestPairingCode(num);
      const formatted = code.match(/.{1,4}/g).join("-");
      return res.json({ pairingCode: formatted, success: true });
    } else {
      return res.json({ message: "Already registered" });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message, fix: "Use /tmp/session folder" });
  }
});

module.exports = app;