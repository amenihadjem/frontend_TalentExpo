import 'tippy.js/dist/tippy.css';

import * as d3 from 'd3';
import { useState, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import { Geography, Geographies, ComposableMap, ZoomableGroup } from 'react-simple-maps';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CardContent from '@mui/material/CardContent';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import axios, { endpoints } from 'src/lib/axios';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const countryNameMap = {
  'united states of america': 'united states',
  'united states': 'united states',
  usa: 'united states',
  'south korea': 'south korea',
  'korea, republic of': 'south korea',
  russia: 'russia',
  'russian federation': 'russia',
  uk: 'united kingdom',
  'united kingdom': 'united kingdom',
  czechia: 'czech republic',
  iran: 'iran',
  vietnam: 'vietnam',
  // Add more mappings if needed
};

export function AnalyticsCandidateMap() {
  const theme = useTheme();
  const [countryCounts, setCountryCounts] = useState({});
  const [groupedCandidates, setGroupedCandidates] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([0, 0]);

  useEffect(() => {
    const fetchCountryData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(endpoints.analytics.map);
        const buckets = res.data?.data?.cv_by_country?.buckets || [];

        const counts = {};
        const grouped = {};
        buckets.forEach((b) => {
          const name = b.key.toLowerCase();
          counts[name] = b.doc_count;
          grouped[name] = Array.from({ length: Math.min(b.doc_count, 5) }, (_, i) => ({
            id: `${name}-${i}`,
            full_name: `Candidate ${i + 1}`, // placeholder names
            location_country: name,
          }));
        });

        setCountryCounts(counts);
        setGroupedCandidates(grouped);
      } catch (err) {
        console.error('Error fetching country data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCountryData();
  }, []);

  const handleCountryClick = (geo) => {
    let name = geo.properties.name?.toLowerCase();
    if (countryNameMap[name]) {
      name = countryNameMap[name];
    }
    if (!groupedCandidates[name] || groupedCandidates[name].length === 0) return;
    setSelectedCountry(name);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const maxCount = Math.max(...Object.values(countryCounts), 0);
  const colorScale = d3
    .scaleLinear()
    .domain([0, maxCount])
    .range([theme.palette.grey[200], theme.palette.primary.main]);

  return (
    <Card>
      <CardHeader
        title="Candidates by Country"
        subheader="Click a country to view candidates"
        sx={{
          bgcolor: theme.palette.background.primary,
          color: theme.palette.text.primary,
        }}
      />
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: theme.spacing(4),
          }}
        >
          {/* Map */}
          <Box sx={{ flex: 2 }}>
            <ComposableMap projectionConfig={{ scale: 120 }} width={800} height={400}>
              <ZoomableGroup
                zoom={zoom}
                center={center}
                onMoveEnd={({ zoom: newZoom, coordinates }) => {
                  setZoom(newZoom);
                  setCenter(coordinates);
                }}
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      let countryName = geo.properties.name?.toLowerCase();
                      if (countryNameMap[countryName]) {
                        countryName = countryNameMap[countryName];
                      }
                      const count = countryCounts[countryName] || 0;

                      return (
                        <Tippy
                          key={geo.rsmKey}
                          content={`${geo.properties.name}: ${count} candidate${count !== 1 ? 's' : ''}`}
                          delay={100}
                          duration={[300, 250]}
                        >
                          <Geography
                            geography={geo}
                            fill={count ? colorScale(count) : theme.palette.grey[100]}
                            stroke={theme.palette.divider}
                            onClick={count > 0 ? () => handleCountryClick(geo) : undefined}
                            style={{
                              default: {
                                outline: 'none',
                                cursor: count > 0 ? 'pointer' : 'default',
                              },
                              hover: {
                                fill:
                                  count > 0 ? theme.palette.primary.dark : theme.palette.grey[300],
                                outline: 'none',
                                cursor: count > 0 ? 'pointer' : 'default',
                              },
                              pressed: { outline: 'none' },
                            }}
                          />
                        </Tippy>
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </Box>

          {/* Candidate List with Close Button
          {selectedCountry && groupedCandidates[selectedCountry]?.length > 0 && (
            <Box sx={{ flex: 1, minWidth: 240 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 'bold',
                  }}
                >
                  {`Candidates from ${selectedCountry.charAt(0).toUpperCase() + selectedCountry.slice(1)}`}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setSelectedCountry(null)}
                  aria-label="close candidates list"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <Card
                variant="outlined"
                sx={{
                  maxHeight: 400,
                  overflowY: 'auto',
                  bgcolor: theme.palette.background.primary,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                }}
              >
                <List dense>
                  {groupedCandidates[selectedCountry].map((c) => (
                    <ListItem key={c.id} divider>
                      <ListItemText
                        primary={c.full_name}
                        primaryTypographyProps={{ color: 'text.primary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Box>
          )} */}
        </Box>
      </CardContent>
    </Card>
  );
}
