import React from 'react'
import ListElement from './ListElement';

export default function ChargerList(props) {
    return (
        <ul style={{ listStyleType: "none" }} >
            { props.chargers.map(charger => <ListElement {...charger} key = {charger.id} flipDetailView = {props.flipDetailView} />) }
        </ul>
    )
}
