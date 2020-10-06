import React, {useState} from 'react'
import axios from 'axios';
import Popup from './Popup';

//log in functionality
export default function LogIn(props) {

    const [showPopup, setShowPopup] = useState(false);  // open / close username + password fields
    const [usernameString, setUsernameString] = useState("");
    const [passwordString, setPasswordString] = useState("");
    
    const togglePopup = () => {
        setShowPopup(showPopup => !showPopup);
    }
    const onUsernameFieldChange = (event) => {
        setUsernameString(event.target.value);
    }
    const onPasswordFieldChange = (event) => {
        setPasswordString(event.target.value);
    }

    /* try to authenticate with name + password
    if name is a valid user, log in */
    // authUser("Test User", 1234)
    const authUser = (name, password) => {
        axios({
            method: 'post',
            url: 'http://localhost:4000/login',
            auth: {
                username: name,
                password: password
            }
        })
        .then(response => {
            console.log('Log in successful.');
            props.setUser(name, password);
            setUsernameString("");
            setPasswordString("");
            togglePopup();
        })
        .catch(error => { 
            console.log(error);
            alert("Wrong username or password. Log in failed.");
        });
    }
    
    // register new user and log in with that user
    const registerUser = (name, password) => {
        axios({
            method: 'post',
            url: 'http://localhost:4000/users',
            data: {
                username: name,
                password: password
            }
        })
        .then(response => {
            console.log('successfully registered');
            props.setUser(name, password);
            setUsernameString("");
            setPasswordString("");
            togglePopup();
        })
        .catch(error => { 
            console.log(error)
            alert("This username is already in use. Please choose another.");
        });
    }

    return(
        <div>
            {(!showPopup)?
                (props.user === "")? <button onClick={ togglePopup }>
                    log in
                </button> : <div style={{display: 'flex'}}>
                    <div> {props.user} &nbsp; </div>
                    <button onClick={ () => props.setUser("","") }>
                            log out
                    </button> &nbsp;
                    <button onClick={ props.toggleInvoices } > prev. charges </button>
                </div> :
                 <Popup togglePopup = {togglePopup}
                        onUsernameFieldChange = {onUsernameFieldChange}
                        onPasswordFieldChange = {onPasswordFieldChange} 
                        usernameString = {usernameString}
                        passwordString = {passwordString}
                        authUser = {authUser}
                        registerUser = {registerUser}   /> }
        </div>
    )
}
