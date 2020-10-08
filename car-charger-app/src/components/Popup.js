import React from 'react';

//Username and Password field of the Log In
export default function Popup(props) {

    const onEnter = (e) => {
        props.authUser(props.usernameString, props.passwordString);
        e.preventDefault();
    }

    return (
        <div >
            <div style = {{display: 'flex'}} >
                <button onClick={props.togglePopup}> X </button>
                <button onClick={() => props.authUser(props.usernameString, props.passwordString) }> Log In </button>
                <button onClick={() => props.registerUser(props.usernameString, props.passwordString) }> Register </button>
            </div>
            <form style={{display: 'flex'}} onSubmit={onEnter} >
                <div>Username: &nbsp; </div>
                <input type = "text" onChange ={ props.onUsernameFieldChange } value={ props.usernameString }/>
            </form>
            <form style={{display: 'flex'}} onSubmit={onEnter} >
                <div>Password: &nbsp;&nbsp; </div>
                <input type = "text" onChange ={ props.onPasswordFieldChange } value={ props.passwordString } />
            </form>
            <div> &nbsp; </div>
        </div>
    )
}
