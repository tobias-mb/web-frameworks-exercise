import React from 'react'
import styles from './ListElement.module.css'

export default function ListElement(props) {
    return (
        <li className = {styles.listElement} >
            <div className = {styles.flex}>
                <div className = {styles.name}> {props.name} </div>
                <div className = {styles.type}> {props.type} </div>
            </div>
            <div> {props.address} </div>
        </li>
    )
}