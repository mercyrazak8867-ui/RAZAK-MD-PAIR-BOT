const express = require('express');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
app.use(express.static('public'));
app.use(express.json());

let sock = null;

async function getSock() {
  if (sock) return sock;
  try {
    const { state, saveCreds } = await useMultiFileAuthState('/tmp/session');
    const { version } = await fetchLatestBaileysVersion();
    sock = makeWASocket({ 
      version, 
      logger: pino({ level: 'silent' }), 
      auth: state, 
      browser: ['Ubuntu','Chrome','20.0.04'] 
    });
    sock.ev.on('creds.update', saveCreds);
    return sock;
  } catch(e) {
    console.log("Sock error:", e.message);
    return null;
  }
}

app.get('/', (req,res)=>{ 
  res.sendFile(path.join(__dirname,'public','index.html')); 
});

app.get('/pair', async (req,res) => {
  let num = req.query.number;
  if(!num) return res.json({error: 'Number daal'});
  num = num.replace(/[^0-9]/g,'');
  
  try {
    const curSock = await getSock();
    if(!curSock) return res.json({error: 'Starting... 10 sec baad try kar'});
    await new Promise(r=>setTimeout(r,2000));
    const code = await curSock.requestPairingCode(num);
    res.json({code: code});
  } catch(e) { 
    console.log(e);
    res.json({error: e.message}); 
  }
});

module.exports = app;
