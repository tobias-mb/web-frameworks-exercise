const data = require('./data.json');
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
        chargerData.coordinates = [chargerData.latitude / 1000000 ,chargerData.longitude / 1000000];
        let chargerConnections = chargerData[i].connections.split(',');  // IDs of the connections to the charger
        let counter1 = 0;
        for (let j = 0; j < chargerConnections.length; j++){      //iterate connections
          db.query('SELECT * FROM connections where id = ?', [chargerConnections[j]])  // get connection with matching id
          .then( result => {
            chargerConnections.splice(j,1,result);  // replace the id with the connection
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
    res.sendStatus(403)
  }

  let chargers = req.body.chargers;
  let counter1 = 0;

  for(let i = 0; i < chargers.length; i++){ //iterate chargers
    //put charger into db
    db.query('INSERT INTO chargers (name, address, latitude, longitude, connections) VALUES (?,?,?,?,?)',
                                [chargers[i].name, chargers[i].address, chargers[i].coordinates[0]*1000000, chargers[i].coordinates[1]*1000000, "connectionsString"])
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

})

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
        throw new Error('error');
      }
    })
    .then(results => {
      // put user into db 
      const passwordHash = bcrypt.hashSync(req.body.password, 8);
      db.query('INSERT INTO users (name, password, invoices, ongoingCharge_chargerId, ongoingCharge_startTime) VALUES (?,?,?,?,?)',
                                  [req.body.username, passwordHash, "", 0, 0])
        .then(results => {
          console.log(results);
          res.sendStatus(201);
        })
    })
    .catch(error => {
        console.error(error);
        res.sendStatus(403);
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
    done(null, result);
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
  res.json( req.user.ongoingCharge );
})

/*
  data: {
      chargerId: 1,               // this charger should be changed
      connectionId: 1,            // this connection should be changed
      activationCode: A4CV,       // need the correct activation code to start
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

/* DB init */
Promise.all(
  [
      db.query(`CREATE TABLE IF NOT EXISTS users(
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(32),
          password VARCHAR(64),
          invoices VARCHAR(128),
          ongoingCharge_chargerId INT,
          ongoingCharge_startTime INT
      )`),
      db.query(`CREATE TABLE IF NOT EXISTS chargers(
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(32),
          address VARCHAR(32),
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
          activationCode VARCHAR(8)
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