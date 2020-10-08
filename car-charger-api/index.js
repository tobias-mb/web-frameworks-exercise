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

//put charger data into database. needs correct password in req.data
app.post('/chargers', (req, res) => {
  if(!bcrypt.compareSync(req.body.password, "$2a$08$R8cyJ/6HdVPGSuC7p/CmguQgEEzDD3lbb/qZc6HdJhu35QjavKko2")){
    data.chargers = req.body.chargers;
    data.activationCodes = req.body.activationCodes;
    res.sendStatus(403)
  }else{
    res.sendStatus(200);
  }
})

/*create new user
{
  "username": "Test User"
  "password": "1234"
}
*/
app.post('/users', (req, res) => {
  const userResult = data.users.find(user => user.name === req.body.username);
  if (userResult !== undefined || req.body.username === "" )  res.sendStatus(403)  //user already exists
  else{
    const passwordHash = bcrypt.hashSync(req.body.password, 8);
    data.users.push({
      id: Date.now(),
      name: req.body.username,
      password: passwordHash,
      invoices: [],
      ongoingCharge: {}
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
// send back info about ongoing charge that user
app.post('/login', passport.authenticate('basic', {session : false}), (req, res) => {
  console.log("successful log in for user:")
  console.log(req.user);
  res.json( req.user.ongoingCharge );
})

/*
  data: {
      chargerId: 1,               // this charger should be changed
      connectionId: 1,            // this connection should be changed
      activationCode: A4CV        // need the correct activation code to start
      action : 'start' / 'stop'   // App tells the server to start / stop charging.
  }
*/
app.post('/chargerId', passport.authenticate('basic', {session : false}), (req, res) => {
  
  var findActivationCode = data.activationCodes.find(code => code.chargerId === req.body.chargerId);
  var findCharger = data.chargers.find(charger => charger.id === req.body.chargerId);
  if (findActivationCode === undefined || findCharger === undefined) { // couldn't find charger or activation code with matching ID (shouldn't happen)
    res.sendStatus(500); 
    return;
  }

  var findConnectionIndex = findCharger.connections.findIndex(connection => connection.id === req.body.connectionId);
  if(findConnectionIndex === -1){ // The specified connection doesn't exist at this charger (shouldn't happen)
    res.sendStatus(500); 
    return;
  }

  if (req.body.action === 'stop'){  // stop charging and create invoice for that charge
    findCharger.connections[findConnectionIndex].available +=1;

    //some math to calculate charge time & cost
    let rightnow = new Date();
    chargeTime = Math.floor((rightnow.getTime() - req.user.ongoingCharge.startTime)/1000);
    chargeEnergyKwh = Math.floor(chargeTime*(findCharger.connections[findConnectionIndex].powerKw/36))/100;
    let chargeCostEuro = 0;
    if(findCharger.connections[findConnectionIndex].type === "CCS") chargeCostEuro = (Math.floor(chargeTime*(findCharger.connections[findConnectionIndex].powerKw/36)*0.18)/100);
    if(findCharger.connections[findConnectionIndex].type === "Type 2") chargeCostEuro = (Math.floor(chargeTime*2/6)/100);
    //make chargeTime more readable
    let gru = new Date(0);
    gru.setSeconds(chargeTime);
    let readgru = gru.toISOString().substr(11, 8);
    
    data.invoices.push({
      id : rightnow.getTime(),
      userId : req.user.id,
      chargerId : req.body.chargerId,
      date : rightnow.toLocaleString(),
      chargeTime : readgru,
      chargeEnergyKwh : chargeEnergyKwh,
      chargeCostEuro : chargeCostEuro
    });

    req.user.invoices.push(rightnow.getTime());

    req.user.ongoingCharge = {}; //clear ongoign charge
    res.sendStatus(200);
    return;
  }
  if( req.body.action === 'start' && findActivationCode.activationCode === req.body.activationCode){  // start charging & code is correct 
    req.user.ongoingCharge = {chargerId: req.body.chargerId, startTime: Date.now()}; // save ongoing charge
    findCharger.connections[findConnectionIndex].available -= 1;
    res.sendStatus(200);
    return;
  }
  res.sendStatus(403);  // refuse when activation code is wrong
})

//get invoices of the user, who makes the request
app.get('/invoices', passport.authenticate('basic', {session : false}), (req, res) => {
  res.json(data.invoices.filter(invoice => invoice.userId === req.user.id ));
})

/*app.get('/users', (req, res) => {
  res.json(data.users)
})*/

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})