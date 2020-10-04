import React from 'react'
import ListElement from './ListElement';
import styles from './ChargerList.module.css'

export default function ChargerList(props) {
    return (
        <ul className={styles.list} >
            { props.chargers.map(charger => <ListElement {...charger} key = {charger.id} flipDetailView = {props.flipDetailView} />) }
        </ul>
    )
}
