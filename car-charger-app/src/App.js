import React from 'react';
import './App.css';
import styles from './App.module.css';
import axios from 'axios';
import LogIn from './components/LogIn';
import ChargerList from './components/ChargerList';
import MapComponent from './components/MapComponent';
import DetailView from './components/DetailView';


class App extends React.Component {
  constructor(props)
  {
    super(props);
    this.state = {
      user: "",  // logged in user
      password: "",
      chargers: [],     // for chargers information
      searchString: "", // for search field
      detailView: 0,    // id of charger open in detail. Or 0 for main view.
      timerOn: false
    }
  }

  toggleTimer = () => {
    if(this.state.timerOn) this.setState({ timerOn: false });
    else this.setState({ timerOn: true });
  }
  setUser = (user, password) => {
    if(this.state.timerOn){
      alert("can't log out while timer is running");
      return;
    }
    this.setState({ user : user,
                    password : password });
  }

  //Update internal state of APP when charger is in use. action = 'start'  / 'stop'
  useCharger = (ID, action) => {
    let findChargerIndex = this.state.chargers.findIndex(charger => charger.id === ID);
    if(findChargerIndex !== -1){

      let chargersCopy = [...this.state.chargers];
      let findChargerCopy = {...chargersCopy[findChargerIndex]};
      (action === 'start')? findChargerCopy.available -= 1 : findChargerCopy.available += 1;
      chargersCopy[findChargerIndex] = findChargerCopy;

      this.setState({ chargers : chargersCopy });
    }
  }

  //get charger data on start
  componentDidMount(){
    axios.get('http://localhost:4000/chargers')
      .then(res => {
        this.setState({ chargers : res.data });
      })
      .catch(err => console.log(err));
  }

  //Monitor the Searchfield
  onSearchFieldChange = (event) => {
    this.setState({ searchString: event.target.value });
  }

  //checks if the search string is part of name, address or type
  searchAllParts = (charger) => {
    if(    charger.name.includes(this.state.searchString)
        || charger.address.includes(this.state.searchString) 
        || charger.type.includes(this.state.searchString) ) return true;
    else return false;
  }

  //used to get detail view for element with id displayId or return to the main view for id = 0
  flipDetailView = (displayId) => {
    if(this.state.timerOn){
      alert("can't close charging while timer is running");
      return;
    }
    if (displayId !== undefined && this.state.detailView === 0){
      this.setState({ detailView : displayId })
    }else{
      this.setState({ detailView : 0 })
    }
  }

  
  render() {
  let renderOutput = <div />
    if (this.state.detailView === 0) {renderOutput =  // Main View
      <div className={styles.App}>
        <h1 className={styles.title}>CarChargerApp</h1>
        <LogIn user = {this.state.user} setUser = {this.setUser} />
        Search: <input type = "text" onChange ={ this.onSearchFieldChange } value={ this.state.searchString } />
        <div style = {{display: 'flex'}}>
          <ChargerList chargers = {this.state.chargers.filter(charger => this.searchAllParts(charger) )} 
                       flipDetailView = {this.flipDetailView} />
          <MapComponent chargers = {this.state.chargers.filter(charger => this.searchAllParts(charger) )} 
                        flipDetailView = {this.flipDetailView} />
        </div>
      </div>
    } else { renderOutput =   //Detail View
      <DetailView flipDetailView = {this.flipDetailView}
                  { ...this.state.chargers.filter(charger => (charger.id === this.state.detailView) )[0] }
                  user = {this.state.user}
                  password = {this.state.password}
                  setUser = {this.setUser}
                  useCharger = {this.useCharger} 
                  timerOn = {this.state.timerOn}
                  toggleTimer = {this.toggleTimer} />
    }
    return renderOutput;
  };
}

export default App;
