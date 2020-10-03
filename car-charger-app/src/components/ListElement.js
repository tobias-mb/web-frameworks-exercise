import React from 'react'
import styles from './ListElement.module.css'

export default function ListElement(props) {
    return (
        <li className = {styles.listElement} onClick={ () => props.flipDetailView(props.id) }>
            <div className = {styles.name}> {props.name} </div>
            <div> {props.address} </div>
            <div style = {{display: 'flex'}} >
                <div className = {styles.type}> {props.type} </div>
                <div> - {props.power}kW </div>
            </div>
        </li>
    )
}
