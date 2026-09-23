const express = require('express');
const app = express();

app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use(express.json());

// MAIN PAGE
app.get('/', (req, res) => {
  res.send(`
  <html><head><title>RAZAK ULTRA V2 PAIR</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
  body{background:#000;color:#0f0;display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;margin:0}
  .box{border:2px solid #0f0;padding:25px;border-radius:15px;text-align:center;box-shadow:0 0 20px #0f0;width:300px}
  input{padding:12px;width:90%;margin:10px 0;border-radius:8px;border:1px solid #0f0;background:#111;color:#0f0;outline:none}
  button{padding:12px 20px;background:#0f0;color:#000;font-weight:bold;border:none;border-radius:8px;width:100%;cursor:pointer}
  #code{font-size:22px;letter-spacing:2px;margin-top:15px;font-weight:bold;color:#fff}
  </style></head><body>
  <div class="box"><h2>RAZAK ULTRA V2</h2><p>PAIR CODE</p>
  <input id="num" placeholder="9198xxxxxxxx">
  <button onclick="pair()">GET CODE</button>
  <div id="code"></div>
  <script>
  async function pair(){
    let n=document.getElementById('num').value;
    if(!n){alert('Number dalo');return}
    document.getElementById('code').innerText='Generating...';
    let r=await fetch('/pair?number='+n);
    let d=await r.json();
    document.getElementById('code').innerText=d.code || d.error;
  }
  </script></div></body></html>
  `);
});

// PAIR CODE - FIXED FOR VERCEL
app.get('/pair', async (req, res) => {
  let num = (req.query.number || '').replace(/[^0-9]/g, '');
  if(!num || num.length < 10) return res.json({error: 'Sahi number dalo, + ke bina'});
  
  try {
    const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore } = await import('@whiskeysockets/baileys');
    const pino = (await import('pino')).default;
    
    // Har bar naya random folder taaki purana session error na de
    const dir = '/tmp/RAZAK_' + Date.now();
    const { state, saveCreds } = await useMultiFileAuthState(dir);

    const sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({level: "fatal"}))
      },
      printQRInTerminal: false,
      logger: pino({level: "fatal"}),
      browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    sock.ev.on('creds.update', saveCreds);

    // Thoda wait karke code mango
    await new Promise(r => setTimeout(r, 1500));

    let code = await sock.requestPairingCode(num);
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    
    res.json({code: code});
    
  } catch (err) {
    console.log(err);
    res.json({error: err.message || 'Error, dubara try karo'});
  }
});

module.exports = app;
