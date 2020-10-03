import React, { useState, useEffect } from 'react'

export default function ChargingComponent(props) {
    
    const [timerOn, setTimerOn] = useState(false);
    const [timerTime, setTimerTime] = useState(0);

    const onStartButton = () => {
        setTimerOn(!timerOn);
    }

    //start a timer while charging
    useEffect(() => {
        let interval = null;        
        if(timerOn){
            interval = setInterval(() =>{
                setTimerTime( timerTime => timerTime +1 );
            }, 1000)
        }else if (!timerOn && timerTime !== 0){
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerOn, timerTime])

    //calculate cost and kWh based on timer
    var currentCharge = Math.floor(timerTime*(props.power/36))/100;
    var currentCost = 0;
    if(props.type === "CCS") currentCost = Math.floor(timerTime*(props.power/36)*0.18)/100;
    if(props.type === "Type 2") currentCost = Math.floor(timerTime*2/6)/100;

    if (props.user === undefined) return <div>You must log in to start charging!</div>
    else return <>
        <div>
            enter validation code: <input type = "text" style = {{width: '80px'}} />
            <button onClick={onStartButton} > {timerOn? "stop charging" : "start charging"}</button>
        </div>
        <div>
            ongoing charge: <input type = "text" style = {{width: '80px'}} readOnly value={ currentCharge } /> kWh
            &nbsp; cost: <input type = "text" style = {{width: '80px'}} readOnly value={ currentCost } /> €
        </div>
    </>
}
