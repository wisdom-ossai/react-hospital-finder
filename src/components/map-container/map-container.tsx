import React, { useEffect, useState, useRef, useCallback } from 'react';
import './map-container.scss';
import { GoogleMap, LoadScript, Marker, InfoWindow, StandaloneSearchBox } from '@react-google-maps/api';


interface ICoordinate {
  lng: number;
  lat: number;
  id: string;
};

// interface IContainerProp {
//   center: ICoordinate,
//   zoom: number,
//   isMarkerShown: boolean,
// }

interface IRef {
  map: any;
  searchBox: any;
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


const MapContainer = () => {
  const [markers, setMarkers] = useState([]) as any;
  const [radius, setRadius] = useState([]) as any;
  const [userLocation, setUserLocation] = useState(null) as any;
  const [selectedMarker, setSelectedMarker] = useState(null) as any;
  const [autocomplete, setAutocomplete] = useState(null) as any;
  const [searchedLocation, setSearchedLocation] = useState({
    lat: 42.3600825, lng: -71.0588801,
    id: '3'
  }) as any;

  const mapRef = useRef();
  const placesRef = useRef() as any;
  const onLoad = useCallback((map) => {
    mapRef.current = map
    navigator.geolocation.getCurrentPosition((position: any) => {
      setSearchedLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        id: position.timestamp
      })
    })
    placesRef.current = new google.maps.places.PlacesService(map);
  }, []);

   

  // const onUnmount = React.useCallback(function callback(map) {
  //   setMap(null);
  // }, []);

  useEffect(() => {
    // console.log(process.env.REACT_APP_GOOGLE_API_KEY);
    const request = {
      location: searchedLocation,
      radius: 1000,
      types: ['hospital']
    };

    console.log(request)
    if (placesRef.current) {
      placesRef.current.nearbySearch(request, (result: any, status: any) => {
        console.log(status)
         if (status === 'OK') {
           console.log(result);
           const placesCoordinates = result.map((place: any) => (
             {
               lat: place.geometry.location.lat(),
               lng: place.geometry.location.lng(),
               id: place.id,
               name: place.name,
               icon: place.icon
             }))
           setMarkers(placesCoordinates);
         }
       });
    }
  }, [searchedLocation])
  const handleMapClick = React.useCallback((e: any) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkers((currentMarkers: ICoordinate[]) => [
      ...currentMarkers,
      {
        lat,
        lng
      }
    ])
  }, []);
  
  const handleMarkerClick = (marker: any) => {
    setSelectedMarker(marker)
  };
  
  const handleCloseInfoWindow = () => {
    setSelectedMarker(null)
  };


  
  const onLoadAutocomplete = (autocomplete: any) => {
    console.log('autocomplete: ', autocomplete)

    setAutocomplete(autocomplete);
  }

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      console.log(autocomplete.getPlaces())
      const location = autocomplete.getPlaces();
      console.log(location[0].geometry.location.lat())
      setSearchedLocation({
        lat: location[0].geometry.location.lat(),
        lng: location[0].geometry.location.lng(),
      });

     
    } else {
      console.log('Autocomplete is not loaded yet!')
    }
  }



  return (
    <div className="mapContainer">
      <h1>Hospital Finder</h1>
      {/* 
      <div className="search">
        <MapSearcher />
      </div> */}

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
          // onClick={handleMapClick}
        >
          <StandaloneSearchBox
            onLoad={onLoadAutocomplete}
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
          {/* Child components, such as markers, info windows, etc. */}
          <></>
          {markers.map((marker: ICoordinate) => (
            <Marker
              key={marker.id}
              position={{lat: marker.lat, lng: marker.lng}}
              onClick={() => handleMarkerClick(marker)}
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
                <p>Hospital address goes here</p>
              </div>
            </InfoWindow>
          ) : null}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default React.memo(MapContainer);
