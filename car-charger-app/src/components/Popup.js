import React from 'react';

export default function Popup(props) {
    return (
        <div >
            <div style = {{display: 'flex'}} >
                <button onClick={props.togglePopup}> X </button>
                <button onClick={() => props.authUser(props.usernameString, props.passwordString) }> Log In </button>
                <button onClick={() => props.registerUser(props.usernameString, props.passwordString) }> Register </button>
            </div>
            <div style={{display: 'flex'}} >
                <div>Username: &nbsp; </div>
                <input type = "text" onChange ={ props.onUsernameFieldChange } value={ props.usernameString } />
            </div>
            <div style={{display: 'flex'}} >
                <div>Password: &nbsp; </div>
                <input type = "text" onChange ={ props.onPasswordFieldChange } value={ props.passwordString } />
            </div>
            <div> &nbsp; </div>
        </div>
    )
}
