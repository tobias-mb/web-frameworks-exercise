import React from 'react'
import { Map, Marker, TileLayer, Tooltip } from "react-leaflet";

//in the props.chargers need to have charger.coordinates = [Xpos, Ypos] 
export default function MapComponent(props) {
    return (
        <Map center={[60.16952, 24.93545]} zoom={8}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {props.chargers.map( charger => (
            <Marker key = {charger.id}
                    position = {charger.coordinates}
                    onClick={ () => props.flipDetailView(charger.id) } >
                        <Tooltip direction="top"
                                 offset={[-15, 0]}
                                 opacity={1}> {charger.name}
                        </Tooltip>
            </Marker>
          ))}
        </Map>
    )
}
