const express = require('express');
const app = express();

app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
  <html><head><title>RAZAK ULTRA V2</title>
  <style>
  body{background:#000;color:#0f0;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif}
  .box{border:2px solid #0f0;padding:30px;border-radius:15px;text-align:center;box-shadow:0 0 20px #0f0}
  input{padding:10px;width:200px;margin:10px;border-radius:5px}
  button{padding:10px 20px;background:#0f0;color:#000;font-weight:bold;border:none;border-radius:5px}
  </style></head><body>
  <div class="box"><h2>RAZAK ULTRA V2 PAIR</h2>
  <input id="num" placeholder="91XXXXXXXXXX"><br>
  <button onclick="pair()">GET PAIR CODE</button>
  <h3 id="code"></h3>
  <script>
  async function pair(){
    let n=document.getElementById('num').value;
    document.getElementById('code').innerText='Wait...';
    let r=await fetch('/pair?number='+n);
    let d=await r.json();
    document.getElementById('code').innerText=d.code||d.error;
  }
  </script></div></body></html>
  `);
});

app.get('/pair', async (req, res) => {
  const number = (req.query.number || '').replace(/[^0-9]/g, '');
  if (!number) return res.json({ error: 'Number dalo vai' });
  try {
    const { default: makeWASocket, useMultiFileAuthState } = await import('@whiskeysockets/baileys');
    const { state, saveCreds } = await useMultiFileAuthState('/tmp/razak_sess');
    const sock = makeWASocket({ auth: state, printQRInTerminal: false, browser: ['RAZAK','Chrome','1.0'] });
    sock.ev.on('creds.update', saveCreds);
    await new Promise(r => setTimeout(r, 2000));
    const code = await sock.requestPairingCode(number);
    res.json({ code });
  } catch (e) {
    console.log(e);
    res.json({ error: e.message });
  }
});

module.exports = app;
