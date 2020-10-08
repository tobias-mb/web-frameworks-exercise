import React from 'react'

export default function StartButton(props) {
    if(Object.keys(props.ongoingCharge).length === 0 || props.ongoingCharge.chargerId === props.chargerId){    // no charger in use or looking at the active charger
        if(Object.keys(props.ongoingCharge).length === 0){
            return <button onClick={props.onStartButton} > start charging </button>
        }else{ 
            return <button onClick={props.onStartButton} > stop charging </button>
        }
    }else{ //a different charger is in use
        return <> A different charger is in use. </>
    }
}