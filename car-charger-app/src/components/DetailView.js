import React from 'react'
import styles from './DetailView.module.css'
import LogIn from './LogIn'
import ChargingComponent from './ChargingComponent'

export default function DetailView(props) {
    return (
        <div className = {styles.background} >
            <h1> { props.name } </h1>
            <div style = {{fontStyle: 'italic'}}>This image is a placeholder during testing</div>
            <img className = {styles.image} src={"https://mediafiles.mein-haustier.de/wp-content/uploads/2019/01/shutterstock_345091346-komprimiert.jpg"} alt = {""} />
            <div> {props.address} </div>
            <div style = {{display: 'flex'}} >
                <div> {props.type} </div>
                <div> &nbsp; - {props.powerKw}kW </div>
            </div>
            <div> {props.available}/{props.maxAvailable} free </div>
            <div style = {{fontStyle: 'italic'}} > For testing purposes all activation codes are: A4CV </div>
            <button onClick={ props.flipDetailView } className = {styles.returnButton} > return to map </button>
            <LogIn  user = {props.user} setUser = {props.setUser} />
            <ChargingComponent {...props} />
        </div>
    )
}