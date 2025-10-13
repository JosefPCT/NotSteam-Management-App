const express = require('express');

const PORT = process.env.PORT || 3000;
const app = express();

app.get('/', (req, res) => {
  res.send('Homepage');
});

app.listen(PORT, () => {
  console.log(`Now listening to port:`, PORT);
})