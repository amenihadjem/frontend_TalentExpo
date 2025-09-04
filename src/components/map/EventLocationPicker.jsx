import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Stack,
  Autocomplete,
  Paper,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import L from 'leaflet';
import { TileLayer, Circle, Popup, Marker, MapContainer, useMapEvents } from 'react-leaflet';
import { cities } from 'src/_mock/_map/cities';
import 'leaflet/dist/leaflet.css';

// Extended cities database with more comprehensive coverage
const extendedCities = [
  ...cities, // Include existing cities
  // Additional US Cities
  { city: 'Miami', state: 'Florida', latitude: 25.7617, longitude: -80.1918, population: '463,347' },
  { city: 'Atlanta', state: 'Georgia', latitude: 33.7490, longitude: -84.3880, population: '498,715' },
  { city: 'Boston', state: 'Massachusetts', latitude: 42.3601, longitude: -71.0589, population: '685,094' },
  { city: 'Las Vegas', state: 'Nevada', latitude: 36.1699, longitude: -115.1398, population: '651,319' },
  { city: 'Detroit', state: 'Michigan', latitude: 42.3314, longitude: -83.0458, population: '670,031' },
  { city: 'Memphis', state: 'Tennessee', latitude: 35.1495, longitude: -90.0490, population: '633,104' },
  { city: 'Portland', state: 'Oregon', latitude: 45.5152, longitude: -122.6784, population: '650,380' },
  { city: 'Nashville', state: 'Tennessee', latitude: 36.1627, longitude: -86.7816, population: '689,447' },
  { city: 'Baltimore', state: 'Maryland', latitude: 39.2904, longitude: -76.6122, population: '576,498' },
  { city: 'Milwaukee', state: 'Wisconsin', latitude: 43.0389, longitude: -87.9065, population: '577,222' },
  { city: 'Albuquerque', state: 'New Mexico', latitude: 35.0844, longitude: -106.6504, population: '560,513' },
  { city: 'Tucson', state: 'Arizona', latitude: 32.2226, longitude: -110.9747, population: '548,073' },
  { city: 'Fresno', state: 'California', latitude: 36.7378, longitude: -119.7871, population: '542,107' },
  { city: 'Sacramento', state: 'California', latitude: 38.5816, longitude: -121.4944, population: '508,529' },
  { city: 'Kansas City', state: 'Missouri', latitude: 39.0997, longitude: -94.5786, population: '508,090' },
  { city: 'Mesa', state: 'Arizona', latitude: 33.4152, longitude: -111.8315, population: '504,258' },
  { city: 'Virginia Beach', state: 'Virginia', latitude: 36.8529, longitude: -75.9780, population: '459,470' },
  { city: 'Omaha', state: 'Nebraska', latitude: 41.2565, longitude: -95.9345, population: '486,051' },
  { city: 'Colorado Springs', state: 'Colorado', latitude: 38.8339, longitude: -104.8214, population: '478,221' },
  { city: 'Raleigh', state: 'North Carolina', latitude: 35.7796, longitude: -78.6382, population: '474,069' },
  { city: 'Long Beach', state: 'California', latitude: 33.7701, longitude: -118.1937, population: '466,742' },
  { city: 'Minneapolis', state: 'Minnesota', latitude: 44.9778, longitude: -93.2650, population: '429,606' },
  { city: 'Oakland', state: 'California', latitude: 37.8044, longitude: -122.2712, population: '433,031' },
  { city: 'Tampa', state: 'Florida', latitude: 27.9506, longitude: -82.4572, population: '399,700' },
  { city: 'Tulsa', state: 'Oklahoma', latitude: 36.1540, longitude: -95.9928, population: '413,066' },
  { city: 'New Orleans', state: 'Louisiana', latitude: 29.9511, longitude: -90.0715, population: '383,997' },
  { city: 'Cleveland', state: 'Ohio', latitude: 41.4993, longitude: -81.6944, population: '383,793' },
  { city: 'Honolulu', state: 'Hawaii', latitude: 21.3099, longitude: -157.8581, population: '347,397' },
  { city: 'Anaheim', state: 'California', latitude: 33.8366, longitude: -117.9143, population: '352,497' },
  { city: 'Lexington', state: 'Kentucky', latitude: 38.0406, longitude: -84.5037, population: '323,152' },
  { city: 'Stockton', state: 'California', latitude: 37.9577, longitude: -121.2908, population: '310,496' },
  { city: 'Corpus Christi', state: 'Texas', latitude: 27.8006, longitude: -97.3964, population: '326,586' },
  { city: 'Riverside', state: 'California', latitude: 33.9533, longitude: -117.3962, population: '331,360' },
  { city: 'Santa Ana', state: 'California', latitude: 33.7455, longitude: -117.8677, population: '334,217' },
  { city: 'Buffalo', state: 'New York', latitude: 42.8864, longitude: -78.8784, population: '278,349' },
  { city: 'St. Paul', state: 'Minnesota', latitude: 44.9537, longitude: -93.0900, population: '308,096' },
  { city: 'Toledo', state: 'Ohio', latitude: 41.6528, longitude: -83.5379, population: '287,208' },
  { city: 'St. Louis', state: 'Missouri', latitude: 38.6270, longitude: -90.1994, population: '301,578' },
  { city: 'Pittsburgh', state: 'Pennsylvania', latitude: 40.4406, longitude: -79.9959, population: '302,971' },
  { city: 'Cincinnati', state: 'Ohio', latitude: 39.1031, longitude: -84.5120, population: '309,317' },
  
  // International Cities
  { city: 'London', state: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, population: '9,648,110' },
  { city: 'Paris', state: 'France', latitude: 48.8566, longitude: 2.3522, population: '2,161,000' },
  { city: 'Lyon', state: 'France', latitude: 45.7640, longitude: 4.8357, population: '516,092' },
  { city: 'Marseille', state: 'France', latitude: 43.2965, longitude: 5.3698, population: '870,018' },
  { city: 'Toulouse', state: 'France', latitude: 43.6047, longitude: 1.4442, population: '479,553' },
  { city: 'Nice', state: 'France', latitude: 43.7102, longitude: 7.2620, population: '342,637' },
  { city: 'Nantes', state: 'France', latitude: 47.2184, longitude: -1.5536, population: '320,732' },
  { city: 'Montpellier', state: 'France', latitude: 43.6110, longitude: 3.8767, population: '295,542' },
  { city: 'Strasbourg', state: 'France', latitude: 48.5734, longitude: 7.7521, population: '290,576' },
  { city: 'Bordeaux', state: 'France', latitude: 44.8378, longitude: -0.5792, population: '257,804' },
  { city: 'Lille', state: 'France', latitude: 50.6292, longitude: 3.0573, population: '236,234' },
  { city: 'Rennes', state: 'France', latitude: 48.1173, longitude: -1.6778, population: '221,272' },
  { city: 'Reims', state: 'France', latitude: 49.2583, longitude: 4.0317, population: '184,984' },
  { city: 'Saint-Étienne', state: 'France', latitude: 45.4397, longitude: 4.3872, population: '172,023' },
  { city: 'Le Havre', state: 'France', latitude: 49.4944, longitude: 0.1079, population: '170,147' },
  { city: 'Toulon', state: 'France', latitude: 43.1242, longitude: 5.9280, population: '176,198' },
  { city: 'Grenoble', state: 'France', latitude: 45.1885, longitude: 5.7245, population: '158,552' },
  { city: 'Dijon', state: 'France', latitude: 47.3220, longitude: 5.0415, population: '156,920' },
  { city: 'Angers', state: 'France', latitude: 47.4784, longitude: -0.5632, population: '154,508' },
  { city: 'Nîmes', state: 'France', latitude: 43.8367, longitude: 4.3601, population: '148,561' },
  { city: 'Villeurbanne', state: 'France', latitude: 45.7660, longitude: 4.8795, population: '148,543' },
  { city: 'Clermont-Ferrand', state: 'France', latitude: 45.7797, longitude: 3.0863, population: '147,284' },
  { city: 'Aix-en-Provence', state: 'France', latitude: 43.5297, longitude: 5.4474, population: '145,133' },
  { city: 'Brest', state: 'France', latitude: 48.3904, longitude: -4.4861, population: '139,676' },
  { city: 'Tours', state: 'France', latitude: 47.3941, longitude: 0.6848, population: '137,658' },
  { city: 'Amiens', state: 'France', latitude: 49.8941, longitude: 2.2958, population: '133,448' },
  { city: 'Limoges', state: 'France', latitude: 45.8336, longitude: 1.2611, population: '132,175' },
  { city: 'Annecy', state: 'France', latitude: 45.8992, longitude: 6.1294, population: '128,199' },
  { city: 'Perpignan', state: 'France', latitude: 42.6886, longitude: 2.8948, population: '121,934' },
  { city: 'Boulogne-Billancourt', state: 'France', latitude: 48.8356, longitude: 2.2410, population: '120,071' },
  { city: 'Orléans', state: 'France', latitude: 47.9029, longitude: 1.9093, population: '117,988' },
  { city: 'Mulhouse', state: 'France', latitude: 47.7508, longitude: 7.3359, population: '109,588' },
  { city: 'Rouen', state: 'France', latitude: 49.4431, longitude: 1.0993, population: '110,755' },
  { city: 'Caen', state: 'France', latitude: 49.1829, longitude: -0.3707, population: '105,512' },
  { city: 'Nancy', state: 'France', latitude: 48.6921, longitude: 6.1844, population: '104,885' },
  { city: 'Argenteuil', state: 'France', latitude: 48.9447, longitude: 2.2470, population: '110,388' },
  { city: 'Cannes', state: 'France', latitude: 43.5528, longitude: 7.0174, population: '74,152' },
  
  // Tunisia
  { city: 'Tunis', state: 'Tunisia', latitude: 36.8065, longitude: 10.1815, population: '1,056,247' },
  { city: 'Sfax', state: 'Tunisia', latitude: 34.7406, longitude: 10.7603, population: '330,440' },
  { city: 'Sousse', state: 'Tunisia', latitude: 35.8256, longitude: 10.6411, population: '271,428' },
  { city: 'Kairouan', state: 'Tunisia', latitude: 35.6781, longitude: 10.0963, population: '186,653' },
  { city: 'Bizerte', state: 'Tunisia', latitude: 37.2746, longitude: 9.8739, population: '142,966' },
  { city: 'Gabès', state: 'Tunisia', latitude: 33.8815, longitude: 10.0982, population: '130,271' },
  { city: 'Ariana', state: 'Tunisia', latitude: 36.8625, longitude: 10.1956, population: '114,486' },
  { city: 'Gafsa', state: 'Tunisia', latitude: 34.4250, longitude: 8.7842, population: '111,170' },
  { city: 'Monastir', state: 'Tunisia', latitude: 35.7643, longitude: 10.8113, population: '104,535' },
  { city: 'Ben Arous', state: 'Tunisia', latitude: 36.7542, longitude: 10.2176, population: '97,687' },
  { city: 'Kasserine', state: 'Tunisia', latitude: 35.1674, longitude: 8.8368, population: '95,979' },
  { city: 'Médenine', state: 'Tunisia', latitude: 33.3548, longitude: 10.5055, population: '91,387' },
  { city: 'Nabeul', state: 'Tunisia', latitude: 36.4561, longitude: 10.7376, population: '79,645' },
  { city: 'Tataouine', state: 'Tunisia', latitude: 32.9297, longitude: 10.4517, population: '75,886' },
  { city: 'Béja', state: 'Tunisia', latitude: 36.7256, longitude: 9.1816, population: '60,227' },
  { city: 'Jendouba', state: 'Tunisia', latitude: 36.5011, longitude: 8.7803, population: '51,408' },
  { city: 'Zaghouan', state: 'Tunisia', latitude: 36.4030, longitude: 10.1424, population: '20,837' },
  { city: 'Siliana', state: 'Tunisia', latitude: 36.0836, longitude: 9.3706, population: '27,947' },
  { city: 'Kef', state: 'Tunisia', latitude: 36.1742, longitude: 8.7048, population: '45,191' },
  { city: 'Mahdia', state: 'Tunisia', latitude: 35.5047, longitude: 11.0624, population: '76,513' },
  { city: 'Sidi Bouzid', state: 'Tunisia', latitude: 35.0381, longitude: 9.4858, population: '43,361' },
  { city: 'Tozeur', state: 'Tunisia', latitude: 33.9197, longitude: 8.1335, population: '37,365' },
  { city: 'Kebili', state: 'Tunisia', latitude: 33.7040, longitude: 8.9690, population: '20,004' },
  { city: 'Hammamet', state: 'Tunisia', latitude: 36.4008, longitude: 10.6119, population: '73,236' },
  { city: 'La Marsa', state: 'Tunisia', latitude: 36.8780, longitude: 10.3247, population: '92,987' },
  { city: 'Carthage', state: 'Tunisia', latitude: 36.8531, longitude: 10.3294, population: '21,276' },
  { city: 'Djerba', state: 'Tunisia', latitude: 33.8076, longitude: 10.8451, population: '163,726' },
  { city: 'Douz', state: 'Tunisia', latitude: 33.4664, longitude: 9.0203, population: '27,365' },
  { city: 'Nefta', state: 'Tunisia', latitude: 33.8731, longitude: 7.8778, population: '24,647' },
  { city: 'Matmata', state: 'Tunisia', latitude: 33.5442, longitude: 9.9648, population: '2,116' },
  { city: 'Chenini', state: 'Tunisia', latitude: 32.9167, longitude: 10.2667, population: '1,200' },
  { city: 'Ksar Ghilane', state: 'Tunisia', latitude: 32.9833, longitude: 9.6167, population: '150' },
  { city: 'Chott el Djerid', state: 'Tunisia', latitude: 33.7000, longitude: 8.4333, population: '500' },
  { city: 'Midoun', state: 'Tunisia', latitude: 33.8087, longitude: 10.9929, population: '74,747' },
  { city: 'Houmt Souk', state: 'Tunisia', latitude: 33.8756, longitude: 10.8578, population: '75,904' },
  { city: 'Zarzis', state: 'Tunisia', latitude: 33.5056, longitude: 11.1122, population: '79,316' },
  { city: 'El Kef', state: 'Tunisia', latitude: 36.1742, longitude: 8.7048, population: '45,191' },
  { city: 'Sbeitla', state: 'Tunisia', latitude: 35.2361, longitude: 9.1169, population: '23,844' },
  { city: 'Meknassy', state: 'Tunisia', latitude: 34.6139, longitude: 8.9689, population: '14,400' },
  { city: 'Redeyef', state: 'Tunisia', latitude: 34.4228, longitude: 8.1458, population: '26,866' },
  { city: 'Metlaoui', state: 'Tunisia', latitude: 34.3206, longitude: 8.4003, population: '38,634' },
  { city: 'Mdhilla', state: 'Tunisia', latitude: 34.3500, longitude: 8.6667, population: '15,000' },
  { city: 'Oudhref', state: 'Tunisia', latitude: 34.6167, longitude: 10.7000, population: '9,058' },
  { city: 'El Hamma', state: 'Tunisia', latitude: 33.8889, longitude: 9.7947, population: '34,835' },
  
  { city: 'Berlin', state: 'Germany', latitude: 52.5200, longitude: 13.4050, population: '3,669,491' },
  { city: 'Tokyo', state: 'Japan', latitude: 35.6762, longitude: 139.6503, population: '37,400,068' },
  { city: 'Sydney', state: 'Australia', latitude: -33.8688, longitude: 151.2093, population: '5,312,163' },
  { city: 'Toronto', state: 'Canada', latitude: 43.6532, longitude: -79.3832, population: '2,930,000' },
  { city: 'Vancouver', state: 'Canada', latitude: 49.2827, longitude: -123.1207, population: '631,486' },
  { city: 'Montreal', state: 'Canada', latitude: 45.5017, longitude: -73.5673, population: '1,704,694' },
  { city: 'Amsterdam', state: 'Netherlands', latitude: 52.3676, longitude: 4.9041, population: '821,752' },
  { city: 'Barcelona', state: 'Spain', latitude: 41.3851, longitude: 2.1734, population: '1,620,343' },
  { city: 'Madrid', state: 'Spain', latitude: 40.4168, longitude: -3.7038, population: '3,223,334' },
  { city: 'Rome', state: 'Italy', latitude: 41.9028, longitude: 12.4964, population: '2,872,800' },
  { city: 'Vienna', state: 'Austria', latitude: 48.2082, longitude: 16.3738, population: '1,911,191' },
  { city: 'Zurich', state: 'Switzerland', latitude: 47.3769, longitude: 8.5417, population: '415,367' },
  { city: 'Stockholm', state: 'Sweden', latitude: 59.3293, longitude: 18.0686, population: '975,551' },
  { city: 'Copenhagen', state: 'Denmark', latitude: 55.6761, longitude: 12.5683, population: '633,710' },
  { city: 'Oslo', state: 'Norway', latitude: 59.9139, longitude: 10.7522, population: '697,549' },
  { city: 'Helsinki', state: 'Finland', latitude: 60.1699, longitude: 24.9384, population: '656,250' },
  { city: 'Dublin', state: 'Ireland', latitude: 53.3498, longitude: -6.2603, population: '1,173,179' },
  { city: 'Brussels', state: 'Belgium', latitude: 50.8503, longitude: 4.3517, population: '1,211,035' },
  { city: 'Prague', state: 'Czech Republic', latitude: 50.0755, longitude: 14.4378, population: '1,318,644' },
  { city: 'Warsaw', state: 'Poland', latitude: 52.2297, longitude: 21.0122, population: '1,790,658' },
  { city: 'Budapest', state: 'Hungary', latitude: 47.4979, longitude: 19.0402, population: '1,752,286' },
  { city: 'Singapore', state: 'Singapore', latitude: 1.3521, longitude: 103.8198, population: '5,850,342' },
  { city: 'Hong Kong', state: 'Hong Kong', latitude: 22.3193, longitude: 114.1694, population: '7,496,981' },
  { city: 'Seoul', state: 'South Korea', latitude: 37.5665, longitude: 126.9780, population: '9,733,509' },
  { city: 'Mumbai', state: 'India', latitude: 19.0760, longitude: 72.8777, population: '20,036,000' },
  { city: 'Delhi', state: 'India', latitude: 28.7041, longitude: 77.1025, population: '16,787,941' },
  { city: 'Bangkok', state: 'Thailand', latitude: 13.7563, longitude: 100.5018, population: '10,156,000' },
  { city: 'Dubai', state: 'UAE', latitude: 25.2048, longitude: 55.2708, population: '3,400,800' },
  { city: 'São Paulo', state: 'Brazil', latitude: -23.5558, longitude: -46.6396, population: '12,325,232' },
  { city: 'Rio de Janeiro', state: 'Brazil', latitude: -22.9068, longitude: -43.1729, population: '6,748,000' },
  { city: 'Buenos Aires', state: 'Argentina', latitude: -34.6118, longitude: -58.3960, population: '3,075,646' },
  { city: 'Mexico City', state: 'Mexico', latitude: 19.4326, longitude: -99.1332, population: '9,209,944' },
  { city: 'Cairo', state: 'Egypt', latitude: 30.0444, longitude: 31.2357, population: '10,230,350' },
  { city: 'Lagos', state: 'Nigeria', latitude: 6.5244, longitude: 3.3792, population: '15,388,000' },
  { city: 'Cape Town', state: 'South Africa', latitude: -33.9249, longitude: 18.4241, population: '4,618,000' },
  { city: 'Istanbul', state: 'Turkey', latitude: 41.0082, longitude: 28.9784, population: '15,519,267' },
  { city: 'Moscow', state: 'Russia', latitude: 55.7558, longitude: 37.6173, population: '12,506,468' },
  { city: 'Tel Aviv', state: 'Israel', latitude: 32.0853, longitude: 34.7818, population: '460,613' }
];

// Fix leaflet marker icon
const defaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export default function EventLocationPicker({ onLocationSelect, initialLocation }) {
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // Default to San Francisco
  const [zoom, setZoom] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState(extendedCities); // Use extended cities
  const [selectedCity, setSelectedCity] = useState(null);
  const [customLocation, setCustomLocation] = useState({
    name: '',
    address: '',
    coordinates: null,
  });

  // Filter cities based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = extendedCities.filter( // Use extended cities
        city =>
          city.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.state.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(extendedCities); // Use extended cities
    }
  }, [searchQuery]);

  // Component to handle map clicks
  const ClickHandler = () => {
    useMapEvents({
      click(e) {
        const coords = [e.latlng.lat, e.latlng.lng];
        setCustomLocation({
          ...customLocation,
          coordinates: coords,
        });
        
        // Reverse geocoding simulation (in real app, you'd use a geocoding API)
        const nearestCity = extendedCities.reduce((prev, curr) => { // Use extended cities
          const prevDistance = Math.sqrt(
            Math.pow(prev.latitude - e.latlng.lat, 2) + Math.pow(prev.longitude - e.latlng.lng, 2)
          );
          const currDistance = Math.sqrt(
            Math.pow(curr.latitude - e.latlng.lat, 2) + Math.pow(curr.longitude - e.latlng.lng, 2)
          );
          return prevDistance < currDistance ? prev : curr;
        });
        
        setCustomLocation({
          name: `Custom Location near ${nearestCity.city}`,
          address: `Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`,
          coordinates: coords,
        });
      },
    });
    return null;
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setMapCenter([city.latitude, city.longitude]);
    setZoom(12);
    
    // Generate venue suggestions based on city
    const venueSuggestions = generateVenueSuggestions(city.city);
    
    const locationData = {
      city: city.city,
      state: city.state,
      coordinates: [city.latitude, city.longitude],
      population: city.population,
      suggestedVenues: venueSuggestions,
      demographics: generateDemographics(city),
      economicData: generateEconomicData(city),
      transportationInfo: generateTransportationInfo(city),
      weatherData: generateWeatherData(city),
    };
    
    setSelectedLocation(locationData);
  };

  const handleCustomLocationConfirm = () => {
    if (customLocation.coordinates && customLocation.name) {
      const locationData = {
        city: customLocation.name,
        state: 'Custom',
        coordinates: customLocation.coordinates,
        address: customLocation.address,
        isCustom: true,
        demographics: generateDefaultDemographics(),
        economicData: generateDefaultEconomicData(),
        transportationInfo: 'Custom location - transportation details to be determined',
        weatherData: generateDefaultWeatherData(),
      };
      
      setSelectedLocation(locationData);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      setOpen(false);
    }
  };

  const generateVenueSuggestions = (cityName) => {
    const venueTypes = ['Convention Center', 'Conference Center', 'Hotel', 'Arena', 'Theater', 'University Campus'];
    return venueTypes.map(type => `${cityName} ${type}`);
  };

  const generateDemographics = (city) => ({
    population: city.population,
    medianAge: Math.floor(Math.random() * 10) + 30,
    medianIncome: `$${Math.floor(Math.random() * 50000) + 50000}`,
    educationLevel: `${Math.floor(Math.random() * 30) + 60}% college educated`,
    techWorkers: `${Math.floor(Math.random() * 20) + 10}% in tech industry`,
  });

  const generateEconomicData = (city) => ({
    unemploymentRate: `${(Math.random() * 5 + 2).toFixed(1)}%`,
    averageRent: `$${Math.floor(Math.random() * 2000) + 1500}/month`,
    businessGrowth: `${(Math.random() * 10 + 2).toFixed(1)}% year-over-year`,
    startupDensity: Math.floor(Math.random() * 500) + 100,
  });

  const generateTransportationInfo = (city) => {
    const airports = [`${city.city} International Airport`, `${city.city} Regional Airport`];
    const publicTransit = ['Subway', 'Bus', 'Light Rail', 'Taxi', 'Rideshare'];
    return {
      airports: airports.slice(0, Math.floor(Math.random() * 2) + 1),
      publicTransit: publicTransit.slice(0, Math.floor(Math.random() * 3) + 2),
      walkabilityScore: Math.floor(Math.random() * 40) + 60,
    };
  };

  const generateWeatherData = (city) => ({
    averageTemp: `${Math.floor(Math.random() * 30) + 50}°F`,
    rainyDays: Math.floor(Math.random() * 100) + 50,
    sunnyDays: Math.floor(Math.random() * 200) + 150,
    bestMonths: ['September', 'October', 'November'],
  });

  const generateDefaultDemographics = () => ({
    population: 'To be determined',
    medianAge: 'N/A',
    medianIncome: 'N/A',
    educationLevel: 'N/A',
    techWorkers: 'N/A',
  });

  const generateDefaultEconomicData = () => ({
    unemploymentRate: 'N/A',
    averageRent: 'N/A',
    businessGrowth: 'N/A',
    startupDensity: 'N/A',
  });

  const generateDefaultWeatherData = () => ({
    averageTemp: 'N/A',
    rainyDays: 'N/A',
    sunnyDays: 'N/A',
    bestMonths: ['To be determined'],
  });

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<LocationOnIcon />}
        onClick={() => setOpen(true)}
        sx={{ mb: 1 }}
        fullWidth
      >
        {selectedLocation ? `Selected: ${selectedLocation.city}` : 'Select Location on Map'}
      </Button>
      
      {selectedLocation && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.neutral' }}>
          <Typography variant="subtitle2" gutterBottom>
            📍 Location Details
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>City:</strong> {selectedLocation.city}, {selectedLocation.state}
            </Typography>
            {selectedLocation.population && (
              <Typography variant="body2">
                <strong>Population:</strong> {selectedLocation.population}
              </Typography>
            )}
            {selectedLocation.suggestedVenues && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Suggested Venues:</strong>
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {selectedLocation.suggestedVenues.slice(0, 3).map((venue, index) => (
                    <Chip key={index} label={venue} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>
      )}

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Select Event Location</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, display: 'flex', height: '100%' }}>
          {/* Sidebar */}
          <Box sx={{ width: 350, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            {/* Search */}
            <Box sx={{ p: 2 }}>
              <Autocomplete
                options={filteredCities}
                getOptionLabel={(city) => `${city.city}, ${city.state}`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search cities worldwide..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                )}
                onChange={(event, value) => {
                  if (value) {
                    handleCitySelect(value);
                  }
                }}
                filterOptions={(options, { inputValue }) => {
                  const filtered = options.filter(
                    (option) =>
                      option.city.toLowerCase().includes(inputValue.toLowerCase()) ||
                      option.state.toLowerCase().includes(inputValue.toLowerCase())
                  );
                  return filtered.slice(0, 50); // Limit to 50 results for performance
                }}
              />
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {filteredCities.length} cities available • US & International
              </Typography>
            </Box>

            <Divider />

            {/* Quick Filters */}
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Quick Filters
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  label="US Major" 
                  size="small" 
                  onClick={() => {
                    const usMajor = extendedCities.filter(city => 
                      ['California', 'New York', 'Texas', 'Florida', 'Illinois'].includes(city.state) && 
                      parseInt(city.population.replace(/,/g, '')) > 500000
                    );
                    setFilteredCities(usMajor);
                  }}
                />
                <Chip 
                  label="France" 
                  size="small" 
                  onClick={() => {
                    const france = extendedCities.filter(city => city.state === 'France');
                    setFilteredCities(france);
                  }}
                />
                <Chip 
                  label="Tunisia" 
                  size="small" 
                  onClick={() => {
                    const tunisia = extendedCities.filter(city => city.state === 'Tunisia');
                    setFilteredCities(tunisia);
                  }}
                />
                <Chip 
                  label="Europe" 
                  size="small" 
                  onClick={() => {
                    const europe = extendedCities.filter(city => 
                      ['United Kingdom', 'France', 'Germany', 'Spain', 'Italy', 'Netherlands', 
                       'Austria', 'Switzerland', 'Sweden', 'Denmark', 'Norway', 'Finland', 
                       'Ireland', 'Belgium', 'Czech Republic', 'Poland', 'Hungary'].includes(city.state)
                    );
                    setFilteredCities(europe);
                  }}
                />
                <Chip 
                  label="Africa" 
                  size="small" 
                  onClick={() => {
                    const africa = extendedCities.filter(city => 
                      ['Tunisia', 'Morocco', 'Egypt', 'South Africa', 'Nigeria', 'Kenya'].includes(city.state)
                    );
                    setFilteredCities(africa);
                  }}
                />
                <Chip 
                  label="Asia" 
                  size="small" 
                  onClick={() => {
                    const asia = extendedCities.filter(city => 
                      ['Japan', 'Singapore', 'Hong Kong', 'South Korea', 'India', 'Thailand', 'UAE'].includes(city.state)
                    );
                    setFilteredCities(asia);
                  }}
                />
                <Chip 
                  label="All Cities" 
                  size="small" 
                  variant="outlined"
                  onClick={() => setFilteredCities(extendedCities)}
                />
              </Stack>
            </Box>

            <Divider />

            {/* Cities List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <Typography variant="subtitle2" sx={{ p: 2, pb: 1 }}>
                {searchQuery || filteredCities.length < extendedCities.length ? 'Filtered Results' : 'Popular Cities'}
              </Typography>
              <List dense>
                {filteredCities.slice(0, 20).map((city, index) => ( // Show top 20 results
                  <ListItem key={index} disablePadding>
                    <ListItemButton onClick={() => handleCitySelect(city)}>
                      <ListItemText 
                        primary={city.city}
                        secondary={`${city.state} • Pop: ${city.population}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
                {filteredCities.length > 20 && (
                  <ListItem>
                    <ListItemText 
                      primary={`${filteredCities.length - 20} more cities...`}
                      secondary="Use search to find specific cities"
                      sx={{ textAlign: 'center', color: 'text.secondary' }}
                    />
                  </ListItem>
                )}
              </List>
            </Box>

            {/* Custom Location */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom>
                Custom Location
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Location name"
                value={customLocation.name}
                onChange={(e) => setCustomLocation({ ...customLocation, name: e.target.value })}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                Click on the map to set coordinates
              </Typography>
              {customLocation.coordinates && (
                <Button
                  size="small"
                  onClick={handleCustomLocationConfirm}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  Use Custom Location
                </Button>
              )}
            </Box>
          </Box>

          {/* Map */}
          <Box sx={{ flex: 1, position: 'relative' }}>
            <MapContainer
              center={mapCenter}
              zoom={zoom}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <ClickHandler />
              
              {selectedCity && (
                <Marker position={[selectedCity.latitude, selectedCity.longitude]}>
                  <Popup>
                    <strong>{selectedCity.city}</strong><br />
                    {selectedCity.state}<br />
                    Population: {selectedCity.population}
                  </Popup>
                </Marker>
              )}
              
              {customLocation.coordinates && (
                <Marker position={customLocation.coordinates}>
                  <Popup>
                    <strong>{customLocation.name}</strong><br />
                    Custom Location
                  </Popup>
                </Marker>
              )}
            </MapContainer>

            {/* Confirm Button */}
            <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1000 }}>
              <Button
                variant="contained"
                onClick={handleConfirmSelection}
                disabled={!selectedLocation}
                startIcon={<LocationOnIcon />}
              >
                Confirm Location
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
