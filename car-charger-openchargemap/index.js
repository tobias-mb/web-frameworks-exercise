//const password = require('./password.json');
const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/* Converts an array from the API https://openchargemap.org/site/develop/api
into an array my App can use */
Array.prototype.doSomeMagic = function(previous) {
    if (previous === undefined) previous = [];
    let res = [];
    for (let i = 0; i < this.length; i++) {
        if (res.findIndex(charger => charger.name === this[i].AddressInfo.Title) !== -1
            || previous.findIndex(charger => charger.name === this[i].AddressInfo.Title) !== -1) continue;  //skip duplicates
        let tmpConns = [];
        for (let j = 0; j < this[i].Connections.length; j++) {

            // instead of duplicate connections, increase available at existing connection
            let findDuplicateConnection = tmpConns.find(connection => connection.type === this[i].Connections[j].ConnectionType.Title);
            if(findDuplicateConnection === undefined){
                //some opencharge chargers have no qnty defined. assume at least 1.
                let tmpAvailable = (this[i].Connections[j].Quantity === null)? 1 : this[i].Connections[j].Quantity;
                tmpConns.push({
                    id: this[i].Connections[j].ID,
                    type: this[i].Connections[j].ConnectionType.Title,
                    available: tmpAvailable,
                    maxAvailable: tmpAvailable,
                    powerKw: this[i].Connections[j].PowerKW,
                    activationCode: "A4CV"
                });
            }else{
                findDuplicateConnection.available += 1;
                findDuplicateConnection.maxAvailable += 1;
            }

        }
        res.push({
            id: this[i].ID,
            name: this[i].AddressInfo.Title,
            address: this[i].AddressInfo.AddressLine1 + ', ' + this[i].AddressInfo.Town,
            coordinates: [this[i].AddressInfo.Latitude, this[i].AddressInfo.Longitude],
            connections: tmpConns
        });
    }
    return res;
};

var alreadyExisting = [];
var inputPassword = "";
new Promise((resolve, reject) => {
    rl.question('Please enter password:', (answer) => {
        resolve(answer);
        rl.close();
    });
})
.then((response) => {
    inputPassword = response;
    return axios({
        //get chargers already in the db
        method: 'get',
        url: 'http://100.25.155.186/chargers'
    })
})
.then(result => {
    console.log("server answered.")
    alreadyExisting = result.data;
    //get charger data from https://openchargemap.org/site/develop/api
    return axios({
        method: 'get',
        url: 'https://api.openchargemap.io/v3/poi/?output=json&countrycode=FI&maxresults=200'
    })
})
.then(response => {
    console.log('openchargemap answered.');
    var openchargemapChargers = response.data;
    //convert data into format that I can use
    var myChargers = openchargemapChargers.doSomeMagic(alreadyExisting);
    //give the modified data to my database
    return axios({
        method: 'post',
        url: 'http://100.25.155.186/chargers',
        data: {
            password: inputPassword,
            chargers: myChargers
        }
    })
})
.then(response => {
    console.log('successfully put data to database');
})
.catch(error => { 
    console.log(error);
});