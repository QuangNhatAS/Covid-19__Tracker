import React, { useState, useEffect } from 'react';
import { FormControl, Select, MenuItem, Card, CardContent} from '@material-ui/core'
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { sortData, prettyPrintStat } from './ultil';
import LineGraph from './LineGraph';
import 'leaflet/dist/leaflet.css';

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('ww');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({lat: 10.762622, lng: 106.660172});
  const [mapZoom, setMapZoom] = useState(4);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState();
  //state = how to write a variable in react

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    });
  },[]);

  //useEffect = run a pieces of code base on condition
  useEffect(() => {
    //the code inside here will run once 
    //when the component loads and not again
    //async -> send a request, wait for it, do something
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map(country => (
          {
            name: country.country, //United State, Viet Nam...
            value: country.countryInfo.iso2 //US, VN ...
          }
        ));
        const sortedData = sortData(data);
        setTableData(sortedData);
        setCountries(countries);
        setMapCountries(data);
      } )
    };
    getCountriesData();
  }, [])

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);

    const url = countryCode === "ww" ? "https://disease.sh/v3/covid-19/all" : 
    `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
    .then((response) => response.json())
    .then((data) => {
      setCountry(countryCode);
      setCountryInfo(data);
      // console.log(data);

      setMapCenter([data.countryInfo.lat,data.countryInfo.long]);
      setMapZoom(3);
    });
  };
  
  // console.log(countryInfo);
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" onChange={onCountryChange} value={country}>
              <MenuItem value="ww">Worldwide</MenuItem>
              {
                countries.map(country => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>

        </div>
        <div className="app__stats">
          <InfoBox
            isRed
            active = {casesType === 'cases'}
            onClick= {e => setCasesType('cases')}
            title='Coronavirus cases' 
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={prettyPrintStat(countryInfo.cases)}
          />
          <InfoBox
            active = {casesType === 'recovered'}
            onClick= {e => setCasesType('recovered')}
            title='Recovered' 
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <InfoBox 
            isRed
            active = {casesType === 'deaths'}
            onClick= {e => setCasesType('deaths')}
            title='Death' 
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>

        <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom}/>
      </div>
      
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases By Country</h3>
          <Table countries={tableData}/>
            <h3>Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
