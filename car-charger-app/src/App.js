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
      user: undefined,
      chargers: [],
      searchString: "",
      detailView: 0
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

  //used to get detail view for element with id displayId or return to the main view
  flipDetailView = (displayId) => {
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
        <div className={styles.flex}>
          <h1 className={styles.title}>CarChargerApp</h1>
          <LogIn user = {this.state.user} setUser = {this.setUser} />
        </div>
        Search: <input type = "text" onChange ={ this.onSearchFieldChange } value={ this.state.searchString } />
        <div className={styles.flex}>
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
                  setUser = {this.setUser}/>
    }
    return renderOutput;
  };
}

export default App;
