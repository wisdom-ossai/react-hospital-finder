import React, {useState} from 'react';
import MapContainer from './components/map-container/map-container';




function App() {
  const [center, setCenter] = useState({
    lat: 6.465422,
    lng: 3.406448,
  });
  const [zoom, setZoom] = useState(7);
  return (
    <div className="App">
      <MapContainer
        center={center}
        zoom={zoom}
        isMarkerShown
      />
    </div>
  );
}

export default App;
