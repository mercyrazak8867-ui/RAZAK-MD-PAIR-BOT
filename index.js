const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');

const app = express();
app.use(express.static('public'));
app.use(express.json());

let sock;
async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();
  sock = makeWASocket({ 
    version, 
    logger: pino({ level: 'silent' }), 
    auth: state, 
    browser: ['Ubuntu','Chrome','20.0.04'] 
  });
  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', async (update) => {
    if(update.connection === 'close'){
      startSock();
    }
  });
}
startSock();

app.get('/', (req,res)=>{ 
  res.sendFile(path.join(__dirname,'public','index.html')); 
});

app.get('/pair', async (req,res) => {
  let num = req.query.number;
  if(!num) return res.json({error: 'Number daal'});
  num = num.replace(/[^0-9]/g,'');
  if(!sock) return res.json({error: 'Wait 10 sec, server starting'});
  try {
    await new Promise(r=>setTimeout(r,2000));
    const code = await sock.requestPairingCode(num);
    res.json({code: code});
  } catch(e) { 
    res.json({error: e.message}); 
  }
});

// Vercel ke liye ye line important hai
module.exports = app;
