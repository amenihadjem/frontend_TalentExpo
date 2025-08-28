import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Slider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import L from 'leaflet';
import { useState } from 'react';
import { TileLayer, Circle, Popup, Marker, MapContainer, useMapEvents } from 'react-leaflet';
import { Map } from '@mui/icons-material';

export default function GeoCircleSelector({ handleGeorange }) {
  const [center, setCenter] = useState(null);
  const [radius, setRadius] = useState(5); // Default: 5 km
  const [open, setOpen] = useState(false);

  // Fix leaflet marker icon
  const defaultIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  L.Marker.prototype.options.icon = defaultIcon;

  // Component to handle map clicks
  const ClickHandler = () => {
    useMapEvents({
      click(e) {
        const coords = [e.latlng.lat, e.latlng.lng];
        setCenter(coords);
        console.log('Circle center set to:', coords, 'with radius:', radius, 'km');
      },
    });
    return null;
  };

  const handleRadiusChange = (e) => {
    const newRadius = Number(e.target.value);
    setRadius(newRadius);
    if (center) {
      console.log('Updated circle:', { lat: center[0], lng: center[1], distance: newRadius });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Button
        variant="contained"
        color="primary"
        size="small"
        sx={{ px: 2, gap: 2, py: 1.5, fontWeight: 600, fontSize: 16, boxShadow: 2 }}
        onClick={() => setOpen(true)}
      >
        Select Area <Map />
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 0, overflow: 'hidden', boxShadow: 8 } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            bgcolor: 'background.paper',
            borderBottom: '1px solid #eee',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Select Geographic Area
          </Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
          <Box
            sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
          >
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Radius: {radius} km
            </Typography>
            <Slider
              value={radius}
              min={10}
              max={100}
              step={1}
              onChange={handleRadiusChange}
              valueLabelDisplay="auto"
              sx={{ width: 300 }}
            />
            <Box
              sx={{
                width: { xs: '100%', sm: 500, md: 800 },
                height: 500,
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: 2,
              }}
            >
              <MapContainer
                center={[36.8065, 10.1815]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <ClickHandler />
                {center && (
                  <>
                    <Marker position={center}>
                      <Popup>Selected Center</Popup>
                    </Marker>
                    <Circle center={center} radius={radius * 1000} color="blue" />
                  </>
                )}
              </MapContainer>
            </Box>
            {/* Submit Button */}
            <Button
              variant="contained"
              color="success"
              size="large"
              sx={{
                mt: 3,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: 16,
                boxShadow: 2,
              }}
              disabled={!center}
              onClick={() => {
                if (center) {
                  handleGeorange({ lat: center[0], lng: center[1], distance: radius });
                  setOpen(false);
                }
              }}
            >
              Submit
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
