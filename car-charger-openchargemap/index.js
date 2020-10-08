const password = require('./password.json');
const axios = require('axios');

axios({
    method: 'post',
    url: 'http://localhost:4000/users',
    data: {
        username: "a test",
        password: "a test"
    }
})
.then(response => {
    console.log('successfully registered');
})
.catch(error => { 
    console.log(error);
});