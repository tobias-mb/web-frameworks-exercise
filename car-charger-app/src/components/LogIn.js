import React from 'react'
import styles from './LogIn.module.css';

export default function LogIn(props) {
    if(props.user === undefined){
        return (
            <div className={styles.login} onClick={ () => props.setUser("TestUser") }>
                log in
            </div>
        )
    }else{
        return (
            <div className={styles.login}>
                <div> {props.user} </div>
                <div onClick={ () => props.setUser(undefined) }>
                    log out
                </div>
            </div>
        )
    }
}
