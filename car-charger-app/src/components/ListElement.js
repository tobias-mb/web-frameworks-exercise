import React from 'react'
import styles from './ListElement.module.css'
import ConnectionType from './ConnectionType'

//single element in the list next to the map
export default function ListElement(props) {
    return (
        <li className = {styles.listElement} onClick={ () => props.flipDetailView(props.id) }>
            <div className = {styles.name}> {props.name} </div>
            <div> {props.address} </div>
            {props.connections.map(connection => <ConnectionType {...connection} key = {connection.id} />) }
        </li>
    )
}
