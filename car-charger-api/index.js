const express = require('express');
const app = express();
const port = 4000;
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const passportHttp = require('passport-http');
const db = require('./db');
app.use(bodyParser.json());
app.use(cors());

// use these to save charging start time into db
const startBase = 1602343278057; // Date.now() as a base value.
// "hours:minutes:seconds"
String.prototype.convertToMilliseconds = function convertToMilliseconds(){
  let arr = this.split(':');
  return (+arr[2] + 60 * arr[1] + 3600 * arr[0])*1000 + startBase ;
}
Number.prototype.convertToTimestring = function (){
  let seconds = Math.floor((this - startBase)/1000);
  let gru = new Date(0);
  gru.setSeconds(seconds);
  return gru.toISOString().substr(11, 8);
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//get all chargers
app.get('/chargers', (req, res) => {
  db.query('SELECT * FROM chargers ')
  .then(result => {
    var chargerData = [...result];
    let promise1 = new Promise((resolve, reject) => {
      let counter2 = 0;
      for (let i = 0; i < chargerData.length; i++) { //iterate chargers
        chargerData[i].coordinates = [chargerData[i].latitude / 10000000 , chargerData[i].longitude / 10000000];  // my App is using coordinates instead of lat,long
        delete chargerData[i].latitude;
        delete chargerData[i].longitude;
        let chargerConnections = chargerData[i].connections.split(',');  // IDs of the connections to the charger
        let counter1 = 0;
        for (let j = 0; j < chargerConnections.length; j++){      //iterate connections
          db.query('SELECT * FROM connections where id = ?', [chargerConnections[j]])  // get connection with matching id
          .then( result => {
            delete result[0].activationCode;
            chargerConnections.splice(j,1,result[0]);  // replace the id with the connection
            counter1 += 1;
            if(counter1 === chargerConnections.length) {  //  connections for one charger finished
              chargerData[i].connections = chargerConnections; // write connections into the charger
              counter2 += 1;
              if(counter2 === chargerData.length) { //connection for all charger finished
                resolve(chargerData);
              }
            }
          })
          .catch( (err) => {
            reject(err);
          })
        }
      }
    })
    return promise1;
  })
  .then(result =>{
    res.json(result);
  })
  .catch( (err) => {
    console.log(err);
    res.sendStatus(500);
  })
})

/*put charger data into database. needs correct password in req.data.
data: {
  "password": "wasd",
  "chargers": []
}
*/
app.post('/chargers', (req, res) => {
  if(!bcrypt.compareSync(req.body.password, "$2a$08$R8cyJ/6HdVPGSuC7p/CmguQgEEzDD3lbb/qZc6HdJhu35QjavKko2")){ //wrong pw
    res.sendStatus(403);
    return;
  }else{

  let chargers = req.body.chargers;
  let counter1 = 0;

  for(let i = 0; i < chargers.length; i++){ //iterate chargers
    //put charger into db
    db.query('INSERT INTO chargers (name, address, latitude, longitude, connections) VALUES (?,?,?,?,?)',
                                [chargers[i].name, chargers[i].address, chargers[i].coordinates[0]*10000000, chargers[i].coordinates[1]*10000000, "connectionsString"])
    .then( result => {
      let chargerId = result.insertId;  //  the charger
      let rememberConnections = [];     //  connections for the charger
      let counter2 = 0;

      let promise = new Promise((resolve, reject) => {
        for(let j = 0; j < chargers[i].connections.length; j++){ //iterate connections
          let tmpConnection = chargers[i].connections[j];
          //put the chargers into db and connect them to the charger
          db.query('INSERT INTO connections (chargerId, type, available, maxAvailable, powerKw, activationCode) VALUES (?,?,?,?,?,?)',
                                  [chargerId, tmpConnection.type, tmpConnection.available, tmpConnection.maxAvailable, tmpConnection.powerKw, tmpConnection.activationCode])
          .then(result => {
            rememberConnections.push(result.insertId);
            counter2 += 1;
            if (counter2 === chargers[i].connections.length){
              resolve([rememberConnections, chargerId]);
            }

          })
          .catch(err => reject(err))

        }
      })
      return promise;

    })
    .then( result => {  // add reference from charger to connections
      
      let remConString = result[0].toString();

      return db.query('UPDATE chargers SET connections = ? where id = ? ',[remConString, result[1]]);
      //return db.query('SELECT * FROM chargers where id = ?', [result[1] ])

    })
    .then(result => { 
      console.log(result.message);
      counter1 += 1;
      if (counter1 === chargers.length) res.sendStatus(201);
    })

    .catch(e => {
      console.log(e);
      res.sendStatus(500);
    })
  }
}})

/*create new user
data: {
  "username": "Test User",
  "password": "1234"
}
*/
app.post('/users', (req, res) => {
  if(req.body.username === ""){  // don't accept empty string as username
    res.sendStatus(403);
    return;
  }
  db.query('SELECT * FROM users where name = ?', [req.body.username]) //does this user already exist?
    .then(results => {
      if(results.length > 0) {  // found existing user
        throw new Error('userExists');
      }
      const passwordHash = bcrypt.hashSync(req.body.password, 8);
       // put user into db
      return db.query('INSERT INTO users (name, password, invoices, ongoingCharge_connectionId, ongoingCharge_startTime) VALUES (?,?,?,?,?)',
                                  [req.body.username, passwordHash, null, -1, "0:0:0"])
    })
    .then(results => {
      console.log("registered new user");
      res.sendStatus(201);
    })
    .catch(error => {
        console.error(error);
        if(error.message === 'userExists') res.sendStatus(403);
        else res.sendStatus(500);
        
    });
})

//get Authorization
passport.use(new passportHttp.BasicStrategy(function(username, password, done) {
  db.query('SELECT * FROM users where name = ?', [username])
  .then( result => {
    if(result.length === 0){  //user doesn't exist'
    return done(null, false);
    }
    if(!bcrypt.compareSync(password, result[0].password)){
      return done(null, false); // wrong password
    }
    done(null, result[0]);
  })
  .catch(err => {
    console.log(err)
  })
  
}));

// for log in: will try to authenticate with username and password
// send back info about ongoing charge that user
app.post('/login', passport.authenticate('basic', {session : false}), (req, res) => {
  console.log("successful log in for user:")
  console.log(req.user);
  var sendResponse = {chargerId: -1, connectionId: -1, startTime: 0};
  db.query('SELECT ongoingCharge_connectionId, ongoingCharge_startTime FROM users WHERE id = ?', [req.user.id]) //get ongoing charge
  .then( result => {
    sendResponse.connectionId = result[0].ongoingCharge_connectionId;
    sendResponse.startTime = result[0].ongoingCharge_startTime.convertToMilliseconds();
    return db.query('SELECT chargerId FROM connections WHERE id = ?', [result[0].ongoingCharge_connectionId])
  })
  .then( result => {
    console.log(result);
    if(result.length !== 0 ) sendResponse.chargerId = result[0].chargerId; // == 0 means no charger in use
    res.json( sendResponse );
  })
  .catch( err => {
    console.log(err);
    res.sendStatus(500);
  })  
})

/*  When start charging
  data: {
      connectionId: 1,            // charging at this connection
      activationCode: A4CV,       // need the correct activation code to start
*/
app.post('/chargerStart', passport.authenticate('basic', {session : false}), (req, res) => {
  var findConnection = {};
  db.query('SELECT * FROM connections WHERE id = ?', [req.body.connectionId])
  .then( result => {
    if(result.length > 0) {
      findConnection = result[0];
    }else{ // connection not in database (shouldn't happen)
      throw new Error('error');
    }
    if(findConnection.activationCode !== req.body.activationCode ){ // wrong activation code
      throw new Error('errorWrongCode');
    }
    promise = new Promise((resolve, reject) => {
      let counter = 0;
      db.query('UPDATE connections SET available = ? WHERE id = ?', [findConnection.available - 1, findConnection.id])  //charger in use
      .then((result) => {
        counter++;
        if(counter === 2){
          resolve(true);
        }
      })
      .catch(err => reject(err))
      db.query('UPDATE users SET ongoingCharge_connectionId = ?, ongoingCharge_startTime = ? WHERE id = ?',
                                  [findConnection.id, Date.now().convertToTimestring(), req.user.id]) //set ongoing charge
      .then((result) => {
        counter++;
        if(counter === 2){
          resolve(true);
        }
      })
      .catch(err => reject(err))
    })
    return promise;
  })
  .then(result => {
    res.sendStatus(201);
  })
  .catch((err) => {
    if(err.message === 'errorWrongCode') res.sendStatus(403)
    else res.sendStatus(500);
    console.log(err);
  })
})

//When stop charging
app.post('/chargerStop', passport.authenticate('basic', {session : false}), (req, res) => {
  var [findConnection, currInvoices, ongoingConnection, ongoingStartTime] = [{},"",-1,0];
  db.query('SELECT invoices, ongoingCharge_connectionId, ongoingCharge_startTime FROM users WHERE id = ?', [req.user.id]) //get ongoing charge
  .then(result => {
    if(result.length === 0) throw new Error('error');
    else [currInvoices, ongoingConnection, ongoingStartTime] = [result[0].invoices, result[0].ongoingCharge_connectionId, result[0].ongoingCharge_startTime];
    if(currInvoices !== null) currInvoices = currInvoices.split(','); // convert string to an array
    else currInvoices = []; //in case of user has no invoices
    ongoingStartTime =ongoingStartTime.convertToMilliseconds();
    return db.query('SELECT * FROM connections WHERE id = ?', [ongoingConnection])  //get connection of ongoing charge
  })
  .then(result => {
    if(result.length === 0) throw new Error('error');
    else findConnection = result[0];

    //some math to calculate charge time & cost
    let rightnow = new Date();
    let chargeTime = Math.floor((rightnow.getTime() - ongoingStartTime)/1000);
    let chargeEnergyKwh = Math.floor(chargeTime*(findConnection.powerKw/36))/100;
    let chargeCostEuro = 0;
    if(findConnection.powerKw >= 30) chargeCostEuro = (Math.floor(chargeTime*(findConnection.powerKw/36)*0.18)/100);
    else if(findConnection.powerKw > 20) chargeCostEuro = (Math.floor(chargeTime*2/6)/100);
    //make chargeTime more readable
    let gru = new Date(0);
    gru.setSeconds(chargeTime);
    let readgru = gru.toISOString().substr(11, 8);

    //create invoice
    return db.query('INSERT INTO invoices (userId, chargerId, date, chargeTime, chargeEnergyKwh, chargeCostEuro) VALUES (?,?,?,?,?,?)',
                                  [req.user.id, findConnection.chargerId, rightnow.toLocaleString(), readgru, chargeEnergyKwh*100, chargeCostEuro*100])
  })
  .then(result => {
    currInvoices.push(result.insertId);
    currInvoices = currInvoices.toString();
    promise = new Promise((resolve, reject) => {
      let counter = 0;
      db.query('UPDATE connections SET available = ? WHERE id = ?', [findConnection.available + 1, findConnection.id])  // free charger
      .then((result) => {
        counter++;
        if(counter === 2){
          resolve(true);
        }
      })
      .catch(err => reject(err))
      db.query('UPDATE users SET invoices = ?, ongoingCharge_connectionId = ?, ongoingCharge_startTime = ? WHERE id = ?',  // create reference to invoice & clear ongoing charge
                  [currInvoices, -1, "0:0:0", req.user.id])
      .then((result) => {
        counter++;
        if(counter === 2){
          resolve(true);
        }
      })
      .catch(err => reject(err) )
    })
    return promise;
  })
  .then(result =>{
    res.sendStatus(201);
  })
  .catch(err => {
    console.log(err);
    res.sendStatus(500);
  })
  
})

//get invoices of the user, who makes the request
app.get('/invoices', passport.authenticate('basic', {session : false}), (req, res) => {
  db.query('SELECT * FROM invoices where userId = ?', [req.user.id])
  .then(response => {
    if(response.length > 0){
      for(let i = 0; i < response.length; i++ ){
        response[i].chargeEnergyKwh = response[i].chargeEnergyKwh / 100;
        response[i].chargeCostEuro = response[i].chargeCostEuro / 100;
      }
      res.json(response);
    }
    else res.json([]);  //in case this user doesn't have invoices yet
  })
  .catch( err => {
    console.log(err);
    res.sendStatus(500);
  })
})

/* DB init */
Promise.all(
  [
      db.query(`CREATE TABLE IF NOT EXISTS users(
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(32),
          password VARCHAR(64),
          invoices VARCHAR(128),
          ongoingCharge_connectionId INT,
          ongoingCharge_startTime VARCHAR(64)
      )`),
      db.query(`CREATE TABLE IF NOT EXISTS chargers(
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(64),
          address VARCHAR(64),
          latitude INT,
          longitude INT,
          connections VARCHAR(128)
      )`),
      db.query(`CREATE TABLE IF NOT EXISTS connections(
          id INT AUTO_INCREMENT PRIMARY KEY,
          chargerId INT,
          type VARCHAR(32),
          available INT,
          maxAvailable INT,
          powerKw INT,
          activationCode VARCHAR(16)
      )`),
      db.query(`CREATE TABLE IF NOT EXISTS invoices(
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId INT,
          chargerId INT,
          date VARCHAR(32),
          chargeTime VARCHAR(32),
          chargeEnergyKwh INT,
          chargeCostEuro INT
    )`),
      // Add more table create statements if you need more tables
  ]
).then(() => {
  console.log('database initialized');
  app.listen(port, () => {
      console.log(`Example API listening on http://localhost:${port}\n`);
  });
})
.catch(error => console.log(error));