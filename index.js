const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}));

const exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: String,
})

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  log: [exerciseSchema]
}, {versionKey: false});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', function(req, res) {
  let username = req.body.username;
  User.findOne({username}, (err, foundUser) => {
    if (foundUser) {
      let {_id} = newUser;
      return res.json({
        username,
        _id
      });
    }
    User.create({username}, (err, newUser) => {
      let {_id} = newUser;
      return res.json({
        username,
        _id
      });
    })
  })
});

app.get('/api/users', function(req, res) {
  User.find({}, (err, users) => {
    const filteredUsers = users.map((value) => {
      let {username, _id} = value
      return {
        username,
        _id
      };
    });
    res.json(filteredUsers);
  })
});

app.post('/api/users/:_id/exercises', (req, res) => {
  User.findById(req.params._id, (err, foundUser) => {
    let date = req.body.date;
    let {description, duration} = req.body;
    if (date == '' || new Date(date) == 'Invalid Date') {
      date = new Date().toDateString();
    } else {
      date = new Date(date).toDateString();
    }
    foundUser.log.push({description, duration, date});
    foundUser.save((err, user) => {
      let {username, _id} = user;
      res.json({
        username,
        description,
        duration: parseInt(duration),
        date,
        _id
      });
    });
  })
});

app.get('/api/users/:_id/logs', (req, res) => {
  User.findById(req.params._id, (err, foundUser) => {
    const {to, from, limit} = req.query;
    let log = foundUser.log.map((value) => {
      let {description, duration, date} = value;
      return {
        description,
        duration,
        date,
      };
    });
    // filters the log array to output the required logs
    if (from) {
      const fromDate = new Date(from);
      log = log.filter(log => new Date(log.date) >= fromDate);
    }
    if (to) {
      const toDate = new Date(to);
      log = log.filter(log => new Date(log.date) <= toDate);
    }
    if (limit) {
      log = log.slice(0, limit);
    }
    let {username, _id} = foundUser;
    // outputs final result
    res.json({
      username,
      count: log.length,
      _id,
      log
    });
  })
});

// last two routes gave me a tough time : )

const listener = app.listen(process.env.PORT || 3000, () => {
  mongoose.connect(process.env['db_URI']);
  console.log('Your app is listening on port ' + listener.address().port);
})
