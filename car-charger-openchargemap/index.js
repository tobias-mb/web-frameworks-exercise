const password = require('./password.json');
const axios = require('axios');

/* Converts an array from the API https://openchargemap.org/site/develop/api
into an array my App can use */
Array.prototype.doSomeMagic = function() {
    let res = [];
    for (let i = 0; i < this.length; i++) {
        if (res.findIndex(charger => charger.name === this[i].AddressInfo.Title) !== -1) continue;  //skip duplicates
        let tmpConns = [];
        for (let j = 0; j < this[i].Connections.length; j++) {
            let tmpAvailable = (this[i].Connections[j].Quantity === null)? 1 : this[i].Connections[j].Quantity;
            tmpConns.push({
                id: this[i].Connections[j].ID,
                type: this[i].Connections[j].ConnectionType.Title,
                available: tmpAvailable,
                maxAvailable: tmpAvailable,
                powerKw: this[i].Connections[j].PowerKW,
                activationCode: "A4CV"
            });

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


//get charger data from https://openchargemap.org/site/develop/api
axios({
    method: 'get',
    url: 'https://api.openchargemap.io/v3/poi/?output=json&countrycode=FI&maxresults=10'
})
.then(response => {
    console.log('openchargemap answered.');
    var openchargemapChargers = response.data;
    //convert data into format that I can use
    var myChargers = openchargemapChargers.doSomeMagic();

    //give the modified data to my database
    axios({
        method: 'post',
        url: 'http://localhost:4000/chargers',
        data: {
            password: password.password,
            chargers: myChargers
        }
    })
    .then(response => {
        console.log('successfully put data to database');
    })
    .catch(error => { 
        console.log(error);
    });
})
.catch(error => { 
    console.log(error);
});