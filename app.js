const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;
const app = express();

// If using ejs package, set the view engine to it
app.set('view engine', 'ejs');

// Allows serving of static files (i.e css)
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded( {extended: true}));

app.get('/', (req, res) => {
  res.send('Homepage');
});

app.listen(PORT, () => {
  console.log(`Now listening to port:`, PORT);
})