const express = require('express');
const path = require('path');

const app = express();

// Nastavenie statických súborov
app.use(express.static(path.join(__dirname, 'public')));

// Route pre hlavný súbor
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Spustenie servera
const port = 5000;
app.listen(port, () => {
    console.log(`Server beží na http://localhost:${port}`);
});
