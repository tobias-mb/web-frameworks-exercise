import React, {useState, useEffect} from 'react';
import axios from 'axios';
import SingleInvoice from './SingleInvoice';
import styles from './InvoicesList.module.css'

export default function InvoicesList(props) {

    const [invoices, setInvoices] = useState([]);

    //get invoices for logged in user
    useEffect(() => {
        axios({
            method: 'get',
            url: 'http://localhost:4000/invoices',
            auth: {
                username: props.user,
                password: props.password
            }
        })
        .then(response => {
            setInvoices(response.data);
            console.log('Got invoices.');
        })
        .catch(error => { 
            console.log(error);
            alert("Something went wrong :(");
        })
    }, [props.user, props.password])


    return (
        <ul className={styles.list}>
            {invoices.map(invoice => <SingleInvoice {...invoice} key = {invoice.id} 
                                            charger = { props.chargers.find(charger => charger.id === invoice.chargerId )}
                                            flipDetailView = { props.flipDetailView } />
                        )}
        </ul>
    )
}
