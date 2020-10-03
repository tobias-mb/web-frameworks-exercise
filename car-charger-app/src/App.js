import React from 'react';
import './App.css';
import styles from './App.module.css';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import LogIn from './components/LogIn';
import ChargerList from './components/ChargerList';
import MapComponent from './components/MapComponent';


class App extends React.Component {
  constructor(props)
  {
    super(props);
    this.state = {
      user: undefined,
      chargers: []
    }
  }
  setUser = (user) => {
    this.setState({ user : user });
  }

  componentDidMount(){
    axios.get('http://localhost:4000/chargers')
      .then(res => {
        this.setState({ chargers : res.data });
      })
      .catch(err => console.log(err));
  }

  render() {
  let renderOutput = <div />
    renderOutput =
      <div className={styles.App}>
        <div className={styles.flex}>
          <h1 className={styles.title}>CarChargerApp</h1>
          <LogIn user = {this.state.user} setUser = {this.setUser} />
        </div>
        <div className={styles.flex}>
          <ChargerList chargers = {this.state.chargers} />
          <MapComponent chargers = {this.state.chargers} />
        </div>
      </div>
    return renderOutput;
  };
}

export default App;
