const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/pair', async (req, res) => {
  let number = req.query.number;
  if (!number) return res.json({ error: 'Number daalo vai' });
  
  number = number.replace(/[^0-9]/g, '');
  
  try {
    // Baileys ka code yaha ayega, pehle site to chalne de
    const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
    const { state, saveCreds } = await useMultiFileAuthState('/tmp/session');
    
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['RAZAK-ULTRA-V2', 'Chrome', '1.0']
    });
    
    sock.ev.on('creds.update', saveCreds);
    await new Promise(r => setTimeout(r, 3000));
    const code = await sock.requestPairingCode(number);
    res.json({ code: code });

  } catch (e) {
    console.log(e);
    res.json({ error: e.message, note: 'Thoda wait karke fir try karo' });
  }
});

module.exports = app;
