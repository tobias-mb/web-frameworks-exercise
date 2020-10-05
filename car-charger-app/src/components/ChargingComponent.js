import React, { useState, useEffect } from 'react'
import axios from 'axios';

export default function ChargingComponent(props) {
    
    const [timerOn, setTimerOn] = useState(false);
    const [timerTime, setTimerTime] = useState(0);
    const [activationFieldString, setActivationFieldString] = useState("");

    /* Tell the server, that this charger is in use

    */
    const onStartButton = () => {
        if(!timerOn){
            axios({
                method: 'post',
                url: 'http://localhost:4000/chargerId',
                auth: {
                    username: props.user,
                    password: props.password
                },
                data: {
                    chargerId: props.id,
                    activationCode: activationFieldString,
                    action : "start"
                }
            })
            .then(response => {
                setTimerOn(true);
                props.useCharger(props.id, 'start');
                console.log('Start charging.'); 
            })
            .catch(error => {
                console.log(error);
                alert("Wrong activation code..");
            });
        }
        else{ 
            axios({
                method: 'post',
                url: 'http://localhost:4000/chargerId',
                auth: {
                    username: props.user,
                    password: props.password
                },
                data: {
                    chargerId: props.id,
                    activationCode: activationFieldString,
                    action : "stop"
                }
            })
            .then(response => {
                setTimerOn(false);
                props.useCharger(props.id, 'stop');
                console.log('Stop charging.'); 
            })
            .catch(error => {
                console.log(error);
                alert("something went wrong :(");
            });
        }
    }

    const onActivationFieldChange = (event) => {
        setActivationFieldString(event.target.value);
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


    if (props.user === "") return <div>Only registered users can start charging!</div>
    else return <>
        <div>
            enter activation code: <input type = "text" style = {{width: '80px'}}
                                            onChange ={ onActivationFieldChange }
                                            value={ activationFieldString}/>
            <button onClick={onStartButton} > {timerOn? "stop charging" : "start charging"}</button>
        </div>
        <div>
            ongoing charge: <input type = "text" style = {{width: '80px'}} readOnly value={ currentCharge } /> kWh
            &nbsp; cost: <input type = "text" style = {{width: '80px'}} readOnly value={ currentCost } /> €
        </div>
    </>
}
