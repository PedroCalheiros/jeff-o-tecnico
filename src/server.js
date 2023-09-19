const express = require('express');
const bodyParser = require('body-parser');
const GetRoute = require('./routes/get');
const cors = require('cors');

const app = express();
app.use(cors());

const port = process.env.PORT || 5000;
 
app.use(bodyParser.json());
app.use('/get', GetRoute);

app.listen(port, () => {
  console.log(`App listening on the port ${port}`);
});

module.exports = app;