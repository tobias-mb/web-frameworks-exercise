import React from 'react'
import styles from './ConnectionType.module.css'

//used for the connections in a  charger. Displays a checkbox if it gets a prop: checkbox = {true}
export default function ConnectionType(props) {
    return (
        <div style = {{display: 'flex'}} >
            <div> {props.type} </div>
            <div> &nbsp; - {props.powerKw}kW </div>
            <div> &nbsp;&nbsp;&nbsp; {props.available}/{props.maxAvailable} free </div>
            {(props.checkbox === true)? <input className={styles.checkbox} type="checkbox"
                                                onChange={() => props.setWhichCheckbox(props.id)}
                                                checked = { (props.whichCheckbox === props.id)? true : false} /> : <></> }
        </div>
    )
}
