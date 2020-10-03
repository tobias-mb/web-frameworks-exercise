import React from 'react'
import styles from './DetailView.module.css'

export default function DetailView(props) {
    return (
        <div className = {styles.background} >
            <h1> { props.name } </h1>
            <div> {props.address} </div>
            <div> {props.type} </div>
            <button onClick={ props.flipDetailView } className = {styles.returnButton} > return to map </button>
        </div>
    )
}
