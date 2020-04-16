import React, { Component } from "react";
import { Map, Marker, Popup, TileLayer, GeoJSON, MapControl } from "react-leaflet";
import { Icon } from "leaflet";
import "../App.css";
import uscounties from '../assets/gz_2010_us_050_00_5m.json';
import countyData from '../assets/nytimescounties.json';
import L from 'leaflet';
import MapInfo from "./MapInfo";
import MapLegend from "./MapLegend";
import DataTable from "./DataTable";


const stamenTonerTiles = 'http://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}.png';
const stamenTonerAttr = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const mapCenter = [39.82,-98.57];
const zoomLevel = 4;


console.log(countyData);
let todayDate = "4/12/2020";

let countyArray = [];
for(let i = 0; i < countyData.length; i++) {
	if(countyData[i].date === todayDate) {
		countyArray.push(countyData[i]);
	}
}

console.log(countyArray);

const mapColors = [
    ['#005824', '#238b45', '#41ae76', '#66c2a4', '#99d8c9', '#ccece6', '#edf8fb'],
    ['#990000', '#d7301f', '#ef6548', '#fc8d59', '#fdbb84', '#fdd49e', '#fef0d9']
]

const thresholdData = [
    [10000, 500, 200, 100, 50, 10],
    [200, 100, 50, 25, 10, 5]
];

let allMarkersMap = {};
let currentID = 0;



class DashboardMap extends Component {

    constructor(props) {
        super(props);
        this.state = {
            displayed: "cases",
            colors: mapColors[0],
            limits: thresholdData[0]
        };

        // ES6 React.Component doesn't auto bind methods to itself
        // Need to bind them manually in constructor
        this.changeView = this.changeView.bind(this);
        this.geoJSONStyle = this.geoJSONStyle.bind(this);
        this.onEachFeature = this.onEachFeature.bind(this);
        //this.highlightFeature.bind(this)

    }
    

    geoJSONStyle(feature) {
        let covidCases = 0;
        let covidDeaths = 0;
        let displayData;
    
        console.log("feature.properties looks like:");
        // console.log(feature.properties);
        let geo_id = feature.properties.GEO_ID;
        geo_id = geo_id.substring(geo_id.length - 5);
        console.log(geo_id);
        geo_id = parseInt(geo_id);



        for(let i = 0; i < countyArray.length; i++) {
            if(parseInt(countyArray[i].fips) === geo_id) {
                covidCases = countyArray[i].cases;
                covidDeaths = countyArray[i].deaths;
            }
        }

        // console.log("cases" + covidCases);
        // console.log("deaths" +covidDeaths);
 
        if(this.state.displayed === "cases") {
            // console.log("made it to cases");
            //thresholds = thresholdData[0];
            // mapClr = mapColors[0];
            displayData = covidCases;
        } else {
            // console.log("made it to deaths");
            // thresholds = thresholdData[1];
            // mapClr = mapColors[1];
            displayData = covidDeaths;
        }
        // console.log("***")
        // console.log(thresholds);
 
        // console.log(feature.properties);

        let colorResult;

        if (displayData > this.state.limits[0]) {
            colorResult = this.state.colors[0];
        } else if (displayData > this.state.limits[1]) {
            colorResult = this.state.colors[1];
        } else if (displayData > this.state.limits[2]) {
            colorResult = this.state.colors[2];
        } else if (displayData > this.state.limits[3]) {
            colorResult = this.state.colors[3];
        } else if (displayData > this.state.limits[4]) {
            colorResult = this.state.colors[4];
        } else if (displayData > this.state.limits[5]) {
            colorResult = this.state.colors[5];
        } else {
            colorResult = this.state.colors[6];
        }

        // console.log(colorResult);

        return {
          color: '#1f2021',
          weight: 1,
          fillOpacity: 0.8,
          fillColor: colorResult,
        }
    }
    

    
      onEachFeature(feature, layer) {
        console.log("onEachFeature");
        // console.log(feature.properties);
        // console.log(this.state.displayed)
        let dataToDisplay;
    
        let geo_id = feature.properties.GEO_ID;
        geo_id = geo_id.substring(geo_id.length - 5);
        geo_id = parseInt(geo_id);

        for(let j = 0; j < countyArray.length; j++) {
            // console.log(countyArray[j].state);
            // console.log(markers[i].feature.properties.NAME);
            if(parseInt(countyArray[j].fips) == geo_id) {
                if(this.state.displayed === "cases") {
                    dataToDisplay = countyArray[j].cases;
                } else if (this.state.displayed === "deaths") {
                    dataToDisplay = countyArray[j].deaths;
                }
            }
        }


        // for(let i = 0; i < countyArray.length; i++) {
        //     if(countyArray[i].state == feature.properties.NAME) {
        //         if(this.state.displayed == "cases") {
        //             dataToDisplay = countyArray[i].cases;
        //         } else if (this.state.displayed == "deaths") {
        //             dataToDisplay = countyArray[i].deaths;
        //         }
        //     }
        // }


        const popupContent = `<h4>COVID-19 ${this.state.displayed} data</h4>` +
			'<b>' + feature.properties.NAME + '</b><br />' + dataToDisplay + ` ${this.state.displayed}`;
        let marker = layer.bindPopup(popupContent);
        
        console.log(marker);
        allMarkersMap[currentID] = marker;
        currentID += 1;

        layer.on({
            mouseover: this.highlightFeature.bind(this),
            mouseout: this.resetHighlight.bind(this),
        });
      }

    // mouseover a specific state
    highlightFeature(e) {
        // console.log("mouseover");
        // console.log(e);

        let layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        // if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        //     layer.bringToFront();
        // }

        // console.log("layer.feature is");
        // console.log(layer.feature);
        // info.update(layer.feature.properties);
    }

    resetHighlight(e) {
        // console.log("mouseout");
        let layer = e.target;

        // layer.setStyle({
        //     weight: 1,
        //     color: '#666',
        //     dashArray: '',
        //     fillOpacity: 0.7
        // });
        this.refs.geojson.leafletElement.resetStyle(e.target);
        // layer.resetStyle();
        // info.update();
    }

    zoomToFeature(e) {
        // map.fitBounds(e.target.getBounds());
    }

    changeView(e) {
        let event = e;
        console.log("test function");
        console.log(e.target.value);
        console.log(this);

        let tempColor, tempLimit;

        if(e.target.value === "cases") {
            tempColor = mapColors[0];
            tempLimit = thresholdData[0];
        } else {
            tempColor = mapColors[1];
            tempLimit = thresholdData[1];
        }

        console.log("tempColor = " + tempColor);

        this.setState({
            displayed: e.target.value,
            colors: tempColor,
            limits: tempLimit
        }, function() {
            console.log(this.state);
            

            // convert values of the allMarkersMap object to an array
            let markers = Object.values(allMarkersMap);
            // console.log("********* in testFunction");
            // console.log(markers);
    
            for(let i = 0; i < markers.length; i++) {
    
                let dataToDisplay;
    
                let geo_id = markers[i].feature.properties.GEO_ID;
                geo_id = geo_id.substring(geo_id.length - 5);
                // console.log(geo_id);
                geo_id = parseInt(geo_id);

                for(let j = 0; j < countyArray.length; j++) {
                    // console.log(countyArray[j].state);
                    // console.log(markers[i].feature.properties.NAME);
                    if(parseInt(countyArray[j].fips) == geo_id) {
                        if(this.state.displayed === "cases") {
                            console.log(countyArray[j].cases);
                            dataToDisplay = countyArray[j].cases;
                        } else if (this.state.displayed === "deaths") {
                            dataToDisplay = countyArray[j].deaths;
                        }
                    }
                }
    
                // console.log(`this.state.displayed = ${this.state.displayed}`);
                console.log("dataToDisplay is " + dataToDisplay);
    
    
                let mark = markers[i].getPopup();
                // console.log(markers[i].feature);
                const popupContent = `<h4>COVID-19 ${this.state.displayed} data</h4>` +
                '<b>' + markers[i].feature.properties.NAME + '</b><br />' + dataToDisplay + ` ${this.state.displayed}`;
                mark.setContent(popupContent);
            }
        });
    }

    
    render() {
        return (
            <div>
              <div>
                <Map
                    center={mapCenter}
                    zoom={zoomLevel}
                >
                    <TileLayer
                        attribution={stamenTonerAttr}
                        url={stamenTonerTiles}
                    />
                    <GeoJSON
                      data={uscounties}
                      style={this.geoJSONStyle}
                      onEachFeature={this.onEachFeature}
                      onMouseOut={() => this.resetHighlight}
                      onMouseOver={() => this.highlightFeature}
                      ref="geojson"
                    />
                    <MapInfo />
                    <MapLegend colors={this.state.colors} limits={this.state.limits}/>
                </Map>
            </div>
                
                <div className="custom-control custom-radio">
                    <input type="radio" id="customRadio1" name="customRadio" className="custom-control-input" value="cases" defaultChecked onClick={this.changeView}/>
                    <label className="custom-control-label" htmlFor="customRadio1">Cases</label>
                </div>
                <div className="custom-control custom-radio">
                    <input type="radio" id="customRadio2" name="customRadio" className="custom-control-input" value="deaths" onClick={this.changeView}/>
                    <label className="custom-control-label" htmlFor="customRadio2">Deaths</label>
                </div>
                {/* <DataTable data={countyArray}/> */}
            </div>
          );
        }
      }
      
export default DashboardMap;