import React, {useState, useEffect} from 'react';
import axios from 'axios';
import SingleInvoice from './SingleInvoice';
import styles from './InvoicesList.module.css'

//list invoices of the user
export default function InvoicesList(props) {

    const [invoices, setInvoices] = useState([]);

    //get invoices for logged in user
    useEffect(() => {
        axios({
            method: 'get',
            url: 'http://100.25.155.186/invoices',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (
        <ul className={styles.list}>
            {invoices.map(invoice => <SingleInvoice {...invoice} key = {invoice.id} 
                                            charger = { props.chargers.find(charger => charger.id === invoice.chargerId )}
                                            flipDetailView = { props.flipDetailView } />
                        )}
        </ul>
    )
}
