const express = require('express');
const app = express();
app.get('/favicon.ico', (req,res)=>res.status(204).end());

app.get('/', (req,res)=>{
 res.send(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#000;color:#0f0;display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial} .box{border:2px solid #0f0;padding:25px;border-radius:15px;text-align:center;box-shadow:0 0 20px #0f0;width:300px} input{padding:12px;width:90%;margin:10px 0;border-radius:8px;border:1px solid #0f0;background:#111;color:#0f0} button{padding:12px;background:#0f0;color:#000;font-weight:bold;border:none;border-radius:8px;width:100%} </style></head><body><div class="box"><h2>RAZAK ULTRA V2</h2><input id="num" placeholder="9198xxxxxxxx"><button onclick="pair()">GET CODE</button><div id="code" style="margin-top:15px;font-size:20px;color:#fff"></div><script>async function pair(){let n=document.getElementById('num').value;document.getElementById('code').innerText='Generating... 5 sec wait karo';let r=await fetch('/pair?number='+n);let d=await r.json();document.getElementById('code').innerText=d.code||d.error}</script></div></body></html>`);
});

app.get('/pair', async (req,res)=>{
  let num=(req.query.number||'').replace(/[^0-9]/g,'');
  try{
    const {default:makeWASocket,useMultiFileAuthState,makeCacheableSignalKeyStore,DisconnectReason}=await import('@whiskeysockets/baileys');
    const pino=(await import('pino')).default;
    const {state,saveCreds}=await useMultiFileAuthState('/tmp/RAZAK_'+Date.now());
    const sock=makeWASocket({auth:{creds:state.creds,keys:makeCacheableSignalKeyStore(state.keys,pino({level:"fatal"}))},logger:pino({level:"fatal"}),printQRInTerminal:false,browser:["Ubuntu","Chrome","20.0.04"]});
    sock.ev.on('creds.update',saveCreds);

    await new Promise(r=>setTimeout(r,2000));
    let code=await sock.requestPairingCode(num);
    code=code?.match(/.{1,4}/g)?.join("-")||code;
    
    // Code user ko bhej diya, par function ko 45 sec tak zinda rakhenge
    res.json({code:code});

    // 45 second tak connection ko marne nahi denge - tab tak tu code daal dega
    console.log('Code:',code,'Waiting for login...');
    await new Promise(r=>setTimeout(r,45000));
    
  }catch(e){ if(!res.headersSent) res.json({error:e.message}); }
});

module.exports=app;
