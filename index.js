const express = require('express');
const app = express();

app.get('/', (req,res)=>{
 res.send(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#000;color:#0f0;display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial} .box{border:2px solid #0f0;padding:25px;border-radius:15px;text-align:center;width:300px} input,button{padding:12px;width:90%;margin:8px 0;border-radius:8px} input{background:#111;color:#0f0;border:1px solid #0f0} button{background:#0f0;color:#000;font-weight:bold;border:none} </style></head><body><div class="box"><h2>RAZAK ULTRA V2</h2><p style="font-size:12px">Render Version - 100% Working</p><input id="num" placeholder="9198xxxxxxxx"><button onclick="pair()">GET CODE</button><div id="code" style="margin-top:15px;font-size:20px"></div><script>async function pair(){let n=document.getElementById('num').value;document.getElementById('code').innerText='Wait 5 sec...';let r=await fetch('/pair?number='+n);let d=await r.json();document.getElementById('code').innerText=d.code||d.error}</script></div></body></html>`);
});

app.get('/pair', async (req,res)=>{
  let num=(req.query.number||'').replace(/[^0-9]/g,'');
  try{
    const {default:makeWASocket,useMultiFileAuthState,makeCacheableSignalKeyStore,fetchLatestBaileysVersion}=await import('@whiskeysockets/baileys');
    const pino=(await import('pino')).default;
    const {state,saveCreds}=await useMultiFileAuthState('/tmp/RAZAK_'+Date.now());
    const {version}=await fetchLatestBaileysVersion();
    const sock=makeWASocket({version, auth:{creds:state.creds,keys:makeCacheableSignalKeyStore(state.keys,pino({level:"fatal"}))},logger:pino({level:"fatal"}),printQRInTerminal:false,browser:["Chrome","Chrome",""]});
    sock.ev.on('creds.update',saveCreds);
    await new Promise(r=>setTimeout(r,3000));
    let code=await sock.requestPairingCode(num);
    res.json({code:code.match(/.{1,4}/g).join("-")});
    console.log('Code sent:',code);
    await new Promise(r=>setTimeout(r,60000));
  }catch(e){ if(!res.headersSent) res.json({error:e.message}); }
});

const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log('Running on',PORT));