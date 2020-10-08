import React from 'react'
import styles from './ListElement.module.css'

export default function ListElement(props) {
    return (
        <li className = {styles.listElement} onClick={ () => props.flipDetailView(props.id) }>
            <div className = {styles.name}> {props.name} </div>
            <div> {props.address} </div>
            <div style = {{display: 'flex'}} >
                <div className = {styles.type}> {props.connections[0].type} </div>
                <div> - {props.connections[0].powerKw}kW </div>
                <div> &nbsp; &nbsp; {props.connections[0].available}/{props.connections[0].maxAvailable} free </div>
            </div>
        </li>
    )
}
