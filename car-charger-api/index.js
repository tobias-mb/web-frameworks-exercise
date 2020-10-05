const data = require('./data.json');
const express = require('express');
const app = express();
const port = 4000;
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const passportHttp = require('passport-http');

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//get all chargers
app.get('/chargers', (req, res) => {
  res.json(data.chargers)
})

//get all user. Only for testing
/*
app.get('/users', (req, res) => {
  res.json(data.users)
})
*/

/*create new user
{
  "username": "Test User"
  "password": "1234"
}
*/
app.post('/users', (req, res) => {
  const userResult = data.users.find(user => user.name === req.body.username);
  if (userResult !== undefined)  res.sendStatus(403)  //user already exists
  else{
    const passwordHash = bcrypt.hashSync(req.body.password, 8);
    data.users.push({
      id: Date.now(),
      name: req.body.username,
      password: passwordHash
    });
    res.sendStatus(200);
  }
})

//get Authorization
passport.use(new passportHttp.BasicStrategy(function(username, password, done) {
  const userResult = data.users.find(user => user.name === username);
  if(userResult === undefined){
    return done(null, false); // user doesn't exist
  }
  if(!bcrypt.compareSync(password, userResult.password)){
    return done(null, false); // wrong password
  }
  done(null, userResult);
}));

// for log in: will try to authenticate with username and password
app.post('/login', passport.authenticate('basic', {session : false}), (req, res) => {
  console.log("successful log in for user:")
  console.log(req.user);
  res.sendStatus(200);
})

/* check activation code before start charging. Needs chargerId and activationCode in req.body. responds with 200 OK or 403 forbidden
  data: {
      chargerId: 1,
      activationCode: A4CV
      action : 'start' / 'stop'
  }
*/
app.post('/chargerId', passport.authenticate('basic', {session : false}), (req, res) => {
  var findActivationCode = data.activationCodes.find(code => code.chargerId === req.body.chargerId);
  if (findActivationCode === undefined) { // couldn't find charger with matching ID (shouldn't happen)
    res.sendStatus(500); 
    return;
  }
  var findCharger = data.chargers.find(charger => charger.id === req.body.chargerId);
  if (req.body.action === 'stop'){  // stop charging
    findCharger.available +=1;
    res.sendStatus(200);
    return;
  }
  if( req.body.action === 'start' && findActivationCode.activationCode === req.body.activationCode){  // start charging & code is correct 
    findCharger.available -= 1;
    res.sendStatus(200);
    return;
  }
  res.sendStatus(403);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})