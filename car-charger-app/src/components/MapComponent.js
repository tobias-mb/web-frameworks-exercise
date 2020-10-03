import React from 'react'
import { Map, Marker, TileLayer, Tooltip } from "react-leaflet";

export default function MapComponent(props) {
    return (
        <Map center={[60.16952, 24.93545]} zoom={12}>
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
