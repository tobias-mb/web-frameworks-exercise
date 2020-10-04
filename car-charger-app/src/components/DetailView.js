import React from 'react'
import styles from './DetailView.module.css'
import LogIn from './LogIn'
import ChargingComponent from './ChargingComponent'

export default function DetailView(props) {
    return (
        <div className = {styles.background} >
            <h1> { props.name } </h1>
            <LogIn user = {props.user} setUser = {props.setUser}/>
            <div> {props.address} </div>
            <div style = {{display: 'flex'}} >
                <div> {props.type} </div>
                <div> &nbsp; - {props.power}kW </div>
            </div>
            <button onClick={ props.flipDetailView } className = {styles.returnButton} > return to map </button>
            <ChargingComponent {...props} />
        </div>
    )
}
