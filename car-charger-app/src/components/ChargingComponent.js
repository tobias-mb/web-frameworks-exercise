import React, { useState, useEffect } from 'react'
import axios from 'axios';

export default function ChargingComponent(props) {
    
    const [timerOn, setTimerOn] = useState(false);
    const [timerTime, setTimerTime] = useState(0);
    const [timerStart, setTimerStart] = useState(0);
    const [activationFieldString, setActivationFieldString] = useState("");

    const onActivationFieldChange = (event) => {
        setActivationFieldString(event.target.value);
    }

    // directly start timer, if there's charge in progress
    useEffect( () => {
        if( Object.keys(props.ongoingCharge).length > 0 && props.ongoingCharge.chargerId === props.id ){ 
            setTimerOn(true);
            setTimerStart(props.ongoingCharge.startTime);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.ongoingCharge])

    /*  Tell the server, that this charger is in use / no longer in use
        When starting checks for correct activation code.
        When stopping also sends data to create an invoice
    */
    const onStartButton = () => {
        if (props.connections[0].available <= 0){
            alert("no charger available at this location!");
            return;
        }
        if(!timerOn){ //start
            //initialise timer
            setTimerStart(Date.now());
            props.setOngoingCharge( props.id, Date.now() );
            setTimerTime(0);
            axios({ //tell server to start charging, decrease available chargers
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
                setTimerOn(true);    //start timer
                props.useCharger(props.id, 'start'); //decrease available chargers
                console.log('Start charging.'); 
            })
            .catch(error => {
                console.log(error);
                alert("Wrong activation code..");
            });
        }
        else{ //stop
            // convert the charge time into readable format
            let date = new Date(0);
            date.setSeconds(timerTime);
            let timeString = date.toISOString().substr(11, 8);

            axios({ //tell server to stop charging, increase available chargers
                method: 'post',
                url: 'http://localhost:4000/chargerId',
                auth: {
                    username: props.user,
                    password: props.password
                },
                data: {
                    chargerId: props.id,
                    action : "stop",
                    chargeTime : timeString,
                    chargeEnergyKwh : currentCharge,
                    chargeCostEuro : currentCost
                }
            })
            .then(response => {
                setTimerOn(false);    // stop timer
                props.setOngoingCharge();   //no more charge in progress
                props.useCharger(props.id, 'stop'); // increase available chargers
                setTimerTime(0);
                setTimerStart(0);
                console.log('Stop charging.'); 
            })
            .catch(error => {
                console.log(error);
                alert("something went wrong :(");
            });
        }
    }

    //start a timer while charging
    useEffect(() => {
        let interval = null;        
        if(timerOn){
            interval = setInterval(() =>{
                setTimerTime( Math.floor((Date.now()-timerStart)/1000) );
            }, 1000)
        }else if (!timerOn && timerTime !== 0){
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerOn, timerTime, timerStart])

    //calculate cost and kWh based on timer
    let currentCharge = Math.floor(timerTime*(props.connections[0].powerKw/36))/100;
    let currentCost = 0;
    if(props.connections[0].type === "CCS") currentCost = (Math.floor(timerTime*(props.connections[0].powerKw/36)*0.18)/100);
    if(props.connections[0].type === "Type 2") currentCost = (Math.floor(timerTime*2/6)/100);


    if (props.user === "") return <div>Only registered users can start charging!</div>
    else if(Object.keys(props.ongoingCharge).length > 0 && props.ongoingCharge.chargerId !== props.id){  //There's an ongoing charge at different charger
        return <div onClick = {() => props.flipDetailView(props.id)} > 
                A different charger is in use.
            </div>
    }else{ return <>
        <div style = {{fontStyle: 'italic'}} > For testing purposes all activation codes are: A4CV </div>
        <div>
            enter activation code: <input type = "text" style = {{width: '80px'}}
                                            onChange ={ onActivationFieldChange }
                                            value={ activationFieldString}/>
            <button onClick={onStartButton} >{ (Object.keys(props.ongoingCharge).length === 0)? "start charging" : "stop charging" }</button>
        </div>
        <div>
            ongoing charge: <input type = "text" style = {{width: '80px'}} readOnly value={ currentCharge } /> kWh
            &nbsp; cost: <input type = "text" style = {{width: '80px'}} readOnly value={ currentCost } /> €
        </div>
    </>}
}