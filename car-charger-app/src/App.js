import React, { useState } from 'react';
import './App.css';
import styles from './App.module.css';
import LogIn from './components/LogIn';
import data from './data.json'
import ChargerList from './components/ChargerList';
import MapComponent from './components/MapComponent';


function App() {

  const [user, setUser] = useState(undefined);
  let chargers = data.chargers;

  return (
    <div className={styles.App}>
      <div className={styles.flex}>
        <h1 className={styles.title}>CarChargerApp</h1>
        <LogIn user = {user} setUser = {setUser} />
      </div>
      <div className={styles.flex}>
        <ChargerList chargers = {chargers} />
        <MapComponent chargers = {chargers} />
      </div>
    </div>
  );
}

export default App;
