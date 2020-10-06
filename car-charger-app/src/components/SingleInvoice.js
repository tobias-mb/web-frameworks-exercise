import React from 'react'
import styles from './SingleInvoice.module.css'

export default function SingleInvoice(props) {
    return (
        <li>
            <div className={styles.title} onClick={ () => props.flipDetailView(props.charger.id) } > {props.charger.name}</div>
            Date: {props.date}, &nbsp;&nbsp;
            Charge Time: {props.chargeTime}, &nbsp;&nbsp;
            Energy: {props.chargeEnergyKwh}kWh, &nbsp;&nbsp;
            Cost: {props.chargeCostEuro}€
        </li>
    )
}
