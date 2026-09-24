const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>RAZAK MD PAIR BOT</title></head>
      <body style="background:black;color:white;text-align:center;padding-top:100px;font-family:sans-serif">
        <h1>RAZAK MD PAIR BOT</h1>
        <h2 style="color:lime">Bot Is Online ✅</h2>
        <p>Your deployment is working!</p>
        <p>Now add your pair logic here</p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

module.exports = app;