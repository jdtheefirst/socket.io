'use strict';
require('dotenv').config({path: './sample.env'});
const express = require('express');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');
const routes = require('./routes.js');

const auth = require('./auth.js');

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const bcrypt = require('bcrypt');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const MongoStore = require("connect-mongo");
const main = require('./connection');
const URI = process.env.MONGO_URI;
const store = MongoStore.create({
  mongoUrl: URI,
  autoRemove: 'interval',
  autoRemoveInterval: 10
  })
app.set('view engine', 'pug');
app.set('views', './views/pug');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
  key: 'express.sid',
  store: store
  
}));

app.use(passport.initialize());
app.use(passport.session());

fccTesting(app); // For fCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'express.sid',
    secret: process.env.SESSION_SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
  })
);

main(async client => {
  const myDataBase = await client.db('database').collection('users');
 

  routes(myDataBase);
  auth(myDataBase);

  let currentUsers = 0;
  io.on('connection', (socket) => {w
    ++currentUsers;
    io.emit('user', {
      username: socket.request.user.username,
      currentUsers,
      connected: true
    });
    socket.on('chat message', (message) => {
      io.emit('chat message', { username: socket.request.user.username, message });
    });
    console.log('A user has connected');
    socket.on('disconnect', () => {
      console.log('A user has disconnected');
      --currentUsers;
      io.emit('user', {
        username: socket.request.user.username,
        currentUsers,
        connected: false
      });
    });
  });
  
}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('index', { title: e, message: 'Unable to connect to database' });
  });
});

function onAuthorizeSuccess(data, accept) {
  console.log('successful connection to socket.io');

  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
  if (error) throw new Error(message);
  console.log('failed connection to socket.io:', message);
  accept(null, false);
}
  
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});