import express = require('express');
import path = require('path');
import bodyParser = require('body-parser');
import logger = require('morgan');
import mongoose = require('mongoose');
import config = require('../utils/config');

// Create a new express application instance
const app: express.Application = express();

mongoose.connect(config.DB_HOST, {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('views', path.join(__dirname + '/../', 'views'));
app.set('view engine', 'ejs');
app.set('port', config.SERVER_PORT);

// Add headers
app.use(logger('dev'));
app.use(function (req, res, next) {    
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    
    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token");
    
    // Set to true if you need the website to include cookies in the requests sent to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Pass to next layer of middleware
    next();
});

app.get('/', (req, res) => {
  res.render('index',{
      message : 'Welcome to bank-scraper !!'
  })
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.json({ success: false, message: 'Route not found' });
});

app.listen(config.SERVER_PORT, () => {
  console.log(`bank-scraping listening on port ${config.SERVER_PORT}!`)
})

export default app;