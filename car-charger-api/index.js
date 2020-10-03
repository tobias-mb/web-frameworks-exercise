const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = 4000;
const cors = require('cors');
const data = require('./data.json');

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/chargers', (req, res) => {
  res.json(data.chargers)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})