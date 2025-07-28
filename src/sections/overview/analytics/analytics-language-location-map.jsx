import React, { useState, useEffect } from 'react';
import { GoogleMap, HeatmapLayer, useJsApiLoader } from '@react-google-maps/api';

import Card from '@mui/material/Card';
// import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

// ----------------------------------------------------------------------

export function AnalyticsLanguageLocationMap({
  title = 'Language & Location Distribution',
  subheader = 'Diversity and reach of the candidate pool',
  data,
  chartOptions,
  sx,
  ...other
}) {
  //   const theme = useTheme();

  // Define map container style and center coordinates
  const containerStyle = {
    width: '100%',
    height: '420px',
  };
  const center = { lat: 20.5937, lng: 78.9629 }; // Default center (India)

  const [heatMapData, setHeatMapData] = useState([]);
  const { isLoaded, loadError, google } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAGoaXcL5QckX2TlNwtEPEp1mKn03hd1So', // Replace with your valid API key
    libraries: ['visualization'], // Include visualization library for HeatMapLayer
  });

  useEffect(() => {
    if (data && data.features && google) {
      // Process the mock data and convert it to a format suitable for HeatmapLayer
      const heatData = data.features.map((feature) => ({
        location: new google.maps.LatLng(
          feature.geometry.coordinates[1],
          feature.geometry.coordinates[0]
        ),
        weight: feature.properties.population / 1000000, // Scale weight by population (or adjust as needed)
      }));
      setHeatMapData(heatData);
    }
  }, [data, google]); // Re-run effect when data or google object changes

  if (loadError) {
    return <div>Error loading map</div>;
  }

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={2} // Adjust zoom level based on your data
      >
        <HeatmapLayer
          data={heatMapData}
          options={{
            radius: 3000, // Adjust radius for the heat map
            opacity: 0.6, // Adjust opacity for heat intensity
            dissipating: true, // Dissipates heat as it spreads out
          }}
        />
      </GoogleMap>
    </Card>
  );
}
