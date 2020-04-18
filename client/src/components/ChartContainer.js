import React, {useState} from 'react';
// import './bootstrap.css';
import StateCharts from "./StateCharts";
import StateLineChart from "./StateLineChart";
import CountyCharts from "./CountyCharts";
import nationalData from "../utils/json/us.json";
import statesData from "../utils/json/us-states.json";
import countiesData from "../utils/json/us-counties.json";
import stateNames from "../utils/json/state-names.json";

function ChartContainer() {

  //Returns array all county names in a given state
  const getCounties = (state) => {
    let setOfCounties = new Set();
    for (let i = 0; i < countiesData.length; i++){
      if (countiesData[i].state === state && countiesData[i].county !== "Unknown"){
        setOfCounties.add(countiesData[i].county);
      }
    }
    return Array.from(setOfCounties).sort();
  }
  
  const [selectedState, setSelectedState] = useState(stateNames.sort()[0])
  const [stateDataObj, setStateDataObj] = useState(statesData.filter(st => st.state === stateNames.sort()[0]));
  const [countiesToShow, setCountiesToShow] = useState(getCounties(selectedState));
  const [selectedCounty, setSelectedCounty] = useState(countiesToShow[0]);
  const [countyData, setCountyData] = useState(countiesData.filter(i => i.state === selectedState && i.county === selectedCounty));
  
  // Calculates the per-state average and median of COVID-19 data in the US
  const getNationalAvg = () => {
    let loopState = null;
    let totalCases = nationalData[nationalData.length-1].cases;
    let totalDeaths = nationalData[nationalData.length-1].deaths;
    let casesByState =[];
    let casesByStateDateOne = [];
    let casesByStateDateTwo = [];
    let casesByStateDateThree = [];
    let casesByStateDateFour = [];
    let deathsByStateDateOne = [];
    let deathsByStateDateTwo = [];
    let deathsByStateDateThree = [];
    let deathsByStateDateFour = [];
    let deathsByState =[];

    for (let i = 0; i < stateNames.length; i++){
      loopState = statesData.filter(st => st.state === stateNames[i]);

      casesByStateDateOne.push(loopState[loopState.length-22].cases);
      casesByStateDateTwo.push(loopState[loopState.length-15].cases);
      casesByStateDateThree.push(loopState[loopState.length-8].cases);
      casesByStateDateFour.push(loopState[loopState.length-1].cases);

      deathsByStateDateOne.push(loopState[loopState.length-22].deaths);
      deathsByStateDateTwo.push(loopState[loopState.length-15].deaths);
      deathsByStateDateThree.push(loopState[loopState.length-8].deaths);
      deathsByStateDateFour.push(loopState[loopState.length-1].deaths);

      casesByState.push(loopState[loopState.length-1].cases);
      deathsByState.push(loopState[loopState.length-1].deaths);
      loopState = null;
    }

    return {
      avgCases: Math.round(totalCases / 53),
      avgDeaths: Math.round(totalDeaths / 53),
      dateAvgs: {
        cases: {
          one: Math.round(nationalData[nationalData.length-22].cases / 53),
          two: Math.round(nationalData[nationalData.length-15].cases / 53),
          three: Math.round(nationalData[nationalData.length-8].cases / 53),
          four: Math.round(nationalData[nationalData.length-1].cases / 53)
        },
        deaths: {
          one: Math.round(nationalData[nationalData.length-22].deaths / 53),
          two: Math.round(nationalData[nationalData.length-15].deaths / 53),
          three: Math.round(nationalData[nationalData.length-8].deaths / 53),
          four: Math.round(nationalData[nationalData.length-1].deaths / 53)
        }
      },
      medianCases: casesByState[26],
      medianDeaths: deathsByState[26],
      dateMedians: {
        cases: {
          one: casesByStateDateOne[26],
          two: casesByStateDateTwo[26],
          three: casesByStateDateThree[26],
          four: casesByStateDateFour[26]
        },
        deaths: {
          one: deathsByStateDateOne[26],
          two: deathsByStateDateTwo[26],
          three: deathsByStateDateThree[26],
          four: deathsByStateDateFour[26]
        }
      }
    };
  };

  // Calculates the per-county average and median of COVID-19 data in a given state
  const getStateAvg = () => {
    let loopCounty = null;
    let totalCases = 0;
    let totalDeaths = 0;
    let casesByCounty = [];
    let deathsByCounty = [];
    let mdnCases;
    let mdnDeaths;

    for (let i = 0; i < countiesToShow.length; i++){
      loopCounty = countiesData.filter(item => item.county === countiesToShow[i]);      
      totalCases += loopCounty[loopCounty.length-1].cases;
      totalDeaths += loopCounty[loopCounty.length-1].deaths;
      casesByCounty.push(loopCounty[loopCounty.length-1].cases);
      deathsByCounty.push(loopCounty[loopCounty.length-1].deaths);
      loopCounty = null;
    }

    // Sorting arrays
    let cbcSorted = casesByCounty.sort(function(a, b){return a-b});
    let dbcSorted = deathsByCounty.sort(function(a, b){return a-b});

    // Calculating median cases and deaths
    if (countiesToShow.length % 2){
      mdnCases = cbcSorted[Math.round(cbcSorted.length / 2)-1];
      mdnDeaths = dbcSorted[Math.round(dbcSorted.length / 2)-1];
    } else {
      mdnCases = (cbcSorted[(cbcSorted.length / 2)-1] + cbcSorted[cbcSorted.length / 2]) / 2;
      mdnDeaths = (dbcSorted[(dbcSorted.length / 2)-1] + dbcSorted[dbcSorted.length / 2]) / 2;
    }

    return {
      test: totalCases,
      avgCases: Math.round(totalCases / countiesToShow.length),
      avgDeaths: Math.round(totalDeaths / countiesToShow.length),
      medianCases: mdnCases,
      medianDeaths: mdnDeaths
    };
  };

  // Runs whenever there's a change in the state dropdown menu
  const handleStateChange = e => {
    let counties = getCounties(e.target.value);
    setSelectedState(e.target.value);
    setStateDataObj(statesData.filter(st => st.state === e.target.value))
    setCountiesToShow(counties);
    setSelectedCounty(counties[0]);
    setCountyData(countiesData.filter(i => i.state === e.target.value && i.county === counties[0]));
  }
  
  // Runs whenever there's a change in the county dropdown menu
  const handleCountyChange = e => {
    setSelectedCounty(e.target.value);
    setCountyData(countiesData.filter(i => i.state === selectedState && i.county === e.target.value));
  }

  return (
    <div id="chart-stuff">
      <div className="row">
        <div className="col-12">
          <label htmlFor="state">State</label>
          <select onChange={handleStateChange} class="form-control" id="stateSelect">
            {stateNames.sort().map(name => (
              <option>{name}</option>
            ))}
          </select>
        </div>
      </div>
      <StateCharts
        stateName = {selectedState}
        mostRecentData = {stateDataObj[stateDataObj.length-1]}
        nationalAvgs = {getNationalAvg()}
      />
      <StateLineChart
        stateName = {selectedState}
        stateData = {stateDataObj}
        mostRecentData = {stateDataObj[stateDataObj.length-1]}
        nationalAvgs = {getNationalAvg()}
        nationalData = {nationalData}
      />
      <div className="row">
        <div className="col-12">
          <label htmlFor="county">County</label>
          <select onChange={handleCountyChange} class="form-control" id="countySelect">
            {countiesToShow.map(county => (
              <option>{county}</option>
              ))}
          </select>
        </div>
      </div>
      <CountyCharts
        stateName = {selectedState}
        mostRecentData = {stateDataObj[stateDataObj.length-1]}
        counties = {countiesToShow}
        county = {selectedCounty}
        countyData = {countyData}
        stateAvgs = {getStateAvg()}
      />
    </div>
  );
}

export default ChartContainer;