import React from 'react'
import styles from './LogIn.module.css';
import axios from 'axios';

//log in functionality
export default function LogIn(props) {

    /* try to authenticate with name + password
    if name is a valid user, log in */
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
            console.log('login successful');
            props.setUser(name);
        })
        .catch(error => { console.log(error) });
    }

    if(props.user === undefined){   //not logged in
        return (
            <div className={styles.login} onClick={ () => authUser("Test User", 1234) }>
                log in
            </div>
        )
    }else{  //someone logged in
        return (
            <div className={styles.login}>
                <div> {props.user} </div>
                <div onClick={ () => props.setUser() }>
                    log out
                </div>
            </div>
        )
    }
}
