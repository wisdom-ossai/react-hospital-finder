import React, { useEffect, useState, useRef, useCallback } from 'react';
import './map-container.scss';
import { GoogleMap, LoadScript, Marker, InfoWindow, StandaloneSearchBox } from '@react-google-maps/api';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';


interface ICoordinate {
  lng: number;
  lat: number;
  id: string;
};

interface IPlace {
  lng: number;
  lat: number;
  id: string;
  name: string,
  icon: string
};

interface INearbySearchResult {

}

const containerStyle = {
  width: '100%',
  height: '100vh',
};



const libraries = ['places']
const options = {
  disableDefaultUI: true,
  zoomControl: true
}
const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 220,
      
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }),
);


const MapContainer = () => {
  const classes = useStyles();

  const [markers, setMarkers] = useState([]) as any;
  const [radius, setRadius] = useState(1000) as any;
  const [selectedMarker, setSelectedMarker] = useState(null) as any;
  const [searchValue, setSearchValue] = useState(null) as any;
  const [searchedLocation, setSearchedLocation] = useState({
    lat: 42.3600825, lng: -71.0588801,
    id: '3'
  }) as any;

  const mapRef = useRef();
  const placesRef = useRef<google.maps.places.PlacesService>();
  const onLoad = useCallback((map) => {
    mapRef.current = map
    navigator.geolocation.getCurrentPosition(position => {
      setSearchedLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        id: position.timestamp
      })
    })
    placesRef.current = new google.maps.places.PlacesService(map);
  }, []);

  useEffect(() => {
    const request: google.maps.places.PlaceSearchRequest = {
      location: searchedLocation,
      radius,
      types: ['hospital']
    };

    if (placesRef.current) {
      placesRef.current.nearbySearch(request, (result: google.maps.places.PlaceResult[], status: string) => {
         if (status === 'OK') {
           console.log(result);
           const places = result.map((place: any) => (
             {
               lat: place.geometry.location.lat(),
               lng: place.geometry.location.lng(),
               id: place.id,
               name: place.name,
               icon: place.icon
             }))
           setMarkers(places);
         }
       });
    }
  }, [searchedLocation, radius])
  
  const handleMarkerClick = (marker: any) => {
    setSelectedMarker(marker)
  };
  
  const handleCloseInfoWindow = () => {
    setSelectedMarker(null)
  };


  
  const onSearchBoxLoad = (value: any) => {
    setSearchValue(value);
  }

  const onPlaceChanged = () => {
    if (searchValue !== null) {
      const location = searchValue.getPlaces();
      setSearchedLocation({
        lat: location[0].geometry.location.lat(),
        lng: location[0].geometry.location.lng(),
      });

     
    } else {
      console.log('Autocomplete is not loaded yet!')
    }
  }

  const handleSelectionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRadius(event.target.value as string);
  };




  return (
    <div className="mapContainer">
      <h1>Hospital Finder</h1>

      <LoadScript
        googleMapsApiKey={apiKey}
        libraries={libraries}
        onLoad={() => console.log('map script loaded')}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{lat: searchedLocation.lat, lng: searchedLocation.lng}}
          zoom={17}
          onLoad={onLoad}
          // onUnmount={onUnmount}
          options={options}
        >
          <StandaloneSearchBox
            onLoad={onSearchBoxLoad}
            onPlacesChanged={onPlaceChanged}
          >
            <input
              type="text"
              placeholder="Customized your placeholder"
              style={{
                boxSizing: `border-box`,
                border: `1px solid transparent`,
                width: `240px`,
                height: `32px`,
                padding: `0 12px`,
                borderRadius: `3px`,
                boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                fontSize: `14px`,
                outline: `none`,
                textOverflow: `ellipses`,
                position: 'absolute',
                left: '50%',
                marginLeft: '-120px',
              }}
            />
          </StandaloneSearchBox>
          <div className='selector'>
            <FormControl variant="filled" className={classes.formControl}>
              <InputLabel id="radius-label">Radius</InputLabel>
              <Select
                labelId="radius-label"
                id="select-outlined"
                value={radius}
                onChange={handleSelectionChange}
                label="Radius"
                placeholder='Select Radius'
              >
                <MenuItem value={500}>Lessthan 1Km</MenuItem>
                <MenuItem value={1000}>1Km</MenuItem>
                <MenuItem value={2000}>2Km</MenuItem>
                <MenuItem value={5000}>5Km</MenuItem>
                <MenuItem value={10000}>10Km</MenuItem>
                <MenuItem value={15000}>15Km</MenuItem>
                <MenuItem value={20000}>20Km</MenuItem>
              </Select>
            </FormControl>
          </div>

          {markers.map((marker: ICoordinate) => (
            <Marker
              key={marker.id}
              position={{lat: marker.lat, lng: marker.lng}}
              onClick={() => handleMarkerClick(marker)}
              title='Click to view details'
            />
          ))}

          {selectedMarker ? (
            <InfoWindow
              position={{lat: selectedMarker.lat, lng: selectedMarker.lng}}
              onCloseClick={handleCloseInfoWindow}
            >
              <div>
                <img src={selectedMarker.icon} alt='marker icon' width='20' height='20' />
                <h3>{selectedMarker.name}</h3>
                {/* <p>Hospital address goes here</p> */}
              </div>
            </InfoWindow>
          ) : null}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default React.memo(MapContainer);
