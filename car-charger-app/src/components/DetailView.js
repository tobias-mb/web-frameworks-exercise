import React from 'react'
import styles from './DetailView.module.css'
import LogIn from './LogIn'
import ChargingComponent from './ChargingComponent'
import ConnectionType from './ConnectionType'

export default function DetailView(props) {
    return (
        <div className = {styles.background} >
            <h1> { props.name } </h1>
            <div style = {{fontStyle: 'italic'}}>This image is a placeholder during testing</div>
            <img className = {styles.image} src={"https://mediafiles.mein-haustier.de/wp-content/uploads/2019/01/shutterstock_345091346-komprimiert.jpg"} alt = {""} />
            <div> {props.address} </div>
            {props.connections.map(connection => <ConnectionType {...connection} key = {connection.id} />) }
            <button onClick={ () => props.flipDetailView(0) } className = {styles.returnButton} > return to map </button>
            <LogIn  user = {props.user} setUser = {props.setUser}
                    toggleInvoices = {props.toggleInvoices}
                    setOngoingCharge = {props.setOngoingCharge} />
            <ChargingComponent {...props} />
        </div>
    )
}