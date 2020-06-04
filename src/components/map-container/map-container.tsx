import React from 'react';
import { GoogleMap, withGoogleMap, withScriptjs, Marker } from 'react-google-maps';
import { compose, withProps } from 'recompose';

interface ICoordinate {
  lng: number;
  lat: number
};

interface IContainerProp {
  center: ICoordinate,
  zoom: number,
  isMarkerShown: boolean
}

const MapContainer = compose<IContainerProp, any>(
  withProps({
    googleMapURL: 'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyAWz0VEd58l7U08Te5_7kHzpKgGoqfdCUY',
    loadingElement: <div style={{ height: `100vh` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100vh` }} />
  }),
  withScriptjs,
  withGoogleMap
)((props: IContainerProp) => {
  return (
    <GoogleMap
      defaultCenter={props.center}
      defaultZoom={props.zoom}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: true,
      }}
    >
      {props.isMarkerShown && (
        <Marker position={{ lat: props.center.lat, lng: props.center.lng }} />
      )}
    </GoogleMap>
  );
});

export default MapContainer;
