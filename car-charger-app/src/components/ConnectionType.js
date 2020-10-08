import React from 'react'

export default function ConnectionType(props) {
    return (
        <div style = {{display: 'flex'}} >
            <div> {props.type} </div>
            <div> &nbsp; - {props.powerKw}kW </div>
            <div> &nbsp;&nbsp;&nbsp; {props.available}/{props.maxAvailable} free </div>
        </div>
    )
}
