import React, { useState, useEffect } from 'react'
import axios from 'axios';
import styles from './ChargingComponent.module.css'

export default function ChargingComponent(props) {
    
    const [timerOn, setTimerOn] = useState(false);
    const [timerTime, setTimerTime] = useState(0);
    const [timerStart, setTimerStart] = useState(0);
    const [activationFieldString, setActivationFieldString] = useState("");
    const [checkedConnection, setCheckedConnection] = useState(0);

    const onActivationFieldChange = (event) => {
        setActivationFieldString(event.target.value);
    }

    // directly start timer, if there's charge in progress
    useEffect( () => {
        if( Object.keys(props.ongoingCharge).length > 0 && props.ongoingCharge.chargerId === props.id ){ 
            setTimerOn(true);
            setTimerStart(props.ongoingCharge.startTime);
        }
    },[props.ongoingCharge, props.id])

    /*  Tell the server, that this charger is in use / no longer in use
        When starting checks for correct activation code.
        When stopping also sends data to create an invoice
    */
    const onStartButton = () => {
        if(!timerOn){ //start
            if (props.connections[checkedConnection].available <= 0){
                alert("no charger available at this location!");
                return;
            }
            axios({ //tell server to start charging, decrease available chargers
                method: 'post',
                url: 'http://localhost:4000/chargerStart',
                auth: {
                    username: props.user,
                    password: props.password
                },
                data: {
                    connectionId: props.whichCheckbox,
                    activationCode: activationFieldString
                }
            })
            .then(response => {
                //initialise timer
                setTimerStart(Date.now());
                props.setOngoingCharge( props.id, props.whichCheckbox, Date.now() );
                setTimerTime(0);
                setTimerOn(true);    //start timer
                props.useCharger(props.id, props.whichCheckbox, 'start'); //decrease available chargers
                console.log('Start charging.'); 
            })
            .catch(error => {
                console.log(error);
                alert("Wrong activation code..");
            });
        }
        else{ //stop
            axios({ //tell server to stop charging, increase available chargers
                method: 'post',
                url: 'http://localhost:4000/chargerStop',
                auth: {
                    username: props.user,
                    password: props.password
                }
            })
            .then(response => {
                setTimerOn(false);    // stop timer
                props.setOngoingCharge();   //no more charge in progress
                props.useCharger(props.id, props.whichCheckbox, 'stop'); // increase available chargers
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

    //translate the id of checked connection to position in the props.connections array
    useEffect(() => {
        setCheckedConnection(
            props.connections.findIndex(connection => connection.id === props.whichCheckbox)
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.whichCheckbox])

    //calculate cost and kWh based on timer
    let currentCharge = Math.floor(timerTime*(props.connections[checkedConnection].powerKw/36))/100;
    let currentCost = 0;
    if(props.connections[checkedConnection].powerKw > 24) currentCost = (Math.floor(timerTime*(props.connections[checkedConnection].powerKw/36)*0.18)/100);
    else if(props.connections[checkedConnection].powerKw > 10) currentCost = (Math.floor(timerTime*2/6)/100);


if (props.user === "") return <div>Only registered users can start charging!</div>
    else if(Object.keys(props.ongoingCharge).length > 0 && props.ongoingCharge.chargerId !== props.id){  //There's an ongoing charge at different charger
        return <div style={{display: 'flex'}}> 
                You are already using a <div className={styles.redirect} onClick = {() => props.flipDetailView(props.ongoingCharge.chargerId)}> &nbsp; different charger. </div>
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