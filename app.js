const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./src/routes/index'); 
const port = 3000;

const app = express();
app.use(bodyParser.json());

app.use('/', routes);

app.get('/', (req, res) => {
    res.status(200).send("Welcome")
});

app.listen(port, () => {
    console.log(`App successfully started on http://localhost:${port}`);
});