Baileys ka code yaha ayega, pehle site to chalne de
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
