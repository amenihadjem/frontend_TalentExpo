import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LoadingButton from '@mui/lab/LoadingButton';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Chart, useChart } from 'src/components/chart';
import { countries } from 'src/assets/data';
import { allLangs } from 'src/locales/all-langs';
import EventLocationPicker from 'src/components/map/EventLocationPicker';
import { useAuthContext } from 'src/auth/hooks';
import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

// Countries for virtual events (transformed from assets/data/countries.js)
const COUNTRIES_LIST = countries.map(country => ({
  code: country.code,
  name: country.label,
  flag: `https://flagcdn.com/16x12/${country.code.toLowerCase()}.png`
}));

// Available languages for events
const LANGUAGES_LIST = allLangs.map(lang => ({
  code: lang.value,
  name: lang.label,
  flag: `https://flagcdn.com/16x12/${lang.countryCode.toLowerCase()}.png`
}));




// Virtual platforms data
const VIRTUAL_PLATFORMS = [
  { name: 'Zoom', features: ['Breakout rooms', 'Screen sharing', 'Recording', 'Webinars'], maxParticipants: 1000 },
  { name: 'Microsoft Teams', features: ['Breakout rooms', 'Screen sharing', 'Recording', 'Live events'], maxParticipants: 1000 },
  { name: 'Google Meet', features: ['Screen sharing', 'Recording', 'Live streaming'], maxParticipants: 500 },
  { name: 'WebEx', features: ['Breakout rooms', 'Screen sharing', 'Recording', 'Polls'], maxParticipants: 1000 },
  { name: 'GoToWebinar', features: ['Polls', 'Q&A', 'Recording', 'Analytics'], maxParticipants: 3000 },
  { name: 'Hopin', features: ['Virtual venue', 'Networking', 'Expo booths', 'Multiple stages'], maxParticipants: 100000 },
  { name: 'Remo', features: ['Virtual venue', 'Networking tables', 'Presentations', 'Breakout rooms'], maxParticipants: 500 },
  { name: 'BigMarker', features: ['Virtual venue', 'Networking', 'Analytics', 'Monetization'], maxParticipants: 10000 },
];

// Form validation schema
// const VirtualPlatformSchema = zod.object({
//   platform_name: zod.string().min(1, { message: 'Platform name is required!' }),
//   platform_link: zod.string().url({ message: 'Please enter a valid URL!' }).optional(),
//   max_participants: zod.string().min(1, { message: 'Maximum participants is required!' }),
//   features: zod.array(zod.string()).optional(),
//   access_requirements: zod.string().optional(),
// });


// const DaySchema = zod.object({
//   event_date: zod.string().min(1, { message: 'Event date is required!' }),
//   start_time: zod.string().min(1, { message: 'Start time is required!' }),
//   end_time: zod.string().min(1, { message: 'End time is required!' }),
//   venue_name: zod.string().optional(), // Optional for virtual events
//   venue_capacity: zod.string().optional(), // Optional for virtual events  
//   virtual_platform: VirtualPlatformSchema.optional(),
//   primary_sector: zod.string().min(1, { message: 'Primary sector is required!' }),
//   speakers: zod.string().optional(),
//   activities: zod.string().optional(),
//   additional_info: zod.string().optional(),
// });

// const InfluencerSchema = zod.object({
//   name: zod.string().optional(),
//   followers_count: zod.string().optional(),
//   expected_reach: zod.string().optional(),
//   expected_reaction: zod.string().optional(),
// });

// const MarketingChannelSchema = zod.object({
//   audience: zod.string().optional(),
//   placement: zod.string().optional(),
//   reach: zod.string().optional(),
//   reaction: zod.string().optional(),
//   budget: zod.string().optional(),
//   timeline: zod.string().optional(),
//   content_type: zod.string().optional(),
//   additional_info: zod.string().optional(),
//   influencer_partnerships: zod.array(InfluencerSchema).optional(),
// });

// const MarketingStrategySchema = zod.object({
//   facebook: MarketingChannelSchema,
//   instagram: MarketingChannelSchema,
//   linkedin: MarketingChannelSchema,
//   x_twitter: MarketingChannelSchema,
//   youtube: MarketingChannelSchema,
//   google_ads: MarketingChannelSchema,
//   email_campaign: MarketingChannelSchema,
//   whatsapp_campaign: MarketingChannelSchema,
//   offline_publicity: MarketingChannelSchema,
//   reddit: MarketingChannelSchema,
//   meetup: MarketingChannelSchema,
//   eventbrite: MarketingChannelSchema,
//   indeed_events: MarketingChannelSchema,
// });

// const CountryMarketingSchema = zod.object({
//   country_code: zod.string().min(2, { message: 'Country code is required!' }),
//   country_name: zod.string().min(1, { message: 'Country name is required!' }),
//   marketing_strategy: zod.object({
//     facebook: MarketingChannelSchema.optional(),
//     instagram: MarketingChannelSchema.optional(),
//     linkedin: MarketingChannelSchema.optional(),
//     x_twitter: MarketingChannelSchema.optional(),
//     youtube: MarketingChannelSchema.optional(),
//     google_ads: MarketingChannelSchema.optional(),
//     email_campaign: MarketingChannelSchema.optional(),
//     whatsapp_campaign: MarketingChannelSchema.optional(),
//     offline_publicity: MarketingChannelSchema.optional(),
//     reddit: MarketingChannelSchema.optional(),
//     meetup: MarketingChannelSchema.optional(),
//     eventbrite: MarketingChannelSchema.optional(),
//     indeed_events: MarketingChannelSchema.optional(),
//   }).optional(),
// });

// const TabFormSchema = zod.object({
//   event_name: zod.string().min(1, { message: 'Event name is required!' }),
//   event_type: zod.enum(['in-person', 'virtual', 'hybrid'], { message: 'Event type is required!' }),
//   event_language: zod.string().min(1, { message: 'Event language is required!' }),
//   event_description: zod.string().min(1, { message: 'Event description is required!' }),
//   city: zod.string().optional(), // Optional for virtual events
//   target_countries: zod.array(zod.string()).optional(), // For virtual/hybrid events
//   country_marketing: zod.array(CountryMarketingSchema).optional(), // Country-specific marketing
//   number_of_days: zod.number().min(1, { message: 'Number of days must be at least 1!' }),
//   days: zod.array(DaySchema).min(1, { message: 'At least one day is required!' }),
//   marketing_strategy: MarketingStrategySchema.optional(), // For in-person events
// });

// ----------------------------------------------------------------------

export default function SimulatePage() {
  // State for managing tabs
  const [tabs, setTabs] = useState([
    {
      id: 1,
      name: 'Tab 1',
      saved: false,
      result: null,
      loading: false,
      locationData: null,
    },
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const [tabCounter, setTabCounter] = useState(2);

  // Dialog states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabToDelete, setTabToDelete] = useState(null);
  const [saveTabName, setSaveTabName] = useState('');
  const [isSavingTab, setIsSavingTab] = useState(false);
  
  // Load from Database modal states
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [loadModalLoading, setLoadModalLoading] = useState(false);
  const [savedTabs, setSavedTabs] = useState([]);
  const [selectedTabsToLoad, setSelectedTabsToLoad] = useState([]);
  const [selectedTabsToDelete, setSelectedTabsToDelete] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Day modal states
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  
  // Marketing modal states
  const [marketingModalOpen, setMarketingModalOpen] = useState(false);
  const [selectedMarketingChannel, setSelectedMarketingChannel] = useState(null);
  
  // Country marketing states for virtual/hybrid events
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [countryMarketingData, setCountryMarketingData] = useState([]);
  const [activeCountryTab, setActiveCountryTab] = useState(0);
  const [countryMarketingModalOpen, setCountryMarketingModalOpen] = useState(false);
  const [selectedCountryForMarketing, setSelectedCountryForMarketing] = useState(null);
  
  // Hybrid event result tabs state
  const [hybridResultTab, setHybridResultTab] = useState(0);

  // TabPanel component for hybrid results
  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hybrid-tabpanel-${index}`}
      aria-labelledby={`hybrid-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );

  // Function to detect and extract hybrid event components
  const getHybridComponents = (data) => {
    console.log('🔍 getHybridComponents called with data:', data);
    console.log('🔍 Event analysis type:', data[0]);
    
    try {
      // Check if data[0] exists and is an object
      if (!data || !data[0] || typeof data[0] !== 'object') {
        console.warn('Invalid data structure for hybrid components');
        return [];
      }
      
      // Convert object keys to components array
      const response = Object.entries(data[0]).map(([key, value]) => ({
        type: key,
        data: value,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' ')
      }));
      
      console.log('📊 Components created from object:', response);
      return response;
      
    } catch (error) {
      console.error('Error processing hybrid components:', error);
      return [];
    }
  };

  // Auth context for user information
  const user = useAuthContext()?.user?.data;

  // Form methods for current tab
  const methods = useForm({
    // resolver: zodResolver(TabFormSchema),
    defaultValues: {
      event_name: '',
      event_type: 'in-person',
      event_language: 'en',
      event_description: '',
      city: '',
      target_countries: [],
      country_marketing: [],
      number_of_days: 1,
      days: [
        {
          event_date: '',
          start_time: '',
          end_time: '',
          venue_name: '',
          venue_capacity: '',
          virtual_platform: {
            platform_name: '',
            platform_link: '',
            max_participants: '',
            features: [],
            access_requirements: '',
          },
          primary_sector: '',
          speakers: '',
          activities: '',
          additional_info: '',
        }
      ],
      marketing_strategy: {
        facebook: {
          audience: '',
          placement: '',
          reach: '',
          reaction: '',
          budget: '',
          timeline: '',
          content_type: '',
          additional_info: '',
          influencer_partnerships: [],
        },
        instagram: {
          audience: '',
          placement: '',
          reach: '',
          reaction: '',
          budget: '',
          timeline: '',
          content_type: '',
          additional_info: '',
          influencer_partnerships: [],
        },
        linkedin: {
          audience: '',
          placement: '',
          reach: '',
          reaction: '',
          budget: '',
          timeline: '',
          content_type: '',
          additional_info: '',
          influencer_partnerships: [],
        },
        x_twitter: {
          audience: '',
          placement: '',
          reach: '',
          reaction: '',
          budget: '',
          timeline: '',
          content_type: '',
          additional_info: '',
          influencer_partnerships: [],
        },
        youtube: {
          audience: '',
          placement: '',
          reach: '',
          reaction: '',
          budget: '',
          timeline: '',
          content_type: '',
          additional_info: '',
          influencer_partnerships: [],
        },
        google_ads: {
          audience: '',
          placement: '',
          reach: '',
          reaction: '',
          budget: '',
          timeline: '',
          content_type: '',
          additional_info: '',
        },
        email_campaign: {
          audience: '',
          placement: '',
          reach: '',
          reaction: '',
          budget: '',
          timeline: '',
          content_type: '',
          additional_info: '',
        },
        whatsapp_campaign: {
          audience: '',
          placement: '',
          reach: '',
          reaction: '',
          budget: '',
          timeline: '',
          content_type: '',
          additional_info: '',
        },
        offline_publicity: {
          audience: '',
          placement: '',
          reach: '',
          reaction: '',
          budget: '',
          timeline: '',
          content_type: '',
          additional_info: '',
        },
        reddit: {
          audience: '',
          placement: '',
          reach: '',
          reaction: '',
          budget: '',
          timeline: '',
          content_type: '',
          additional_info: '',
          influencer_partnerships: [],
        },
        meetup: {
          audience: '',
          placement: '',
          reach: '',
          reaction: '',
          budget: '',
          timeline: '',
          content_type: '',
          additional_info: '',
        },
        eventbrite: {
          audience: '',
          placement: '',
          reach: '',
          reaction: '',
          budget: '',
          timeline: '',
          content_type: '',
          additional_info: '',
        },
        indeed_events: {
          audience: '',
          placement: '',
          reach: '',
          reaction: '',
          budget: '',
          timeline: '',
          content_type: '',
          additional_info: '',
        },
      },
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = methods;

  // Base chart options
  const baseChartOptions = useChart({
    chart: { height: 250 },
    legend: { show: true, position: 'bottom' },
    tooltip: { enabled: true },
  });

  // Chart rendering function
  const renderChart = (vizData) => {
    if (!vizData || !vizData.type) {
      return (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 10 }}>
          No chart data available
        </Typography>
      );
    }

    try {
      switch (vizData.type) {
      case 'donut':
      case 'pie': {
        // Ensure data is an array
        const dataArray = Array.isArray(vizData.data) ? vizData.data : [];
        const series = dataArray.map(item => parseInt(item.value) || 0);
        const labels = dataArray.map(item => item.label || 'Unknown');
        const colors = dataArray.map(item => item.color) || [];
        
        return (
          <Chart
            type="donut"
            series={series}
            options={{
              ...baseChartOptions,
              labels,
              colors,
              plotOptions: {
                pie: {
                  donut: {
                    size: vizData.chart_config?.innerRadius || '50%',
                    labels: {
                      show: vizData.chart_config?.showLabels !== false,
                    }
                  }
                }
              },
              legend: {
                show: vizData.chart_config?.showLegends !== false,
                position: 'bottom'
              }
            }}
          />
        );
      }

      case 'area':
      case 'line': {
        const seriesData = vizData.data?.series || [];
        const series = Array.isArray(seriesData) ? seriesData.map(s => ({
          name: s.name || 'Series',
          data: Array.isArray(s.data) ? s.data.map(val => parseInt(val) || 0) : []
        })) : [];
        const categories = vizData.data?.categories || [];
        
        return (
          <Chart
            type={vizData.type}
            series={series}
            options={{
              ...baseChartOptions,
              xaxis: { categories },
              fill: {
                type: vizData.type === 'area' ? 'gradient' : 'solid',
              }
            }}
          />
        );
      }

      case 'bar':
      case 'stacked-bar': {
        if (vizData.data?.series) {
          // Series format (stacked bar)
          const seriesData = Array.isArray(vizData.data.series) ? vizData.data.series : [];
          const series = seriesData.map(s => ({
            name: s.name || 'Series',
            data: Array.isArray(s.data) ? s.data.map(val => parseInt(val) || 0) : []
          }));
          const categories = vizData.data.categories || [];
          
          return (
            <Chart
              type="bar"
              series={series}
              options={{
                ...baseChartOptions,
                xaxis: { categories },
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded'
                  }
                },
                dataLabels: { enabled: false },
                stroke: { show: true, width: 2, colors: ['transparent'] }
              }}
            />
          );
        } else {
          // Simple data format
          const dataArray = Array.isArray(vizData.data) ? vizData.data : [];
          const series = [{
            name: vizData.title || 'Data',
            data: dataArray.map(item => parseInt(item.value) || 0)
          }];
          const categories = dataArray.map(item => item.label || 'Unknown');
          const colors = dataArray.map(item => item.color) || [];
          
          return (
            <Chart
              type="bar"
              series={series}
              options={{
                ...baseChartOptions,
                xaxis: { categories },
                colors,
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded'
                  }
                }
              }}
            />
          );
        }
      }

      case 'funnel': {
        // Funnel chart using bar chart with custom styling
        const dataArray = Array.isArray(vizData.data) ? vizData.data : [];
        const series = [{
          name: 'Funnel',
          data: dataArray.map(item => parseInt(item.value) || 0)
        }];
        const categories = dataArray.map(item => item.stage || item.label || 'Unknown');
        const colors = dataArray.map(item => item.color) || [];
        
        return (
          <Chart
            type="bar"
            series={series}
            options={{
              ...baseChartOptions,
              xaxis: { categories },
              colors,
              plotOptions: {
                bar: {
                  horizontal: true,
                  barHeight: '70%',
                  endingShape: 'rounded'
                }
              }
            }}
          />
        );
      }

      case 'world-map': {
        // For world map, we'll show a simple bar chart of top countries
        const locations = vizData.data?.locations || [];
        const topCountries = Array.isArray(locations) ? locations.slice(0, 10) : [];
        const series = [{
          name: 'Registrations',
          data: topCountries.map(item => parseInt(item.value) || 0)
        }];
        const categories = topCountries.map(item => item.country || 'Unknown');
        const colors = topCountries.map(item => item.color) || [];
        
        return (
          <Chart
            type="bar"
            series={series}
            options={{
              ...baseChartOptions,
              xaxis: { 
                categories,
                labels: { rotate: -45 }
              },
              colors,
              title: { text: 'Top Countries by Registration' }
            }}
          />
        );
      }

      case 'map': {
        // For map charts, we'll show a bar chart of locations
        const locations = vizData.data?.locations || vizData.data || [];
        const locationsArray = Array.isArray(locations) ? locations : [];
        const series = [{
          name: 'Value',
          data: locationsArray.map(item => parseInt(item.value) || 0)
        }];
        const categories = locationsArray.map(item => item.country || item.region || item.label || 'Unknown');
        const colors = locationsArray.map(item => item.color) || [];
        
        return (
          <Chart
            type="bar"
            series={series}
            options={{
              ...baseChartOptions,
              xaxis: { 
                categories,
                labels: { rotate: -45 }
              },
              colors,
              title: { text: vizData.title || 'Geographic Distribution' }
            }}
          />
        );
      }

      case 'horizontal-bar': {
        if (vizData.data?.series) {
          // Series format
          const seriesData = Array.isArray(vizData.data.series) ? vizData.data.series : [];
          const series = seriesData.map(s => ({
            name: s.name || 'Series',
            data: Array.isArray(s.data) ? s.data.map(val => parseInt(val) || 0) : []
          }));
          const categories = vizData.data.categories || [];
          
          return (
            <Chart
              type="bar"
              series={series}
              options={{
                ...baseChartOptions,
                xaxis: { categories },
                plotOptions: {
                  bar: {
                    horizontal: true,
                    barHeight: '70%',
                    endingShape: 'rounded'
                  }
                }
              }}
            />
          );
        } else {
          // Simple data format
          const dataArray = Array.isArray(vizData.data) ? vizData.data : [];
          const series = [{
            name: vizData.title || 'Data',
            data: dataArray.map(item => parseInt(item.value) || 0)
          }];
          const categories = dataArray.map(item => item.label || item.category || 'Unknown');
          const colors = dataArray.map(item => item.color) || [];
          
          return (
            <Chart
              type="bar"
              series={series}
              options={{
                ...baseChartOptions,
                xaxis: { categories },
                colors,
                plotOptions: {
                  bar: {
                    horizontal: true,
                    barHeight: '70%',
                    endingShape: 'rounded'
                  }
                }
              }}
            />
          );
        }
      }

      case 'radar': {
        const dataArray = Array.isArray(vizData.data) ? vizData.data : [];
        const series = [{
          name: vizData.title || 'Performance',
          data: dataArray.map(item => parseInt(item.value) || 0)
        }];
        const categories = dataArray.map(item => item.label || item.metric || 'Unknown');
        
        return (
          <Chart
            type="radar"
            series={series}
            options={{
              ...baseChartOptions,
              xaxis: { categories },
              yaxis: {
                show: true,
                tickAmount: 4
              }
            }}
          />
        );
      }

      case 'gauge': {
        // For gauge charts, we'll use a radial bar chart
        const value = parseInt(vizData.data?.value || vizData.value || 0);
        const maxValue = parseInt(vizData.data?.max || vizData.max || 100);
        const percentage = Math.round((value / maxValue) * 100);
        
        return (
          <Chart
            type="radialBar"
            series={[percentage]}
            options={{
              ...baseChartOptions,
              plotOptions: {
                radialBar: {
                  hollow: {
                    size: '70%',
                  },
                  dataLabels: {
                    name: {
                      fontSize: '22px',
                    },
                    value: {
                      fontSize: '16px',
                      formatter: () => `${value}${vizData.unit || ''}`,
                    },
                    total: {
                      show: true,
                      label: vizData.title || 'Total',
                      formatter: () => `${value}${vizData.unit || ''}`
                    }
                  }
                }
              },
              labels: [vizData.title || 'Gauge'],
            }}
          />
        );
      }

      default:
        return (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 10 }}>
            Unsupported chart type: {vizData.type}
          </Typography>
        );
    }
    } catch (error) {
      console.error('Error rendering chart:', error, vizData);
      return (
        <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', mt: 10 }}>
          Error rendering chart: {error.message || 'Invalid data format'}
        </Typography>
      );
    }
  };

  // Watch number of days to dynamically update days array
  const numberOfDays = watch('number_of_days');
  const daysData = watch('days');

  // Handle number of days change
  const handleNumberOfDaysChange = (newNumberOfDays) => {
    // Validation
    if (!newNumberOfDays || newNumberOfDays < 1) {
      toast.error('Number of days must be at least 1');
      return;
    }
    
    if (newNumberOfDays > 30) {
      toast.error('Number of days cannot exceed 30');
      return;
    }
    
    const currentDays = getValues('days') || [];
    const newDays = [];

    // Keep existing days or create new ones
    for (let i = 0; i < newNumberOfDays; i++) {
      if (i < currentDays.length) {
        newDays.push(currentDays[i]);
      } else {
        newDays.push({
          event_date: '',
          start_time: '',
          end_time: '',
          venue_name: '',
          venue_capacity: '',
          primary_sector: '',
          speakers: '',
          activities: '',
          additional_info: '',
        });
      }
    }

    setValue('days', newDays);
    setValue('number_of_days', newNumberOfDays);
    
    // Success message for day changes
    if (newNumberOfDays > currentDays.length) {
      toast.success(`Added ${newNumberOfDays - currentDays.length} new day${newNumberOfDays - currentDays.length > 1 ? 's' : ''} to configure`);
    } else if (newNumberOfDays < currentDays.length) {
      toast.info(`Reduced to ${newNumberOfDays} day${newNumberOfDays > 1 ? 's' : ''} - excess day configurations removed`);
    }
  };

  // Day modal handlers
  const handleOpenDayModal = (dayIndex) => {
    // Check basic event information first
    const currentData = getValues();
    const basicErrors = [];
    
    if (!currentData.event_name?.trim()) basicErrors.push('Event name');
    if (!currentData.event_description?.trim()) basicErrors.push('Event description');
    if (!currentData.city?.trim()) basicErrors.push('City');
    
    if (basicErrors.length > 0) {
      toast.warning(`Consider filling basic event information first: ${basicErrors.join(', ')}`);
    }
    
    setSelectedDayIndex(dayIndex);
    setDayModalOpen(true);
    
    // Check for day-specific errors
    const dayErrors = getDayErrors(dayIndex);
    const dayStatus = getDayStatus(dayIndex);
    
    if (dayStatus === 'error' && dayErrors.length > 0) {
      setTimeout(() => {
        toast.error(`Day ${dayIndex + 1} has validation errors that need to be fixed:`);
        dayErrors.forEach((error, index) => {
          setTimeout(() => {
            toast.error(`• ${error}`, {
              autoHideDuration: 5000,
            });
          }, (index + 1) * 300);
        });
      }, 500);
    } else if (!daysData?.[dayIndex] || dayStatus === 'empty') {
      // Show helpful tip for first-time day configuration
      setTimeout(() => {
        toast.info(`Configure Day ${dayIndex + 1} by filling the required fields (marked with *)`);
      }, 500);
    }
  };

  const handleCloseDayModal = () => {
    setDayModalOpen(false);
    setSelectedDayIndex(null);
  };

  const handleSaveDayModal = () => {
    if (selectedDayIndex === null) return;
    
    const currentDays = getValues('days') || [];
    const currentDay = currentDays[selectedDayIndex];
    
    // Validate day data
    const errors = [];
    if (!currentDay?.event_date?.trim()) errors.push('Event date');
    if (!currentDay?.start_time?.trim()) errors.push('Start time');
    if (!currentDay?.end_time?.trim()) errors.push('End time');
    if (!currentDay?.venue_name?.trim()) errors.push('Venue name');
    if (!currentDay?.venue_capacity?.trim()) errors.push('Venue capacity');
    if (!currentDay?.primary_sector?.trim()) errors.push('Primary sector');
    
    // Time validation
    if (currentDay?.start_time && currentDay?.end_time) {
      const start = new Date(`2000-01-01T${currentDay.start_time}`);
      const end = new Date(`2000-01-01T${currentDay.end_time}`);
      if (start >= end) {
        errors.push('End time must be after start time');
      }
    }
    
    // Capacity validation
    if (currentDay?.venue_capacity && (isNaN(currentDay.venue_capacity) || parseInt(currentDay.venue_capacity) <= 0)) {
      errors.push('Venue capacity must be a positive number');
    }
    
    if (errors.length > 0) {
      const missingFields = errors.filter(error => !error.includes('must be'));
      const validationErrors = errors.filter(error => error.includes('must be'));
      
      if (missingFields.length > 0) {
        toast.error(`Day ${selectedDayIndex + 1}: Missing required fields - ${missingFields.join(', ')}`);
      }
      
      validationErrors.forEach(error => {
        toast.error(`Day ${selectedDayIndex + 1}: ${error}`);
      });
      
      return;
    }
    
    // Success message
    const optionalFields = ['speakers', 'activities', 'additional_info'];
    const filledOptional = optionalFields.filter(field => currentDay[field]?.trim()).length;
    
    if (filledOptional > 0) {
      toast.success(`Day ${selectedDayIndex + 1} configuration completed successfully!`);
    } else {
      toast.info(`Day ${selectedDayIndex + 1} basic configuration saved. Consider adding speakers, activities, or additional information.`);
    }
    
    setDayModalOpen(false);
    setSelectedDayIndex(null);
  };

  const getDayStatus = (dayIndex) => {
    const day = daysData?.[dayIndex];
    if (!day) return 'empty';
    
    const eventType = watch('event_type');
    
    // Define required fields based on event type
    let requiredFields = ['event_date', 'start_time', 'end_time', 'primary_sector'];
    
    if (eventType === 'in-person') {
      requiredFields.push('venue_name', 'venue_capacity');
    } else if (eventType === 'virtual') {
      requiredFields.push('virtual_platform.platform_name', 'virtual_platform.max_participants');
    } else if (eventType === 'hybrid') {
      requiredFields.push('venue_name', 'venue_capacity', 'virtual_platform.platform_name', 'virtual_platform.max_participants');
    }
    
    // Check filled required fields (handle nested fields)
    const filledRequired = requiredFields.filter(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return day[parent]?.[child]?.toString().trim();
      }
      return day[field]?.toString().trim();
    }).length;
    
    const optionalFields = ['speakers', 'activities', 'additional_info'];
    const filledOptional = optionalFields.filter(field => day[field]?.trim()).length;
    
    // Check for validation errors first
    const hasErrors = [];
    
    // Time validation
    if (day.start_time && day.end_time) {
      const start = new Date(`2000-01-01T${day.start_time}`);
      const end = new Date(`2000-01-01T${day.end_time}`);
      if (start >= end) {
        hasErrors.push('Invalid time range');
      }
    }
    
    // Capacity validation for venues
    if (eventType === 'in-person' || eventType === 'hybrid') {
      if (day.venue_capacity && (isNaN(day.venue_capacity) || parseInt(day.venue_capacity) <= 0)) {
        hasErrors.push('Invalid venue capacity');
      }
    }
    
    // Capacity validation for virtual platforms
    if (eventType === 'virtual' || eventType === 'hybrid') {
      if (day.virtual_platform?.max_participants && (isNaN(day.virtual_platform.max_participants) || parseInt(day.virtual_platform.max_participants) <= 0)) {
        hasErrors.push('Invalid virtual capacity');
      }
    }
    
    // Date validation (check if date is in the past)
    if (day.event_date) {
      const eventDate = new Date(day.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        hasErrors.push('Past date selected');
      }
    }
    
    // Return error status if there are validation errors
    if (hasErrors.length > 0) return 'error';
    
    // Check for missing required fields when some fields are filled
    if (filledRequired > 0 && filledRequired < requiredFields.length) {
      return 'missing'; // New status for days with missing required data
    }
    
    // Determine completion status
    if (filledRequired === requiredFields.length && filledOptional > 0) return 'complete';
    if (filledRequired === requiredFields.length) return 'basic';
    if (filledRequired > 0) return 'partial';
    return 'empty';
  };

  const getDayErrors = (dayIndex) => {
    const day = daysData?.[dayIndex];
    if (!day) return [];
    
    const errors = [];
    
    // Time validation
    if (day.start_time && day.end_time) {
      const start = new Date(`2000-01-01T${day.start_time}`);
      const end = new Date(`2000-01-01T${day.end_time}`);
      if (start >= end) {
        errors.push('End time must be after start time');
      }
    }
    
    // Capacity validation
    if (day.venue_capacity && (isNaN(day.venue_capacity) || parseInt(day.venue_capacity) <= 0)) {
      errors.push('Venue capacity must be a positive number');
    }
    
    // Date validation
    if (day.event_date) {
      const eventDate = new Date(day.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        errors.push('Event date cannot be in the past');
      }
    }
    
    return errors;
  };

  // Marketing modal handlers
  const handleOpenMarketingModal = (channel) => {
    // Check basic event information first
    const currentData = getValues();
    const basicErrors = [];
    
    if (!currentData.event_name?.trim()) basicErrors.push('Event name');
    if (!currentData.event_description?.trim()) basicErrors.push('Event description');
    
    if (basicErrors.length > 0) {
      toast.warning(`Consider filling basic event information first: ${basicErrors.join(', ')}`);
    }
    
    setSelectedMarketingChannel(channel);
    setMarketingModalOpen(true);
    
    // Show helpful tip for first-time marketing configuration
    setTimeout(() => {
      const channelName = getChannelDisplayName(channel);
      toast.info(`Configure ${channelName} marketing strategy with target audience and placement details`);
    }, 500);
  };

  const handleCloseMarketingModal = () => {
    setMarketingModalOpen(false);
    setSelectedMarketingChannel(null);
  };

  const handleSaveMarketingModal = () => {
    if (!selectedMarketingChannel) return;
    
    const marketingData = getValues('marketing_strategy')?.[selectedMarketingChannel];
    const channelName = getChannelDisplayName(selectedMarketingChannel);
    
    // Check if any field is filled
    const fields = ['audience', 'placement', 'reach', 'reaction', 'budget', 'timeline', 'content_type'];
    const filledFields = fields.filter(field => marketingData?.[field]?.trim()).length;
    
    // Check for influencer partnerships in social media channels
    const socialMediaChannels = ['facebook', 'instagram', 'linkedin', 'x_twitter', 'youtube', 'reddit'];
    let influencerCount = 0;
    if (socialMediaChannels.includes(selectedMarketingChannel) && marketingData?.influencer_partnerships?.length > 0) {
      influencerCount = marketingData.influencer_partnerships.filter(inf => 
        inf.name?.trim() && inf.followers_count?.trim()
      ).length;
    }
    
    if (filledFields === 0 && influencerCount === 0) {
      toast.info(`${channelName} configuration is empty. Consider adding target audience and placement strategy.`);
    } else if (filledFields < 4 && influencerCount === 0) {
      toast.success(`${channelName} basic configuration saved. Consider filling more details for better targeting.`);
    } else if (influencerCount > 0) {
      toast.success(`${channelName} marketing strategy configured with ${influencerCount} influencer partnership${influencerCount > 1 ? 's' : ''}!`);
    } else {
      toast.success(`${channelName} marketing strategy configured successfully!`);
    }
    
    setMarketingModalOpen(false);
    setSelectedMarketingChannel(null);
  };

  const getChannelDisplayName = (channel) => {
    const channelNames = {
      facebook: 'Facebook',
      instagram: 'Instagram', 
      linkedin: 'LinkedIn',
      x_twitter: 'X (Twitter)',
      youtube: 'YouTube',
      google_ads: 'Google Ads',
      email_campaign: 'Email Campaign',
      whatsapp_campaign: 'WhatsApp Campaign',
      offline_publicity: 'Offline Publicity',
      reddit: 'Reddit',
      meetup: 'Meetup',
      eventbrite: 'Eventbrite',
      indeed_events: 'Indeed Events'
    };
    return channelNames[channel] || channel;
  };

  const getMarketingChannelStatus = (channel) => {
    const marketingData = getValues('marketing_strategy')?.[channel];
    if (!marketingData) return 'empty';
    
    const requiredFields = ['audience', 'placement', 'reach', 'reaction'];
    const optionalFields = ['budget', 'timeline', 'content_type', 'additional_info'];
    const filledRequired = requiredFields.filter(field => marketingData[field]?.trim()).length;
    const filledOptional = optionalFields.filter(field => marketingData[field]?.trim()).length;
    
    // Check influencer partnerships for social media channels
    const socialMediaChannels = ['facebook', 'instagram', 'linkedin', 'x_twitter', 'youtube', 'reddit'];
    let influencerBonus = 0;
    if (socialMediaChannels.includes(channel) && marketingData.influencer_partnerships?.length > 0) {
      const validInfluencers = marketingData.influencer_partnerships.filter(inf => 
        inf.name?.trim() && inf.followers_count?.trim()
      ).length;
      if (validInfluencers > 0) {
        influencerBonus = 1; // Boost status if has valid influencers
      }
    }
    
    // Determine completion status with influencer bonus
    const totalOptional = filledOptional + influencerBonus;
    if (filledRequired === requiredFields.length && totalOptional > 1) return 'complete';
    if (filledRequired === requiredFields.length && totalOptional > 0) return 'basic';
    if (filledRequired > 0) return 'partial';
    return 'empty';
  };

  // Country marketing channel status
  const getCountryMarketingChannelStatus = (channel, countryCode) => {
    const countryMarketingArray = getValues('country_marketing') || [];
    const countryData = countryMarketingArray.find(cm => cm.country_code === countryCode);
    const marketingData = countryData?.marketing_strategy?.[channel];
    
    if (!marketingData) return 'empty';
    
    const requiredFields = ['audience', 'placement', 'reach', 'reaction'];
    const optionalFields = ['budget', 'timeline', 'content_type', 'additional_info'];
    const filledRequired = requiredFields.filter(field => marketingData[field]?.trim()).length;
    const filledOptional = optionalFields.filter(field => marketingData[field]?.trim()).length;
    
    // Check influencer partnerships for social media channels
    const socialMediaChannels = ['facebook', 'instagram', 'linkedin', 'x_twitter', 'youtube', 'reddit'];
    let influencerBonus = 0;
    if (socialMediaChannels.includes(channel) && marketingData.influencer_partnerships?.length > 0) {
      const validInfluencers = marketingData.influencer_partnerships.filter(inf => 
        inf.name?.trim() && inf.followers_count?.trim()
      ).length;
      if (validInfluencers > 0) {
        influencerBonus = 1; // Boost status if has valid influencers
      }
    }
    
    // Determine completion status with influencer bonus
    const totalOptional = filledOptional + influencerBonus;
    if (filledRequired === requiredFields.length && totalOptional > 1) return 'complete';
    if (filledRequired === requiredFields.length && totalOptional > 0) return 'basic';
    if (filledRequired > 0) return 'partial';
    return 'empty';
  };

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Load data for the selected tab if it has saved input data
    const selectedTab = tabs[newValue];
    if (selectedTab?.inputData) {
      const tabData = selectedTab.inputData;
      
      // Reset form with saved data
      reset({
        event_name: tabData.event_name || '',
        event_description: tabData.event_description || '',
        city: tabData.city || '',
        number_of_days: tabData.number_of_days || 1,
        days: tabData.days || [
          {
            event_date: '',
            start_time: '',
            end_time: '',
            venue_name: '',
            venue_capacity: '',
            primary_sector: '',
            speakers: '',
            activities: '',
            additional_info: '',
          }
        ],
        marketing_strategy: tabData.marketing_strategy || {
          facebook: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          instagram: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          linkedin: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          x_twitter: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          youtube: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          google_ads: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          email_campaign: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          whatsapp_campaign: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          offline_publicity: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          reddit: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          meetup: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '' },
          eventbrite: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '' },
          indeed_events: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '' },
        },
      });
    } else {
      // Reset form with empty data for new tabs
      reset();
    }
  };

  const handleAddTab = () => {
    const newTab = {
      id: tabCounter,
      name: `Tab ${tabCounter}`,
      saved: false,
      result: null,
      loading: false,
      locationData: null,
    };
    setTabs([...tabs, newTab]);
    setActiveTab(tabs.length);
    setTabCounter(tabCounter + 1);
    reset();
  };

  const handleDeleteTab = (tabIndex, event) => {
    if (event) {
      event.stopPropagation();
    }
    if (tabs.length === 1) {
      toast.error('Cannot delete the last tab');
      return;
    }
    setTabToDelete(tabIndex);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTab = () => {
    const newTabs = tabs.filter((_, index) => index !== tabToDelete);
    setTabs(newTabs);
    
    // Adjust active tab if necessary
    if (activeTab >= newTabs.length) {
      setActiveTab(Math.max(0, newTabs.length - 1));
    } else if (activeTab === tabToDelete) {
      setActiveTab(0);
    } else if (activeTab > tabToDelete) {
      setActiveTab(activeTab - 1);
    }
    
    setDeleteDialogOpen(false);
    setTabToDelete(null);
    reset();
  };

  const handleSaveTab = () => {
    // Check if user is authenticated
    if (!user || !user._id) {
      toast.error('Please log in to save tabs');
      return;
    }

    // Basic validation before saving
    const currentData = getValues();
    const errors = [];
    
    if (!currentData.event_name?.trim()) {
      errors.push('Event name is required to save the tab');
    }
    
    if (errors.length > 0) {
      errors.forEach(error => {
        toast.error(error);
      });
      return;
    }
    
    setSaveTabName(tabs[activeTab].name);
    setSaveDialogOpen(true);
  };

  const confirmSaveTab = async () => {
    if (!saveTabName.trim()) {
      toast.error('Tab name cannot be empty');
      return;
    }

    // Check if user is authenticated
    if (!user || !user._id) {
      toast.error('Please log in to save tabs');
      return;
    }

    setIsSavingTab(true); // Start loading state

    try {
      // Get current form data
      const currentData = getValues();
      const currentTab = tabs[activeTab];
      
      // Prepare the data to save to API
      const tabDataToSave = {
        title: saveTabName,
        content: {
          userId: user._id, // Include user ID for association
          user_id: user._id, // Include both formats for compatibility
          input_data: {
            event_name: currentData.event_name,
            event_type: currentData.event_type,
            event_language: currentData.event_language,
            event_description: currentData.event_description,
            city: currentData.city,
            target_countries: currentData.target_countries,
            country_marketing: currentData.country_marketing,
            number_of_days: currentData.number_of_days,
            days: currentData.days,
            marketing_strategy: currentData.marketing_strategy,
            location_data: currentTab.locationData
          },
          output_data: currentTab.result,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        type: "event"
      };

      // Show loading state
      toast.info('Saving tab to database...');

      // Determine if this is an update or create operation
      const isUpdate = currentTab.apiId;
      const apiUrl = isUpdate 
        ? endpoints.tabs.update(currentTab.apiId)
        : endpoints.tabs.create;
      
      const method = isUpdate ? 'put' : 'post';

      // Save to API
      const response = await axios[method](apiUrl, tabDataToSave, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`Tab ${isUpdate ? 'updated' : 'saved'} to API:`, response.data);

      // Update local state with saved status and API response
      const updatedTabs = tabs.map((tab, index) =>
        index === activeTab
          ? { 
              ...tab, 
              name: saveTabName, 
              saved: true,
              apiId: response.data.id || response.data._id, // Store the API ID for future updates
              inputData: tabDataToSave.content.input_data // Store input data locally for tab switching
            }
          : tab
      );
      setTabs(updatedTabs);
      setSaveDialogOpen(false);
      setSaveTabName('');
      setIsSavingTab(false); // Reset loading state
      toast.success(`Tab "${saveTabName}" ${isUpdate ? 'updated' : 'saved'} successfully to database!`);

    } catch (error) {
      console.error('Error saving tab to API:', error);
      
      let errorMessage = 'Failed to save tab to database';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network connection failed. Tab saved locally only.';
      } else if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          errorMessage = 'Invalid data format. Please check your inputs.';
        } else if (status === 401) {
          errorMessage = 'Authentication failed. Please check your credentials.';
        } else if (status === 403) {
          errorMessage = 'Access denied. You do not have permission to save.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `Server error (${status}): ${error.response.data?.message || error.response.statusText}`;
        }
      }
      
      // Still save locally even if API fails
      const updatedTabs = tabs.map((tab, index) =>
        index === activeTab
          ? { 
              ...tab, 
              name: saveTabName, 
              saved: true,
              inputData: tabDataToSave.content.input_data // Store input data locally even when API fails
            }
          : tab
      );
      setTabs(updatedTabs);
      setSaveDialogOpen(false);
      setSaveTabName('');
      setIsSavingTab(false); // Reset loading state
      
      toast.error(errorMessage);
      toast.warning('Tab saved locally only. Please try saving again when connection is restored.');
    }
  };

  const handleLocationSelect = (locationData) => {
    // Update current tab with location data
    const updatedTabs = tabs.map((tab, index) =>
      index === activeTab ? { ...tab, locationData } : tab
    );
    setTabs(updatedTabs);
    
    // Auto-fill form fields
    const { setValue } = methods;
    setValue('city', locationData.city);
    
    // Auto-fill first venue for the first day if available
    const currentDays = getValues('days') || [];
    if (currentDays.length > 0 && locationData.suggestedVenues && locationData.suggestedVenues.length > 0) {
      const updatedDays = [...currentDays];
      updatedDays[0] = { ...updatedDays[0], venue_name: locationData.suggestedVenues[0] };
      setValue('days', updatedDays);
    }
    
    toast.success(`Location selected: ${locationData.city}`);
  };

  // Handle countries selection for virtual/hybrid events
  const handleCountriesChange = (selectedCountryCodes) => {
    // Create country marketing data for selected countries
    const newCountryMarketing = selectedCountryCodes.map(countryCode => {
      const country = COUNTRIES_LIST.find(c => c.code === countryCode);
      
      // Check if we already have data for this country
      const existingData = countryMarketingData.find(cm => cm.country_code === countryCode);
      
      return existingData || {
        country_code: countryCode,
        country_name: country?.name || '',
        marketing_strategy: {
          facebook: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          instagram: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          linkedin: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          x_twitter: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          youtube: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          google_ads: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          email_campaign: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          whatsapp_campaign: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          offline_publicity: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          reddit: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '', influencer_partnerships: [] },
          meetup: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '' },
          eventbrite: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '' },
          indeed_events: { audience: '', placement: '', reach: '', reaction: '', budget: '', timeline: '', content_type: '', additional_info: '' },
        }
      };
    });
    
    setCountryMarketingData(newCountryMarketing);
    setSelectedCountries(selectedCountryCodes);
    
    // Update form value
    setValue('country_marketing', newCountryMarketing);
    
    if (selectedCountryCodes.length > 0) {
      toast.success(`Selected ${selectedCountryCodes.length} countries for virtual event marketing`);
    }
  };

  // Load from Database handlers
  const handleLoadFromDatabase = async () => {
    if (!user || !user._id) {
      toast.error('Please log in to load saved tabs');
      return;
    }

    setLoadModalOpen(true);
    await fetchSavedTabs();
  };

  const fetchSavedTabs = async () => {
    setLoadModalLoading(true);
    try {
      const response = await axios.get(endpoints.tabs.search, {
        userId: user._id,
        page: page + 1, // API expects 1-based page numbers
        length: rowsPerPage,
        filter: 'type:eq:event'
      });

      const { data, total } = response.data;
      setSavedTabs(data || []);
      setTotalCount(total || 0);
    } catch (error) {
      console.error('Error fetching saved tabs:', error);
      toast.error('Failed to load saved tabs');
      setSavedTabs([]);
      setTotalCount(0);
    } finally {
      setLoadModalLoading(false);
    }
  };

  const handleSelectTab = (tabId) => {
    setSelectedTabsToLoad(prev => {
      if (prev.includes(tabId)) {
        return prev.filter(id => id !== tabId);
      } else {
        return [...prev, tabId];
      }
    });
  };

  const handleSelectAllTabs = (event) => {
    if (event.target.checked) {
      setSelectedTabsToLoad(savedTabs.items.map(tab => tab._id || tab.id));
    } else {
      setSelectedTabsToLoad([]);
    }
  };

  const handleLoadSelectedTabs = async () => {
    if (selectedTabsToLoad.length === 0) {
      toast.warning('Please select at least one tab to load');
      return;
    }

    try {
      setLoadModalLoading(true);
      
      // Filter selected tabs from savedTabs
      const tabsToLoad = savedTabs.items.filter(tab => 
        selectedTabsToLoad.includes(tab._id || tab.id)
      );

      // Add loaded tabs to existing tabs
      const newTabs = tabsToLoad.map((savedTab, index) => {
        const content = savedTab.content || {};
        const inputData = content.input_data || {};
        
        return {
          id: tabCounter + index,
          name: savedTab.title || `Loaded Tab ${tabCounter + index}`,
          saved: true,
          apiId: savedTab._id || savedTab.id,
          result: content.output_data || null,
          loading: false,
          locationData: inputData.location_data || null,
          inputData: inputData
        };
      });

      // Add new tabs to existing tabs
      setTabs(prev => [...prev, ...newTabs]);
      setTabCounter(prev => prev + newTabs.length);

      // Switch to the first loaded tab
      if (newTabs.length > 0) {
        const newActiveTab = tabs.length; // Index of first new tab
        setActiveTab(newActiveTab);
        
        // Populate form with the first loaded tab's data
        const firstLoadedTab = newTabs[0];
        if (firstLoadedTab.inputData) {
          const { setValue } = methods;
          Object.keys(firstLoadedTab.inputData).forEach(key => {
            if (key !== 'location_data') {
              setValue(key, firstLoadedTab.inputData[key]);
            }
          });
        }
      }

      setLoadModalOpen(false);
      setSelectedTabsToLoad([]);
      toast.success(`Successfully loaded ${newTabs.length} tab${newTabs.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error loading tabs:', error);
      toast.error('Failed to load selected tabs');
    } finally {
      setLoadModalLoading(false);
    }
  };

  // Test Data Loading Function with Enhanced Virtual Data

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Effect to refetch tabs when page or rowsPerPage changes
  React.useEffect(() => {
    if (loadModalOpen && user?._id) {
      fetchSavedTabs();
    }
  }, [page, rowsPerPage, loadModalOpen, user?._id]);

  // Delete handlers for load modal
  const handleSelectTabToDelete = (tabId) => {
    setSelectedTabsToDelete(prev => {
      if (prev.includes(tabId)) {
        return prev.filter(id => id !== tabId);
      } else {
        return [...prev, tabId];
      }
    });
  };

  const handleSelectAllTabsToDelete = (event) => {
    if (event.target.checked) {
      setSelectedTabsToDelete(savedTabs.items?.map(tab => tab._id || tab.id) || []);
    } else {
      setSelectedTabsToDelete([]);
    }
  };

  const handleDeleteSelectedTabs = async () => {
    if (selectedTabsToDelete.length === 0) {
      toast.warning('Please select at least one tab to delete');
      return;
    }

    try {
      setLoadModalLoading(true);
      
      // Delete each selected tab
      const deletePromises = selectedTabsToDelete.map(tabId => 
        axios.delete(endpoints.tabs.delete(tabId))
      );
      
      await Promise.all(deletePromises);
      
      // Refresh the tabs list
      await fetchSavedTabs();
      
      // Clear selections
      setSelectedTabsToDelete([]);
      setSelectedTabsToLoad([]);
      
      toast.success(`Successfully deleted ${selectedTabsToDelete.length} tab${selectedTabsToDelete.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error deleting tabs:', error);
      toast.error('Failed to delete selected tabs');
    } finally {
      setLoadModalLoading(false);
    }
  };

  const handleDeleteSingleTab = async (tabId) => {
    try {
      setLoadModalLoading(true);
      
      await axios.delete(endpoints.tabs.delete(tabId));
      
      // Refresh the tabs list
      await fetchSavedTabs();
      
      // Remove from selections if it was selected
      setSelectedTabsToDelete(prev => prev.filter(id => id !== tabId));
      setSelectedTabsToLoad(prev => prev.filter(id => id !== tabId));
      
      toast.success('Tab deleted successfully');
    } catch (error) {
      console.error('Error deleting tab:', error);
      toast.error('Failed to delete tab');
    } finally {
      setLoadModalLoading(false);
    }
  };

const onSubmit = async (formData) => {
  try {
    console.log('🚀 Form submission initiated with data:', formData);
    
    // First, try Zod validation and log any errors
    // try {
    //   console.log('🔍 Running Zod validation...');
    //   const validatedData = TabFormSchema.parse(formData);
    //   console.log('✅ Zod validation passed:', validatedData);
    // } catch (zodError) {
    //   console.error('❌ ZOD VALIDATION FAILED:');
    //   console.error('Full Zod Error Object:', zodError);
      
    //   if (zodError.errors) {
    //     console.error('📋 Detailed Zod Errors:');
    //     zodError.errors.forEach((error, index) => {
    //       console.error(`Error ${index + 1}:`, {
    //         path: error.path,
    //         message: error.message,
    //         code: error.code,
    //         expected: error.expected,
    //         received: error.received,
    //         validation: error.validation
    //       });
    //     });
        
    //     // Also show user-friendly error messages
    //     console.error('📝 User-friendly error messages:');
    //     zodError.errors.forEach((error, index) => {
    //       const fieldPath = error.path.join('.');
    //       console.error(`${index + 1}. Field "${fieldPath}": ${error.message}`);
    //     });
    //   }
      
    //   // Show Zod validation errors to user
    //   toast.error('Form validation failed - check console for details');
    //   zodError.errors?.forEach((error, index) => {
    //     setTimeout(() => {
    //       const fieldPath = error.path.join('.');
    //       toast.error(`${fieldPath}: ${error.message}`, {
    //         autoHideDuration: 5000 + (index * 500)
    //       });
    //     }, index * 300);
    //   });
      
    //   return; // Stop submission if Zod validation fails
    // }
    console.log('ℹ️ Skipping Zod validation for now, proceeding to manual validation');
    // Manual validation with detailed error messages
    const errors = [];
    
    // Basic field validation
    // if (!formData.event_name?.trim()) {
    //   errors.push('Event name is required');
    // }
    // if (!formData.event_description?.trim()) {
    //   errors.push('Event description is required');
    // }
    // if (!formData.city?.trim()) {
    //   errors.push('City selection is required');
    // }
    // if (!formData.number_of_days || formData.number_of_days < 1) {
    //   errors.push('Number of days must be at least 1');
    // }
    
    // Days validation
    if (!formData.days || formData.days.length === 0) {
      errors.push('At least one day configuration is required');
    } else {
      // Track empty and incomplete days separately
      const emptyDays = [];
      const incompleteDays = [];
      
      formData.days.forEach((day, index) => {
        const requiredFields = ['event_date', 'start_time', 'end_time', 'venue_name', 'venue_capacity', 'primary_sector'];
        const filledFields = requiredFields.filter(field => day[field]?.trim());
        
        // Check if day is completely empty (no required fields filled)
        if (filledFields.length === 0) {
          emptyDays.push(index + 1);
        } else if (filledFields.length < requiredFields.length) {
          // Day has some data but is incomplete
          const missingFields = requiredFields.filter(field => !day[field]?.trim());
          incompleteDays.push({
            dayNumber: index + 1,
            missing: missingFields.map(field => field.replace('_', ' '))
          });
        }
        
        // Time validation for days that have time fields filled
        if (day.start_time && day.end_time) {
          const start = new Date(`2000-01-01T${day.start_time}`);
          const end = new Date(`2000-01-01T${day.end_time}`);
          if (start >= end) {
            errors.push(`Day ${index + 1}: End time must be after start time`);
          }
        }
        
        // Capacity validation for days that have capacity filled
        // if (day.venue_capacity && (isNaN(day.venue_capacity) || parseInt(day.venue_capacity) <= 0)) {
        //   errors.push(`Day ${index + 1}: Venue capacity must be a positive number`);
        // }
      });
      
      // Add specific error messages for empty days
      if (emptyDays.length > 0) {
        if (emptyDays.length === 1) {
          errors.push(`Day ${emptyDays[0]} is completely empty - click to configure it`);
        } else if (emptyDays.length === formData.days.length) {
          errors.push('All days are empty - please configure at least one day');
        } else {
          errors.push(`Days ${emptyDays.join(', ')} are completely empty - click to configure them`);
        }
      }
      
      // Add specific error messages for incomplete days
      // incompleteDays.forEach(({ dayNumber, missing }) => {
      //   errors.push(`Day ${dayNumber} missing: ${missing.join(', ')}`);
      // });
    }
    
    // Location data validation
    // if (!tabs[activeTab].locationData) {
    //   errors.push('Please select a location on the map');
    // }
    
    // If there are validation errors, show them and return
    if (errors.length > 0) {
      console.error('❌ FORM VALIDATION FAILED:');
      console.error('Validation Errors:', errors);
      errors.forEach((error, index) => {
        setTimeout(() => {
          // Different styling for different types of errors
          if (error.includes('completely empty') || error.includes('All days are empty')) {
            // Special styling for empty day errors
            toast.error(error, {
              variant: 'filled',
              autoHideDuration: 6000, // Longer duration for empty day alerts
              sx: { 
                bgcolor: 'warning.main', 
                color: 'warning.contrastText',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }
            });
          } else if (error.includes('missing:')) {
            // Different styling for incomplete day errors  
            toast.warning(error, {
              variant: 'filled',
              autoHideDuration: 5000,
            });
          } else {
            // Standard error styling for other validation errors
            toast.error(error, {
              variant: 'filled',
              autoHideDuration: 4000 + (index * 500), // Stagger the alerts
            });
          }
        }, index * 200);
      });
      
      // Show summary error
      setTimeout(() => {
        toast.error(`Please fix ${errors.length} validation error${errors.length > 1 ? 's' : ''} before submitting`, {
          variant: 'outlined',
          autoHideDuration: 6000,
        });
      }, errors.length * 200 + 500);
      
      return;
    }
    
    // Show loading message
    toast.info('Generating comprehensive event data...', {
      autoHideDuration: 2000,
    });
    
    // Add a timeout warning message after 15 seconds
    const timeoutWarning = setTimeout(() => {
      if (tabs[activeTab]?.loading) {
        toast.info('Processing is taking longer than usual, please wait...', {
          autoHideDuration: 5000,
        });
      }
    }, 15000);
    
    // Update tab loading state
    const updatedTabs = tabs.map((tab, index) =>
      index === activeTab ? { ...tab, loading: true } : tab
    );
    setTabs(updatedTabs);
    
    // Reset hybrid result tab when starting new analysis
    setHybridResultTab(0);

    // Prepare the payload for POST request
    const payload = {
      event_name: formData.event_name,
      event_type: formData.event_type,
      event_language: formData.event_language,
      event_description: formData.event_description,
      city: formData.city,
      target_countries: formData.target_countries,
      country_marketing: formData.country_marketing,
      number_of_days: formData.number_of_days,
      // Include location data if available
      ...(tabs[activeTab].locationData && {
        state: tabs[activeTab].locationData.state,
        population: tabs[activeTab].locationData.population,
        coordinates: tabs[activeTab].locationData.coordinates,
      }),
      // Include days data
      days: formData.days,
      // Include marketing strategy if available
      ...(formData.marketing_strategy && {
        marketing_strategy: formData.marketing_strategy,
      })
    };

    console.log('Sending POST payload:', payload);

    // Function to make API request with retry logic
    const makeSimulationRequest = async (isRetry = false) => {
      if (isRetry) {
        toast.info('Processing timeout detected, retrying request...', {
          autoHideDuration: 3000,
        });
      }
      
      const apiResponse = await axios.post(endpoints.simulation.event, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false,
      });
      
      console.log(`API Response${isRetry ? ' (Retry)' : ''}:`, apiResponse.data);
      
      // Extract data from the response
      const responseData = apiResponse.data[0]?.output || apiResponse.data;
      
      // Check if the response indicates agent stopped due to max iterations
      const isMaxIterationsError = 
        (typeof responseData === 'string' && responseData.includes('Agent stopped due to max iterations')) ||
        (responseData?.error && responseData.error.includes('Agent stopped due to max iterations')) ||
        (responseData?.message && responseData.message.includes('Agent stopped due to max iterations'));
      
      if (isMaxIterationsError && !isRetry) {
        console.log('Max iterations detected, retrying request...');
        return await makeSimulationRequest(true); // Retry once
      }
      
      return {
        data: responseData,
        isRetry
      };
    };

    // Make the API request with retry logic
    const { data: responseData, isRetry } = await makeSimulationRequest();
    
    // Update tab with result from API
    const finalTabs = tabs.map((tab, index) =>
      index === activeTab
        ? { 
            ...tab, 
            result: {
              status: 'success',
              data: responseData,
              message: `Event simulation generated successfully for ${payload.event_name}!${isRetry ? ' (Retried due to timeout)' : ''}`,
            }, 
            loading: false 
          }
        : tab
    );
    setTabs(finalTabs);

    // Clear the timeout warning
    clearTimeout(timeoutWarning);
    
    toast.success(`Event data generated successfully${isRetry ? ' after retry' : ''}!`);
  } catch (error) {
    console.error('Error calling webhook:', error);
    
    // Detailed error handling with specific error messages
    let errorMessage = 'Failed to generate event data';
    let errorType = 'error';
    
    if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      errorType = 'warning';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. The server took too long to respond. Please try again.';
      errorType = 'warning';
    } else if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      if (status === 400) {
        errorMessage = 'Invalid request data. Please check your form inputs and try again.';
      } else if (status === 401) {
        errorMessage = 'Authentication failed. Please check your credentials.';
      } else if (status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (status === 404) {
        errorMessage = 'API endpoint not found. Please contact support.';
      } else if (status >= 500) {
        errorMessage = 'Server error occurred. Please try again later or contact support.';
        errorType = 'warning';
      } else {
        errorMessage = `Server error (${status}): ${error.response.data?.message || error.response.statusText}`;
      }
      console.log('Server response:', error.response.data);
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection and try again later.';
      errorType = 'warning';
    } else if (error.name === 'ValidationError') {
      errorMessage = 'Form validation failed. Please check all required fields.';
    } else {
      errorMessage = error.message || 'An unexpected error occurred';
    }
    
    // Update tab loading state on error
    const updatedTabs = tabs.map((tab, index) =>
      index === activeTab
        ? {
            ...tab,
            result: {
              status: 'error',
              message: errorMessage,
            },
            loading: false,
          }
        : tab
    );
    setTabs(updatedTabs);
    
    // Clear the timeout warning
    clearTimeout(timeoutWarning);
    
    // Show error notification
    if (errorType === 'warning') {
      toast.warning(errorMessage, { autoHideDuration: 8000 });
    } else {
      toast.error(errorMessage, { autoHideDuration: 6000 });
    }
    
    // Additional help message for network errors
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      setTimeout(() => {
        toast.info('Tip: Make sure you have a stable internet connection and the API endpoint is accessible.', {
          autoHideDuration: 5000,
        });
      }, 1000);
    }
  }
  };

  const getPlacementPlaceholder = (channel) => {
    const placeholders = {
      facebook: "e.g., Facebook ads targeting tech professionals, Event page promotion, Tech group shares, Sponsored posts in AI/ML communities",
      instagram: "e.g., Instagram Stories ads, Influencer partnerships, Tech hashtag campaigns, Visual event teasers, Reels showcasing speakers",
      linkedin: "e.g., LinkedIn sponsored content, Professional network posts, Industry leader endorsements, LinkedIn Events promotion",
      x_twitter: "e.g., Twitter promoted tweets, Tech hashtag campaigns, Live tweeting, Speaker quote cards, Thread series about event topics",
      youtube: "e.g., Pre-roll ads on tech channels, Speaker interview teasers, Event highlight videos, Tech tutorial tie-ins",
      google_ads: "e.g., Google search ads for AI keywords, Display ads on tech websites, YouTube pre-roll ads, Retargeting campaigns",
      email_campaign: "e.g., Newsletter announcements, Targeted email lists, Drip campaigns, Speaker introductions via email, Registration reminders",
      whatsapp_campaign: "e.g., WhatsApp groups, Personal invites, Community channels, Status updates, Direct messaging to contacts",
      offline_publicity: "e.g., Tech conference flyers, University bulletin boards, Co-working space posters, Industry magazine ads, Radio sponsorships",
      reddit: "e.g., Reddit ads in relevant subreddits, AMA sessions, Sponsored posts, Community engagement through comments",
      meetup: "e.g., Local meetup groups, Event sponsorships, Community partnerships, Cross-promotion with other events",
      eventbrite: "e.g., Event listing on Eventbrite, Paid promotions, Featured events, Community outreach",
      indeed_events: "e.g., Job fairs, Industry meetups, Sponsored listings, Community engagement"
    };
    return placeholders[channel] || "Describe your placement and distribution strategy...";
  };

  const getContentPlaceholder = (channel) => {
    const placeholders = {
      facebook: "e.g., Event announcement posts, Speaker spotlight videos, Countdown posts, Live Q&A sessions, Behind-the-scenes content",
      instagram: "e.g., Visual speaker cards, Event venue photos, Stories with polls/questions, IGTV speaker interviews, Carousel posts with agenda",
      linkedin: "e.g., Professional articles, Industry insights, Speaker thought leadership posts, Event networking opportunities, Company updates",
      x_twitter: "e.g., Tweet threads, Speaker quotes, Real-time updates, Hashtag campaigns, Live-tweeting schedule",
      youtube: "e.g., Speaker introduction videos, Event preview trailers, Past event highlights, Educational content related to event topics",
      google_ads: "e.g., Google search ads for AI keywords, Display ads on tech websites, YouTube pre-roll ads, Retargeting campaigns",
      email_campaign: "e.g., HTML newsletters with event details, Personalized invitations, Speaker interviews, Early bird promotions, Event countdown series",
      whatsapp_campaign: "e.g., Event announcements, Speaker introduction videos, Interactive polls, Voice messages from speakers, Event reminders",
      offline_publicity: "e.g., Professional flyers with QR codes, Branded banners, Magazine advertisements, Radio spot scripts, Direct mail campaigns",
      reddit: "e.g., Informative posts, AMA sessions, Engaging comments, Visual content, Polls and discussions",
      meetup: "e.g., Event descriptions, Speaker bios, Community posts, Visual teasers, Follow-up content",
      eventbrite: "e.g., Compelling event descriptions, Speaker highlights, Visual banners, Early bird announcements, Reminder emails",
      indeed_events: "e.g., Event summaries, Speaker introductions, Industry relevance posts, Visual ads, Follow-up content"
    };
    return placeholders[channel] || "Describe your content strategy...";
  };

  // Influencer Partnerships Component
  const InfluencerPartnershipsSection = ({ channelName, methods }) => {
    const { control, watch, setValue } = methods;
    const influencers = watch(`marketing_strategy.${channelName}.influencer_partnerships`) || [];

    const addInfluencer = () => {
      const newInfluencer = {
        name: '',
        followers_count: '',
        expected_reach: '',
        expected_reaction: ''
      };
      setValue(`marketing_strategy.${channelName}.influencer_partnerships`, [...influencers, newInfluencer]);
    };

    const removeInfluencer = (index) => {
      const updatedInfluencers = influencers.filter((_, i) => i !== index);
      setValue(`marketing_strategy.${channelName}.influencer_partnerships`, updatedInfluencers);
    };

    return (
      <Box>
        {influencers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, bgcolor: 'grey.50', borderRadius: 1, border: '1px dashed grey.300' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No influencer partnerships added yet
            </Typography>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={addInfluencer}
              size="small"
            >
              Add First Influencer
            </Button>
          </Box>
        ) : (
          <Box>
            {influencers.map((influencer, index) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{ p: 3, mb: 2, bgcolor: 'background.neutral' }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Influencer #{index + 1}
                  </Typography>
                  <IconButton
                    onClick={() => removeInfluencer(index)}
                    color="error"
                    size="small"
                  >
                    <Iconify icon="mingcute:delete-2-line" />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name={`marketing_strategy.${channelName}.influencer_partnerships.${index}.name`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Influencer Name/Handle"
                          placeholder="e.g., @TechGuru, Sarah Johnson"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name={`marketing_strategy.${channelName}.influencer_partnerships.${index}.followers_count`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Followers Count"
                          placeholder="e.g., 250,000, 1.2M"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name={`marketing_strategy.${channelName}.influencer_partnerships.${index}.expected_reach`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Expected Reach/Impressions"
                          placeholder="e.g., 75,000 impressions, 50K views"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name={`marketing_strategy.${channelName}.influencer_partnerships.${index}.expected_reaction`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Expected Reaction/Response"
                          placeholder="e.g., 3,000 engagements, 150 registrations"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={addInfluencer}
              sx={{ mt: 1 }}
            >
              Add Another Influencer
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  // Function to render analysis content for both single and multiple analyses
  const renderAnalysisContent = (data) => {
    return (
      <>
        {/* Tool Utilization Summary */}
        {data.tool_utilization_summary && (
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.neutral' }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                🔧 Analysis Overview
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(data.tool_utilization_summary).map(([key, value], index) => (
                  <Grid size={{ xs: 12, md: 6 }} key={index}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary', fontWeight: 'bold' }}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        {value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Main Statistics Cards */}
        <Grid size={12}>
          <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'secondary.main' }}>
              📈 Key Metrics
            </Typography>
            <Grid container spacing={3}>
              {data.registration_expected && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      bgcolor: 'info.lighter',
                      borderColor: 'info.main'
                    }}
                  >
                    <Typography variant="h4" sx={{ color: 'info.darker', fontWeight: 'bold' }}>
                      {typeof data.registration_expected === 'number' 
                        ? data.registration_expected.toLocaleString() 
                        : data.registration_expected}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'info.darker', mt: 1 }}>
                      Expected Registrations
                    </Typography>
                  </Paper>
                </Grid>
              )}
              {data.attendance_expected && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      bgcolor: 'success.lighter',
                      borderColor: 'success.main'
                    }}
                  >
                    <Typography variant="h4" sx={{ color: 'success.darker', fontWeight: 'bold' }}>
                      {typeof data.attendance_expected === 'number' 
                        ? data.attendance_expected.toLocaleString() 
                        : data.attendance_expected}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'success.darker', mt: 1 }}>
                      Expected Attendance
                    </Typography>
                  </Paper>
                </Grid>
              )}
              {data.confidence_level && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      bgcolor: 'warning.lighter',
                      borderColor: 'warning.main'
                    }}
                  >
                    <Typography variant="h4" sx={{ color: 'warning.darker', fontWeight: 'bold' }}>
                      {data.confidence_level}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'warning.darker', mt: 1 }}>
                      Confidence Level
                    </Typography>
                  </Paper>
                </Grid>
              )}
              {(data.registration_expected && data.attendance_expected) && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      bgcolor: 'error.lighter',
                      borderColor: 'error.main'
                    }}
                  >
                    <Typography variant="h4" sx={{ color: 'error.darker', fontWeight: 'bold' }}>
                      {Math.round((data.attendance_expected / data.registration_expected) * 100)}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'error.darker', mt: 1 }}>
                      Conversion Rate
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Event-specific Analysis Sections */}
        {/* Venue Analysis (in-person) */}
        {data.venue_analysis && (
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                🏢 Venue Analysis
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(data.venue_analysis).map(([key, value], index) => (
                  <Grid size={{ xs: 12, md: 6 }} key={index}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary', fontWeight: 'bold' }}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        {value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Global Reach Analysis (virtual) */}
        {data.global_reach_analysis && (
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'info.main' }}>
                🌍 Global Reach Analysis
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(data.global_reach_analysis).map(([key, value], index) => (
                  <Grid size={{ xs: 12, md: 6 }} key={index}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary', fontWeight: 'bold' }}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        {value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Hybrid Optimization Analysis (hybrid) */}
        {data.hybrid_optimization_analysis && (
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'secondary.main' }}>
                🔄 Hybrid Optimization Analysis
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(data.hybrid_optimization_analysis).map(([key, value], index) => (
                  <Grid size={{ xs: 12, md: 6 }} key={index}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary', fontWeight: 'bold' }}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        {value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Key Insights */}
        {data.key_insights && (
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'secondary.main' }}>
                💡 Key Insights
              </Typography>
              <Grid container spacing={2}>
                {data.key_insights.map((insight, index) => (
                  <Grid size={{ xs: 12, md: 6 }} key={index}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'info.lighter',
                        borderColor: 'info.light',
                        borderLeft: '4px solid',
                        borderLeftColor: 'info.main'
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'info.darker' }}>
                        <strong>Insight {index + 1}:</strong> {insight}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Data Visualizations */}
        {data.data_visualizations && (
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                📈 Data Visualizations & Analytics
              </Typography>
              <Grid container spacing={3}>
                {/* Registration Trend */}
                {data.data_visualizations.registration_trend && (
                  <Grid size={{ xs: 12, lg: 6 }}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        bgcolor: 'info.lighter',
                        borderColor: 'info.main'
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2, color: 'info.darker', textAlign: 'center' }}>
                        📈 {data.data_visualizations.registration_trend.title}
                      </Typography>
                      <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, minHeight: 250 }}>
                        {renderChart(data.data_visualizations.registration_trend)}
                      </Box>
                    </Paper>
                  </Grid>
                )}

                {/* Other visualizations would be rendered similarly */}
                {Object.entries(data.data_visualizations)
                  .filter(([key]) => key !== 'registration_trend')
                  .map(([key, viz], index) => (
                    <Grid size={{ xs: 12, lg: 6 }} key={index}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 3, 
                          bgcolor: 'grey.50',
                          borderColor: 'grey.300'
                        }}
                      >
                        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', textAlign: 'center' }}>
                          📊 {viz.title || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                        <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, minHeight: 250 }}>
                          {renderChart(viz)}
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Marketing Effectiveness */}
        {(data.local_marketing_effectiveness || data.international_marketing_effectiveness || data.integrated_marketing_effectiveness) && (
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'info.main' }}>
                📊 Marketing Effectiveness Analysis
              </Typography>
              
              <Grid container spacing={3}>
                {/* Local Marketing Effectiveness */}
                {data.local_marketing_effectiveness && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        bgcolor: 'primary.lighter',
                        borderColor: 'primary.main'
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.darker' }}>
                        🏠 Local Marketing Effectiveness
                      </Typography>
                      {Object.entries(data.local_marketing_effectiveness).map(([key, value], index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.darker', fontWeight: 'bold' }}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'primary.dark' }}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                )}

                {/* International Marketing Effectiveness */}
                {data.international_marketing_effectiveness && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        bgcolor: 'info.lighter',
                        borderColor: 'info.main'
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2, color: 'info.darker' }}>
                        🌍 International Marketing Effectiveness
                      </Typography>
                      {Object.entries(data.international_marketing_effectiveness).map(([key, value], index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: 'info.darker', fontWeight: 'bold' }}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'info.dark' }}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                )}

                {/* Integrated Marketing Effectiveness (Hybrid) */}
                {data.integrated_marketing_effectiveness && (
                  <Grid size={{ xs: 12 }}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        bgcolor: 'secondary.lighter',
                        borderColor: 'secondary.main'
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2, color: 'secondary.darker' }}>
                        🔄 Integrated Marketing Effectiveness
                      </Typography>
                      {Object.entries(data.integrated_marketing_effectiveness).map(([key, value], index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: 'secondary.darker', fontWeight: 'bold' }}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'secondary.dark' }}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Recommendations */}
        {data.recommendations && (
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'warning.main' }}>
                🎯 Strategic Recommendations
              </Typography>
              
              <Grid container spacing={3}>
                {/* Optimization Strategies */}
                {data.recommendations.optimization_strategies && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        bgcolor: 'success.lighter',
                        borderColor: 'success.main'
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2, color: 'success.darker' }}>
                        ✅ Optimization Strategies
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {data.recommendations.optimization_strategies.map((strategy, index) => (
                          <Typography component="li" variant="body2" key={index} sx={{ mb: 1, color: 'success.darker' }}>
                            {strategy}
                          </Typography>
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                )}

                {/* Risk Mitigation */}
                {data.recommendations.risk_mitigation && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        bgcolor: 'error.lighter',
                        borderColor: 'error.main'
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2, color: 'error.darker' }}>
                        ⚠️ Risk Mitigation
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {data.recommendations.risk_mitigation.map((risk, index) => (
                          <Typography component="li" variant="body2" key={index} sx={{ mb: 1, color: 'error.darker' }}>
                            {risk}
                          </Typography>
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Actionable Metrics */}
        {data.actionable_metrics && (
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                📊 Actionable Metrics
              </Typography>
              <Grid container spacing={3}>
                {/* Conversion Rates */}
                {data.actionable_metrics.conversion_rates && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        bgcolor: 'secondary.lighter',
                        borderColor: 'secondary.main'
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2, color: 'secondary.darker', textAlign: 'center' }}>
                        🔄 Conversion Rates
                      </Typography>
                      {Object.entries(data.actionable_metrics.conversion_rates).map(([key, value], index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: 'secondary.darker', textTransform: 'capitalize' }}>
                            {key.replace(/_/g, ' ')}:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.darker' }}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                )}

                {/* Revenue Projections */}
                {data.actionable_metrics.revenue_projections && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        bgcolor: 'success.lighter',
                        borderColor: 'success.main'
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2, color: 'success.darker', textAlign: 'center' }}>
                        💰 Revenue Projections
                      </Typography>
                      {Object.entries(data.actionable_metrics.revenue_projections).map(([key, value], index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: 'success.darker', textTransform: 'capitalize' }}>
                            {key.replace(/_/g, ' ')}:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.darker' }}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                )}

                {/* Additional metrics like engagement_metrics, capacity_utilization etc. */}
                {Object.entries(data.actionable_metrics)
                  .filter(([key]) => !['conversion_rates', 'revenue_projections'].includes(key))
                  .map(([key, value], index) => (
                    <Grid size={{ xs: 12, md: 4 }} key={index}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 3, 
                          bgcolor: 'info.lighter',
                          borderColor: 'info.main'
                        }}
                      >
                        <Typography variant="h6" sx={{ mb: 2, color: 'info.darker', textAlign: 'center' }}>
                          📈 {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                        {typeof value === 'object' ? (
                          Object.entries(value).map(([subKey, subValue], subIndex) => (
                            <Box key={subIndex} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" sx={{ color: 'info.darker', textTransform: 'capitalize' }}>
                                {subKey.replace(/_/g, ' ')}:
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'info.darker' }}>
                                {subValue}
                              </Typography>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ color: 'info.darker', textAlign: 'center' }}>
                            {value}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Success Metrics */}
        {data.success_metrics && (
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'success.main' }}>
                🎯 Success Metrics
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(data.success_metrics).map(([key, value], index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'success.lighter',
                        borderColor: 'success.light'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'success.darker', textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.darker' }}>
                        {typeof value === 'object' ? (
                          <Box>
                            {Object.entries(value).map(([subKey, subValue], subIndex) => (
                              <Box key={subIndex} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ color: 'success.darker', textTransform: 'capitalize' }}>
                                  {subKey.replace(/_/g, ' ')}:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.darker' }}>
                                  {subValue}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          value
                        )}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Add the other new sections (Timeline Analysis, ROI Analysis, Cost Breakdown) if they exist in the data */}
        {data.timeline_analysis && (
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'info.main' }}>
                ⏰ Timeline Analysis
              </Typography>
              {/* Timeline analysis content */}
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Timeline analysis content would be displayed here
              </Typography>
            </Paper>
          </Grid>
        )}

        {data.roi_analysis && (
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'warning.main' }}>
                💰 ROI Analysis
              </Typography>
              {/* ROI analysis content */}
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                ROI analysis content would be displayed here
              </Typography>
            </Paper>
          </Grid>
        )}

        {data.cost_breakdown && (
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'error.main' }}>
                💳 Cost Breakdown
              </Typography>
              {/* Cost breakdown content */}
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Cost breakdown content would be displayed here
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Data Summary */}
        <Grid size={12}>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              <strong>Analysis Generated:</strong> {new Date().toLocaleString()} | 
              <strong> Confidence Score:</strong> {data.confidence_level || 'N/A'} |
              <strong> Data Points Analyzed:</strong> {data.data_visualizations ? Object.keys(data.data_visualizations).length : 0}
            </Typography>
          </Paper>
        </Grid>
      </>
    );
  };

  const currentTab = tabs[activeTab];
  
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Dynamic Tabs Simulator"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Event' },
          { name: 'Simulate' },
        ]}
        sx={{ mb: 3 }}
      />

      
      
      {!user?._id && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Please log in to save and load your tabs from the database
          </Typography>
        </Alert>
      )}

      <Card sx={{ p: 3 }}>
        {/* Tabs Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ flexGrow: 1 }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>
                      {tab.name}
                      {tab.saved && ' (saved)'}
                    </span>
                    {tabs.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteTab(index, e)}
                        sx={{ ml: 0.5, p: 0.25 }}
                      >
                        <Iconify icon="mingcute:close-line" width={16} />
                      </IconButton>
                    )}
                  </Box>
                }
                value={index}
                wrapped
                sx={{ minWidth: 120, maxWidth: 250 }}
              />
            ))}
          </Tabs>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleAddTab}
            >
              Add Tab
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Form Section - Top */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Event Configuration - {currentTab.name}
          </Typography>
          
          <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3} gap={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field.Text 
                  name="event_name" 
                  label="Event Name" 
                  placeholder="e.g., AI & Machine Learning Summit 2025"
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="event_type"
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Event Type</InputLabel>
                      <Select
                        {...field}
                        label="Event Type"
                      >
                        <MenuItem value="in-person">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Iconify icon="mdi:map-marker" />
                            In-Person Event
                          </Box>
                        </MenuItem>
                        <MenuItem value="virtual">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Iconify icon="mdi:monitor" />
                            Virtual Event
                          </Box>
                        </MenuItem>
                        <MenuItem value="hybrid">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Iconify icon="mdi:map-marker-plus" />
                            Hybrid Event
                          </Box>
                        </MenuItem>
                      </Select>
                      {error && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                          {error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="event_language"
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Event Language</InputLabel>
                      <Select
                        {...field}
                        label="Event Language"
                      >
                        {LANGUAGES_LIST.map((language) => (
                          <MenuItem key={language.code} value={language.code}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">
                                <img src={language.flag} alt={language.code} style={{ width: 16, height: 12, marginRight: 8 }} />
                                {language.name}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {error && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                          {error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Number of Days"
                  type="number"
                  value={numberOfDays || 1}
                  onChange={(e) => handleNumberOfDaysChange(parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1, max: 30 }}
                  fullWidth
                />
              </Grid>
              
              <Grid size={12}>
                <Field.Text
                  name="event_description"
                  label="Event Description"
                  multiline
                  rows={4}
                  placeholder="Describe the event, target audience, and key features..."
                />
              </Grid>

              {/* Location fields - only for in-person and hybrid events */}
              {(watch('event_type') === 'in-person' || watch('event_type') === 'hybrid') && (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <EventLocationPicker
                      onLocationSelect={handleLocationSelect}
                      initialLocation={currentTab.locationData}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Field.Text 
                      name="city" 
                      label="City" 
                      placeholder="e.g., San Francisco"
                    />
                  </Grid>
                </>
              )}

              {/* Country selection - only for virtual and hybrid events */}
              {(watch('event_type') === 'virtual' || watch('event_type') === 'hybrid') && (
                <Grid size={12}>
                  <Controller
                    name="target_countries"
                    control={methods.control}
                    render={({ field, fieldState: { error } }) => (
                      <Autocomplete
                        {...field}
                        multiple
                        options={COUNTRIES_LIST.map(country => country.code)}
                        getOptionLabel={(option) => {
                          const country = COUNTRIES_LIST.find(c => c.code === option);
                          return country ? country.name : option;
                        }}
                        renderOption={(props, option) => {
                          const country = COUNTRIES_LIST.find(c => c.code === option);
                          return (
                            <Box component="li" {...props}>
                              <Typography variant="body2">
                                <img src={country?.flag} alt={country?.code} style={{ width: 16, height: 12, marginRight: 8 }} /> {country?.name}
                              </Typography>
                            </Box>
                          );
                        }}
                        renderTags={(selected, getTagProps) =>
                          selected.map((option, index) => {
                            const country = COUNTRIES_LIST.find(c => c.code === option);
                            return (
                              <Chip
                                {...getTagProps({ index })}
                                key={option}
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <img src={country?.flag} alt={country?.code} style={{ width: 16, height: 12 }} />
                                    {country?.name}
                                  </Box>
                                }
                                size="small"
                              />
                            );
                          })
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Target Countries"
                            placeholder="Select countries for your virtual event"
                            error={!!error}
                            helperText={error?.message || "Choose countries where you want to promote your virtual event"}
                          />
                        )}
                        onChange={(_, value) => {
                          field.onChange(value);
                          // Update country marketing data when countries change
                          handleCountriesChange(value);
                        }}
                      />
                    )}
                  />
                </Grid>
              )}
            
              
              {/* Dynamic Day Fields */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                  Daily Event Schedule ({numberOfDays} {numberOfDays === 1 ? 'Day' : 'Days'})
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click on each day button to configure the details, speakers, and activities for that day.
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 12 }}>
                <Grid container spacing={2}>
                  {daysData && daysData.map((day, index) => {
                    const status = getDayStatus(index);
                    const statusColors = {
                      'empty': { bgcolor: 'grey.100', color: 'grey.600', border: '1px dashed grey.300' },
                      'missing': { 
                        bgcolor: 'error.lighter', 
                        color: 'error.darker', 
                        border: '2px solid error.main',
                        boxShadow: '0 0 8px rgba(244, 67, 54, 0.3)'
                      },
                      'error': { 
                        bgcolor: 'error.main', 
                        color: 'error.contrastText', 
                        border: '3px solid error.dark',
                        boxShadow: '0 0 12px rgba(244, 67, 54, 0.4)'
                      },
                      'partial': { bgcolor: 'warning.lighter', color: 'warning.darker', border: '1px solid orange.300' },
                      'basic': { bgcolor: 'info.lighter', color: 'info.darker', border: '1px solid info.300' },
                      'complete': { bgcolor: 'success.lighter', color: 'success.darker', border: '1px solid success.300' }
                    };
                    
                    const statusIcons = {
                      'empty': 'material-symbols:event-available-outline',
                      'missing': 'material-symbols:warning',
                      'error': 'material-symbols:error-rounded',
                      'partial': 'material-symbols:schedule',
                      'basic': 'material-symbols:check-circle-outline', 
                      'complete': 'material-symbols:task-alt'
                    };
                    
                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                        <Paper 
                          sx={{ 
                            p: 2, 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { 
                              transform: 'translateY(-2px)', 
                              boxShadow: status === 'error' ? '0 8px 16px rgba(244, 67, 54, 0.6)' : 
                                         status === 'missing' ? '0 8px 16px rgba(244, 67, 54, 0.4)' : 3
                            },
                            ...(status === 'error' && {
                              animation: 'errorPulse 2s infinite',
                              '@keyframes errorPulse': {
                                '0%': {
                                  transform: 'scale(1)',
                                  boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)',
                                },
                                '50%': {
                                  transform: 'scale(1.02)',
                                  boxShadow: '0 0 0 8px rgba(244, 67, 54, 0.2)',
                                },
                                '100%': {
                                  transform: 'scale(1)',
                                  boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)',
                                },
                              },
                            }),
                            ...(status === 'missing' && {
                              animation: 'missingBlink 3s infinite',
                              '@keyframes missingBlink': {
                                '0%, 90%': {
                                  opacity: 1,
                                },
                                '95%': {
                                  opacity: 0.7,
                                },
                                '100%': {
                                  opacity: 1,
                                },
                              },
                            }),
                            ...statusColors[status]
                          }}
                          onClick={() => handleOpenDayModal(index)}
                        >
                          <Stack spacing={1} alignItems="center">
                            <Iconify 
                              icon={statusIcons[status]} 
                              width={status === 'error' ? 40 : status === 'missing' ? 36 : 32} 
                              sx={{ 
                                color: statusColors[status].color,
                                ...(status === 'error' && {
                                  animation: 'shake 0.5s ease-in-out infinite',
                                  '@keyframes shake': {
                                    '0%, 100%': { transform: 'translateX(0)' },
                                    '25%': { transform: 'translateX(-2px)' },
                                    '75%': { transform: 'translateX(2px)' },
                                  },
                                }),
                                ...(status === 'missing' && {
                                  animation: 'bounce 2s infinite',
                                  '@keyframes bounce': {
                                    '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                                    '40%': { transform: 'translateY(-4px)' },
                                    '60%': { transform: 'translateY(-2px)' },
                                  },
                                })
                              }}
                            />
                            <Typography variant="h6" sx={{ color: statusColors[status].color }}>
                              Day {index + 1}
                            </Typography>
                            <Typography variant="body2" sx={{ textAlign: 'center', color: statusColors[status].color }}>
                              {day.event_date || 'No date set'}
                            </Typography>
                            <Typography variant="caption" sx={{ textAlign: 'center', color: statusColors[status].color }}>
                              {day.primary_sector || 'No sector'}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              textAlign: 'center', 
                              color: statusColors[status].color,
                              textTransform: 'capitalize',
                              fontWeight: 'medium'
                            }}>
                              {status === 'empty' ? 'Not configured' :
                               status === 'missing' ? 'Missing data' :
                               status === 'error' ? 'Has errors' :
                               status === 'partial' ? 'In progress' :
                               status === 'basic' ? 'Basic setup' : 'Complete'}
                            </Typography>
                          </Stack>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
              
              {/* Marketing Strategy Section - In-Person Events */}
              {watch('event_type') === 'in-person' && (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                      Marketing Strategy
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Click on each marketing channel to configure audience targeting and campaign details.
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 12 }}>
                    <Grid container spacing={2}>
                      {['facebook', 'instagram', 'linkedin', 'x_twitter', 'youtube', 'reddit', 'meetup', 'eventbrite', 'indeed_events', 'google_ads', 'email_campaign', 'whatsapp_campaign', 'offline_publicity'].map((channel) => {
                    const status = getMarketingChannelStatus(channel);
                    const channelName = getChannelDisplayName(channel);
                    
                    const statusColors = {
                      'empty': { bgcolor: 'grey.100', color: 'grey.600', border: '1px dashed grey.300' },
                      'partial': { bgcolor: 'warning.lighter', color: 'warning.darker', border: '1px solid orange.300' },
                      'basic': { bgcolor: 'info.lighter', color: 'info.darker', border: '1px solid info.300' },
                      'complete': { bgcolor: 'success.lighter', color: 'success.darker', border: '1px solid success.300' }
                    };
                    
                    const statusIcons = {
                      'empty': 'material-symbols:campaign-outline',
                      'partial': 'material-symbols:schedule',
                      'basic': 'material-symbols:check-circle-outline', 
                      'complete': 'material-symbols:task-alt'
                    };
                    
                    const channelIcons = {
                      'facebook': 'devicon:facebook',
                      'instagram': 'skill-icons:instagram',
                      'linkedin': 'skill-icons:linkedin',
                      'x_twitter': 'devicon:twitter',
                      'youtube': 'logos:youtube-icon',
                      'google_ads': 'logos:google-ads',
                      'email_campaign': 'logos:google-gmail',
                      'whatsapp_campaign': 'logos:whatsapp-icon',
                      'offline_publicity': 'material-symbols:campaign-outline',
                      'reddit': 'logos:reddit-icon',
                      'meetup': 'cib:meetup',
                      'eventbrite': 'logos:eventbrite-icon',
                      'indeed_events': 'simple-icons:indeed',
                    };
                    
                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={channel}>
                        <Paper 
                          sx={{ 
                            p: 2, 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { 
                              transform: 'translateY(-2px)', 
                              boxShadow: 3
                            },
                            ...statusColors[status]
                          }}
                          onClick={() => handleOpenMarketingModal(channel)}
                        >
                          <Stack spacing={1} alignItems="center">
                            <Iconify 
                              icon={channelIcons[channel]} 
                              width={32} 
                              sx={{ 
                                color: statusColors[status].color,
                              }}
                            />
                            <Typography variant="h6" sx={{ color: statusColors[status].color, fontSize: '0.9rem' }}>
                              {channelName}
                            </Typography>
                            <Iconify 
                              icon={statusIcons[status]} 
                              width={20} 
                              sx={{ 
                                color: statusColors[status].color,
                                opacity: 0.7
                              }}
                            />
                            <Typography variant="caption" sx={{ 
                              textAlign: 'center', 
                              color: statusColors[status].color,
                              textTransform: 'capitalize',
                              fontWeight: 'medium'
                            }}>
                              {status === 'empty' ? 'Not configured' :
                               status === 'partial' ? 'In progress' :
                               status === 'basic' ? 'Basic setup' : 'Complete'}
                            </Typography>
                          </Stack>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
                </>
              )}

              {/* Country Marketing Strategy Section - Virtual/Hybrid Events */}
              {(watch('event_type') === 'virtual' || watch('event_type') === 'hybrid') && selectedCountries.length > 0 && (
                <>
                  <Grid size={12}>
                    <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                      Country-Specific Marketing Strategy
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Complete marketing strategy for each target country. Each country has the full range of marketing channels.
                    </Typography>
                  </Grid>
                  
                  <Grid size={12}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                      <Tabs 
                        value={activeCountryTab} 
                        onChange={(e, newValue) => setActiveCountryTab(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                      >
                        {selectedCountries.map((countryCode, index) => {
                          const country = COUNTRIES_LIST.find(c => c.code === countryCode);
                          return (
                            <Tab 
                              key={countryCode}
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2">
                                    <img src={country?.flag} alt={country?.code} style={{ width: 16, height: 12, marginRight: 8 }} />
                                    {country?.name}
                                  </Typography>
                                  <Chip 
                                    label={LANGUAGES_LIST.find(l => l.code === watch('event_language'))?.name || 'Language not set'} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                </Box>
                              }
                            />
                          );
                        })}
                      </Tabs>
                    </Box>

                    {selectedCountries.map((countryCode, index) => {
                      const country = COUNTRIES_LIST.find(c => c.code === countryCode);
                      return (
                        <Box key={countryCode} hidden={activeCountryTab !== index}>
                          <Grid container spacing={2}>
                            <Grid size={12}>
                              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <img src={country?.flag} alt={country?.code} style={{ width: 16, height: 12 }} />
                                Marketing Strategy for {country?.name} ({LANGUAGES_LIST.find(l => l.code === watch('event_language'))?.name || 'Language not set'})
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Click on each marketing channel to configure audience targeting and campaign details for {country?.name}.
                              </Typography>
                            </Grid>
                            
                            {/* Full marketing channels grid - same as in-person events */}
                            {['facebook', 'instagram', 'linkedin', 'x_twitter', 'youtube', 'reddit', 'meetup', 'eventbrite', 'indeed_events', 'google_ads', 'email_campaign', 'whatsapp_campaign', 'offline_publicity'].map((channel) => {
                              const status = getCountryMarketingChannelStatus(channel, countryCode);
                              const channelName = getChannelDisplayName(channel);
                              
                              const statusColors = {
                                'empty': { bgcolor: 'grey.100', color: 'grey.600', border: '1px dashed grey.300' },
                                'partial': { bgcolor: 'warning.lighter', color: 'warning.darker', border: '1px solid orange.300' },
                                'basic': { bgcolor: 'info.lighter', color: 'info.darker', border: '1px solid info.300' },
                                'complete': { bgcolor: 'success.lighter', color: 'success.darker', border: '1px solid success.300' }
                              };
                              
                              const statusIcons = {
                                'empty': 'material-symbols:campaign-outline',
                                'partial': 'material-symbols:schedule',
                                'basic': 'material-symbols:check-circle-outline', 
                                'complete': 'material-symbols:task-alt'
                              };
                              
                              const channelIcons = {
                                'facebook': 'devicon:facebook',
                                'instagram': 'skill-icons:instagram',
                                'linkedin': 'skill-icons:linkedin',
                                'x_twitter': 'devicon:twitter',
                                'youtube': 'logos:youtube-icon',
                                'google_ads': 'logos:google-ads',
                                'email_campaign': 'logos:google-gmail',
                                'whatsapp_campaign': 'logos:whatsapp-icon',
                                'offline_publicity': 'material-symbols:campaign-outline',
                                'reddit': 'logos:reddit-icon',
                                'meetup': 'cib:meetup',
                                'eventbrite': 'logos:eventbrite-icon',
                                'indeed_events': 'simple-icons:indeed',
                              };
                              
                              return (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={channel}>
                                  <Paper 
                                    sx={{ 
                                      p: 2, 
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      '&:hover': { 
                                        transform: 'translateY(-2px)', 
                                        boxShadow: 3
                                      },
                                      ...statusColors[status]
                                    }}
                                    onClick={() => {
                                      setSelectedCountryForMarketing({ countryCode, channel });
                                      setCountryMarketingModalOpen(true);
                                    }}
                                  >
                                    <Stack spacing={1} alignItems="center">
                                      <Iconify 
                                        icon={channelIcons[channel]} 
                                        width={32} 
                                        sx={{ 
                                          color: statusColors[status].color,
                                        }}
                                      />
                                      <Typography variant="h6" sx={{ color: statusColors[status].color, fontSize: '0.9rem' }}>
                                        {channelName}
                                      </Typography>
                                      <Iconify 
                                        icon={statusIcons[status]} 
                                        width={20} 
                                        sx={{ 
                                          color: statusColors[status].color,
                                          opacity: 0.7
                                        }}
                                      />
                                      <Typography variant="caption" sx={{ 
                                        textAlign: 'center', 
                                        color: statusColors[status].color,
                                        textTransform: 'capitalize',
                                        fontWeight: 'medium'
                                      }}>
                                        {status === 'empty' ? 'Not configured' :
                                         status === 'partial' ? 'In progress' :
                                         status === 'basic' ? 'Basic setup' : 'Complete'}
                                      </Typography>
                                    </Stack>
                                  </Paper>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </Box>
                      );
                    })}
                  </Grid>
                </>
              )}
              
              <Grid size={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  
                  
                  <Button
                    variant="outlined"
                    onClick={handleLoadFromDatabase}
                    startIcon={<Iconify icon="eva:cloud-download-outline" />}
                    color="info"
                    disabled={!user?._id}
                    title={!user?._id ? 'Please log in to load saved tabs' : 'Load your saved tabs from database'}
                  >
                    Load from Database
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={handleSaveTab}
                    startIcon={<Iconify icon="eva:save-outline" />}
                    disabled={!user?._id}
                    title={!user?._id ? 'Please log in to save tabs' : currentTab.saved ? 'Update saved tab in database' : 'Save current tab to database'}
                  >
                    {currentTab.saved ? 'Update Tab' : 'Save Tab'}
                  </Button>
                  
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={isSubmitting || currentTab.loading}
                    startIcon={<Iconify icon="eva:paper-plane-outline" />}
                  >
                    Generate Event Data
                  </LoadingButton>
                </Box>
              </Grid>
            </Grid>
          </Form>
        </Paper>

        {/* Results Section - Bottom */}
        <Paper sx={{ p: 3, minHeight: 400 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Event Simulation Results - {currentTab.name}
          </Typography>
          
          {currentTab.loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                <CircularProgress size={60} thickness={4} />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="eva:calendar-outline" width={24} />
                </Box>
              </Box>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Generating Comprehensive Event Data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
                Our AI is analyzing your event requirements and creating detailed planning data including venue suggestions, 
                marketing strategies, budget estimates, and logistical recommendations.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                This process may take 30-60 seconds...
              </Typography>
            </Box>
          )}
          
          {!currentTab.loading && !currentTab.result && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Fill out the form above and click "Generate Event Data" to see comprehensive event simulation results.
              </Typography>
            </Box>
          )}
          
          {!currentTab.loading && currentTab.result && (
            <Stack spacing={3}>
              <Alert 
                severity={currentTab.result.status === 'success' ? 'success' : 'error'}
              >
                {currentTab.result.message}
              </Alert>
              
              {currentTab.result.status === 'success' && currentTab.result.data && (
                <Box>
                  {(() => {
                    const hybridComponents = getHybridComponents(currentTab.result.data);
                    
                    if (hybridComponents) {
                      // Hybrid event with tabbed interface
                      return (
                        <Box>
                          {/* Tabs for hybrid components */}
                          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                            <Tabs 
                              value={hybridResultTab} 
                              onChange={(event, newValue) => setHybridResultTab(newValue)}
                              aria-label="hybrid event analysis tabs"
                              variant="fullWidth"
                            >
                              {hybridComponents.map((component, index) => (
                                <Tab 
                                  key={index}
                                  label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      {component.type === 'synthesis' && '🔄'}
                                      {component.type === 'in-person' && '🏢'}
                                      {component.type === 'virtual' && '🌐'}
                                      {component.label}
                                    </Box>
                                  }
                                  id={`hybrid-tab-${index}`}
                                  aria-controls={`hybrid-tabpanel-${index}`}
                                />
                              ))}
                            </Tabs>
                          </Box>

                          {/* Tab panels */}
                          {hybridComponents.map((component, index) => (
                            <TabPanel key={index} value={hybridResultTab} index={index}>
                              <Grid container spacing={3}>
                                {/* Component Type Header */}
                                <Grid size={12}>
                                  <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                      p: 3, 
                                      bgcolor: component.type === 'synthesis' 
                                        ? 'warning.lighter' 
                                        : component.type === 'in-person' 
                                          ? 'primary.lighter' 
                                          : 'secondary.lighter'
                                    }}
                                  >
                                    <Typography 
                                      variant="h5" 
                                      sx={{ 
                                        mb: 2, 
                                        color: component.type === 'synthesis' 
                                          ? 'warning.darker' 
                                          : component.type === 'in-person' 
                                            ? 'primary.darker' 
                                            : 'secondary.darker',
                                        textAlign: 'center' 
                                      }}
                                    >
                                      {component.type === 'synthesis' && '🔄 Hybrid Event Synthesis'}
                                      {component.type === 'in-person' && '🏢 In-Person Component Analysis'}
                                      {component.type === 'virtual' && '🌐 Virtual Component Analysis'}
                                    </Typography>
                                    <Typography 
                                      variant="body1" 
                                      sx={{ 
                                        color: component.type === 'synthesis' 
                                          ? 'warning.dark' 
                                          : component.type === 'in-person' 
                                            ? 'primary.dark' 
                                            : 'secondary.dark',
                                        textAlign: 'center' 
                                      }}
                                    >
                                      {component.type === 'synthesis' && 'Comprehensive analysis combining both in-person and virtual components'}
                                      {component.type === 'in-person' && 'Detailed analysis focusing on the in-person event component'}
                                      {component.type === 'virtual' && 'Detailed analysis focusing on the virtual event component'}
                                    </Typography>
                                  </Paper>
                                </Grid>
                                
                                {/* Render analysis content */}
                                {renderAnalysisContent(component.data)}
                              </Grid>
                            </TabPanel>
                          ))}
                        </Box>
                      );
                    } else {
                      // Single analysis (in-person or virtual events)
                      return (
                        <Grid container spacing={3}>
                          {/* Event Analysis Type Header */}
                          <Grid size={12}>
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'primary.lighter' }}>
                              <Typography variant="h5" sx={{ mb: 2, color: 'primary.darker', textAlign: 'center' }}>
                                📊 {currentTab.result.data.event_analysis_type?.toUpperCase() || 'UNKNOWN'} Event Analysis Results
                              </Typography>
                              <Typography variant="body1" sx={{ color: 'primary.dark', textAlign: 'center' }}>
                                Comprehensive analysis and predictions for your {currentTab.result.data.event_analysis_type || 'event'}
                              </Typography>
                            </Paper>
                          </Grid>
                          
                          {/* Render analysis content using the single data object */}
                          {renderAnalysisContent(currentTab.result.data)}
                        </Grid>
                      );
                    }
                  })()}

                    {/* Tool Utilization Summary */}
                    {currentTab.result.data.tool_utilization_summary && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.neutral' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                            🔧 Analysis Overview
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.entries(currentTab.result.data.tool_utilization_summary).map(([key, value], index) => (
                              <Grid size={{ xs: 12, md: 6 }} key={index}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary', fontWeight: 'bold' }}>
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                    {value}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Main Statistics Cards */}
                    <Grid size={12}>
                      <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'secondary.main' }}>
                          📈 Key Metrics
                        </Typography>
                        <Grid container spacing={3}>
                          {/* Expected Registrations */}
                          <Grid size={{ xs: 12, md: 3 }}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 3, 
                                bgcolor: 'info.lighter',
                                borderColor: 'info.main',
                                textAlign: 'center'
                              }}
                            >
                              <Typography variant="h4" sx={{ 
                                color: 'info.darker', 
                                fontWeight: 'bold',
                                mb: 1 
                              }}>
                                {typeof currentTab.result.data.registration_expected === 'object' 
                                  ? currentTab.result.data.registration_expected.total?.toLocaleString() || 'N/A'
                                  : currentTab.result.data.registration_expected?.toLocaleString() || 'N/A'}
                              </Typography>
                              <Typography variant="h6" sx={{ 
                                color: 'info.darker',
                                mb: 1 
                              }}>
                                Expected Registrations
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'info.dark' }}>
                                {currentTab.result.data.event_analysis_type === 'hybrid' ? 'Total across both formats' : 'Projected total registrations'}
                              </Typography>
                              {currentTab.result.data.event_analysis_type === 'hybrid' && currentTab.result.data.registration_expected.in_person && (
                                <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                  <Typography variant="caption" sx={{ display: 'block' }}>
                                    In-Person: {currentTab.result.data.registration_expected.in_person.toLocaleString()}
                                  </Typography>
                                  <Typography variant="caption" sx={{ display: 'block' }}>
                                    Virtual: {currentTab.result.data.registration_expected.virtual.toLocaleString()}
                                  </Typography>
                                </Box>
                              )}
                            </Paper>
                          </Grid>

                          {/* Expected Attendance */}
                          <Grid size={{ xs: 12, md: 3 }}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 3, 
                                bgcolor: 'success.lighter',
                                borderColor: 'success.main',
                                textAlign: 'center'
                              }}
                            >
                              <Typography variant="h4" sx={{ 
                                color: 'success.darker', 
                                fontWeight: 'bold',
                                mb: 1 
                              }}>
                                {typeof currentTab.result.data.attendance_expected === 'object' 
                                  ? currentTab.result.data.attendance_expected.total?.toLocaleString() || 'N/A'
                                  : currentTab.result.data.attendance_expected?.toLocaleString() || 'N/A'}
                              </Typography>
                              <Typography variant="h6" sx={{ 
                                color: 'success.darker',
                                mb: 1 
                              }}>
                                Expected Attendance
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'success.dark' }}>
                                {currentTab.result.data.event_analysis_type === 'hybrid' ? 'Total across both formats' : 'Predicted actual attendees'}
                              </Typography>
                              {currentTab.result.data.event_analysis_type === 'hybrid' && currentTab.result.data.attendance_expected.in_person && (
                                <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                  <Typography variant="caption" sx={{ display: 'block' }}>
                                    In-Person: {currentTab.result.data.attendance_expected.in_person.toLocaleString()}
                                  </Typography>
                                  <Typography variant="caption" sx={{ display: 'block' }}>
                                    Virtual: {currentTab.result.data.attendance_expected.virtual.toLocaleString()}
                                  </Typography>
                                </Box>
                              )}
                            </Paper>
                          </Grid>

                          {/* Confidence Level */}
                          <Grid size={{ xs: 12, md: 3 }}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 3, 
                                bgcolor: 'warning.lighter',
                                borderColor: 'warning.main',
                                textAlign: 'center'
                              }}
                            >
                              <Typography variant="h4" sx={{ 
                                color: 'warning.darker', 
                                fontWeight: 'bold',
                                mb: 1 
                              }}>
                                {currentTab.result.data.confidence_level?.toUpperCase() || 'N/A'}
                              </Typography>
                              <Typography variant="h6" sx={{ 
                                color: 'warning.darker',
                                mb: 1 
                              }}>
                                Confidence Level
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'warning.dark' }}>
                                Analysis reliability assessment
                              </Typography>
                            </Paper>
                          </Grid>

                          {/* Attendance Rate */}
                          <Grid size={{ xs: 12, md: 3 }}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 3, 
                                bgcolor: 'secondary.lighter',
                                borderColor: 'secondary.main',
                                textAlign: 'center'
                              }}
                            >
                              <Typography variant="h4" sx={{ 
                                color: 'secondary.darker', 
                                fontWeight: 'bold',
                                mb: 1 
                              }}>
                                {(() => {
                                  const attendance = typeof currentTab.result.data.attendance_expected === 'object' 
                                    ? currentTab.result.data.attendance_expected.total 
                                    : currentTab.result.data.attendance_expected;
                                  const registration = typeof currentTab.result.data.registration_expected === 'object' 
                                    ? currentTab.result.data.registration_expected.total 
                                    : currentTab.result.data.registration_expected;
                                  return attendance && registration ? 
                                    Math.round((attendance / registration) * 100) + '%' : 'N/A';
                                })()}
                              </Typography>
                              <Typography variant="h6" sx={{ 
                                color: 'secondary.darker',
                                mb: 1 
                              }}>
                                Attendance Rate
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'secondary.dark' }}>
                                Registration to attendance conversion
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>

                    {/* Event-Type Specific Analysis Sections */}
                    
                    {/* In-Person Specific: Venue Analysis */}
                    {currentTab.result.data.event_analysis_type === 'in-person' && currentTab.result.data.venue_analysis && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'blue.50' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'blue.dark' }}>
                            🏢 Venue Analysis
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.entries(currentTab.result.data.venue_analysis).map(([key, value], index) => (
                              <Grid size={{ xs: 12, md: 6 }} key={index}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'blue.dark', fontWeight: 'bold' }}>
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                    {value}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* In-Person Specific: Weather Impact Analysis */}
                    {currentTab.result.data.event_analysis_type === 'in-person' && currentTab.result.data.weather_impact_analysis && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'orange.50' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'orange.dark' }}>
                            🌤️ Weather Impact Analysis
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.entries(currentTab.result.data.weather_impact_analysis).map(([key, value], index) => (
                              <Grid size={{ xs: 12, md: 6 }} key={index}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'orange.dark', fontWeight: 'bold' }}>
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                    {value}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Virtual/Hybrid Specific: Global Reach Analysis */}
                    {(currentTab.result.data.event_analysis_type === 'virtual' || currentTab.result.data.event_analysis_type === 'hybrid') && currentTab.result.data.global_reach_analysis && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'green.50' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'green.dark' }}>
                            🌍 Global Reach Analysis
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.entries(currentTab.result.data.global_reach_analysis).map(([key, value], index) => (
                              <Grid size={{ xs: 12, md: 6 }} key={index}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'green.dark', fontWeight: 'bold' }}>
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                    {value}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Virtual Specific: Timezone Optimization */}
                    {currentTab.result.data.event_analysis_type === 'virtual' && currentTab.result.data.timezone_optimization && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'purple.50' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'purple.dark' }}>
                            ⏰ Timezone Optimization
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.entries(currentTab.result.data.timezone_optimization).map(([key, value], index) => (
                              <Grid size={{ xs: 12, md: 6 }} key={index}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'purple.dark', fontWeight: 'bold' }}>
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                    {value}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Hybrid Specific: Hybrid Optimization Analysis */}
                    {currentTab.result.data.event_analysis_type === 'hybrid' && currentTab.result.data.hybrid_optimization_analysis && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'indigo.50' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'indigo.dark' }}>
                            🔄 Hybrid Optimization Analysis
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.entries(currentTab.result.data.hybrid_optimization_analysis).map(([key, value], index) => (
                              <Grid size={{ xs: 12, md: 6 }} key={index}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'indigo.dark', fontWeight: 'bold' }}>
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                    {value}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Hybrid Specific: Audience Segmentation Strategy */}
                    {currentTab.result.data.event_analysis_type === 'hybrid' && currentTab.result.data.audience_segmentation_strategy && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'teal.50' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'teal.dark' }}>
                            👥 Audience Segmentation Strategy
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.entries(currentTab.result.data.audience_segmentation_strategy).map(([key, value], index) => (
                              <Grid size={{ xs: 12, md: 6 }} key={index}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'teal.dark', fontWeight: 'bold' }}>
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                    {value}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Key Insights */}
                    {currentTab.result.data.key_insights && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'secondary.main' }}>
                            💡 Key Insights
                          </Typography>
                          <Grid container spacing={2}>
                            {currentTab.result.data.key_insights.map((insight, index) => (
                              <Grid size={{ xs: 12, md: 6 }} key={index}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 2, 
                                    bgcolor: 'info.lighter',
                                    borderColor: 'info.light',
                                    borderLeft: '4px solid',
                                    borderLeftColor: 'info.main'
                                  }}
                                >
                                  <Typography variant="body2" sx={{ color: 'info.darker' }}>
                                    <strong>Insight {index + 1}:</strong> {insight}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Data Visualizations */}
                    {currentTab.result.data.data_visualizations && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                            📈 Data Visualizations & Analytics
                          </Typography>
                          
                          <Grid container spacing={3}>
                            {/* Audience Segmentation */}
                            {currentTab.result.data.data_visualizations?.audience_segmentation && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    👥 {currentTab.result.data.data_visualizations.audience_segmentation.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {currentTab.result.data.data_visualizations.audience_segmentation.data?.map((item, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ 
                                          width: 16, 
                                          height: 16, 
                                          bgcolor: item.color, 
                                          borderRadius: '50%' 
                                        }} />
                                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                          {item.label}:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                          {item.value}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </Paper>
                              </Grid>
                            )}

                            {/* Registration Trend */}
                            {currentTab.result.data.data_visualizations?.registration_trend && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    📈 {currentTab.result.data.data_visualizations.registration_trend.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {currentTab.result.data.data_visualizations.registration_trend.data?.categories?.map((period, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body2" sx={{ minWidth: 80 }}>
                                          {period}:
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 1 }}>
                                          {currentTab.result.data.data_visualizations.registration_trend.data.series?.map((series, seriesIndex) => (
                                            <Box key={seriesIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <Box sx={{ 
                                                width: 8, 
                                                height: 8, 
                                                bgcolor: series.color, 
                                                borderRadius: '50%' 
                                              }} />
                                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {series.data[index]}
                                              </Typography>
                                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                ({series.name})
                                              </Typography>
                                            </Box>
                                          ))}
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                </Paper>
                              </Grid>
                            )}

                            {/* Geographic Distribution */}
                            {currentTab.result.data.data_visualizations?.geographic_distribution && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    🌎 {currentTab.result.data.data_visualizations.geographic_distribution.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {currentTab.result.data.data_visualizations.geographic_distribution.data?.locations?.map((location, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body2" sx={{ minWidth: 100 }}>
                                          {location.country}:
                                        </Typography>
                                        <Box sx={{ 
                                          flexGrow: 1, 
                                          bgcolor: 'grey.200', 
                                          borderRadius: 1, 
                                          height: 8, 
                                          position: 'relative',
                                          overflow: 'hidden'
                                        }}>
                                          <Box sx={{ 
                                            bgcolor: location.color, 
                                            height: '100%', 
                                            width: `${Math.min((location.value / 500) * 100, 100)}%`,
                                            borderRadius: 1 
                                          }} />
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 50 }}>
                                          {location.value}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </Paper>
                              </Grid>
                            )}

                            {/* Conversion Funnel */}
                            {currentTab.result.data.data_visualizations?.conversion_funnel && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    🎯 {currentTab.result.data.data_visualizations.conversion_funnel.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {currentTab.result.data.data_visualizations.conversion_funnel.data?.map((stage, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body2" sx={{ minWidth: 120 }}>
                                          {stage.stage}:
                                        </Typography>
                                        <Box sx={{ 
                                          flexGrow: 1, 
                                          bgcolor: 'grey.200', 
                                          borderRadius: 1, 
                                          height: 12, 
                                          position: 'relative',
                                          overflow: 'hidden'
                                        }}>
                                          <Box sx={{ 
                                            bgcolor: stage.color, 
                                            height: '100%', 
                                            width: `${100 - (index * 15)}%`,
                                            borderRadius: 1 
                                          }} />
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 60 }}>
                                          {stage.value}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </Paper>
                              </Grid>
                            )}

                            {/* Daily Attendance Forecast */}
                            {currentTab.result.data.data_visualizations?.daily_attendance_forecast && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    📅 {currentTab.result.data.data_visualizations.daily_attendance_forecast.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {currentTab.result.data.data_visualizations.daily_attendance_forecast.data?.categories?.map((day, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body2" sx={{ minWidth: 80 }}>
                                          {day}:
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 1 }}>
                                          {currentTab.result.data.data_visualizations.daily_attendance_forecast.data.series?.map((series, seriesIndex) => (
                                            <Box key={seriesIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <Box sx={{ 
                                                width: 8, 
                                                height: 8, 
                                                bgcolor: series.color, 
                                                borderRadius: '50%' 
                                              }} />
                                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {series.data[index]}
                                              </Typography>
                                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                ({series.name})
                                              </Typography>
                                            </Box>
                                          ))}
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                </Paper>
                              </Grid>
                            )}

                            {/* Industry Breakdown */}
                            {currentTab.result.data.data_visualizations?.industry_breakdown && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    🏢 {currentTab.result.data.data_visualizations.industry_breakdown.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {currentTab.result.data.data_visualizations.industry_breakdown.data?.map((item, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ 
                                          width: 16, 
                                          height: 16, 
                                          bgcolor: item.color, 
                                          borderRadius: '50%' 
                                        }} />
                                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                          {item.label}:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                          {item.value}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </Paper>
                              </Grid>
                            )}

                            {/* Marketing Effectiveness */}
                            {currentTab.result.data.data_visualizations?.marketing_effectiveness && (
                              <Grid size={{ xs: 12, md: 12 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    📊 {currentTab.result.data.data_visualizations.marketing_effectiveness.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {currentTab.result.data.data_visualizations.marketing_effectiveness.data?.categories?.map((channel, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body2" sx={{ minWidth: 120 }}>
                                          {channel}:
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 1 }}>
                                          {currentTab.result.data.data_visualizations.marketing_effectiveness.data.series?.map((series, seriesIndex) => (
                                            <Box key={seriesIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <Box sx={{ 
                                                width: 8, 
                                                height: 8, 
                                                bgcolor: series.color, 
                                                borderRadius: '50%' 
                                              }} />
                                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {series.data[index]}
                                              </Typography>
                                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                ({series.name})
                                              </Typography>
                                            </Box>
                                          ))}
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                </Paper>
                              </Grid>
                            )}

                            {/* Format-Specific Marketing Effectiveness */}
                            {currentTab.result.data.local_marketing_effectiveness && (
                              <Grid size={{ xs: 12, md: 12 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'success.lighter' }}>
                                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: 'success.main' }}>
                                    📍 Local Marketing Effectiveness
                                  </Typography>
                                  <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                          📰 Offline Publicity
                                        </Typography>
                                        <Typography variant="body2">
                                          {currentTab.result.data.local_marketing_effectiveness.offline_publicity}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                          🤝 Meetup Community Building
                                        </Typography>
                                        <Typography variant="body2">
                                          {currentTab.result.data.local_marketing_effectiveness.meetup_community_building}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                          🌐 Geographic Digital Targeting
                                        </Typography>
                                        <Typography variant="body2">
                                          {currentTab.result.data.local_marketing_effectiveness.geographic_digital_targeting}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                          🤝 Regional Influencer Impact
                                        </Typography>
                                        <Typography variant="body2">
                                          {currentTab.result.data.local_marketing_effectiveness.regional_influencer_impact}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                  </Grid>
                                </Paper>
                              </Grid>
                            )}

                            {/* International Marketing Effectiveness (Virtual Events) */}
                            {currentTab.result.data.international_marketing_effectiveness && (
                              <Grid size={{ xs: 12, md: 12 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'info.lighter' }}>
                                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: 'info.main' }}>
                                    🌍 International Marketing Effectiveness
                                  </Typography>
                                  <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                          🌐 Global Digital Marketing
                                        </Typography>
                                        <Typography variant="body2">
                                          {currentTab.result.data.international_marketing_effectiveness.global_digital_marketing}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                          🎯 Regional Marketing Adaptation
                                        </Typography>
                                        <Typography variant="body2">
                                          {currentTab.result.data.international_marketing_effectiveness.regional_marketing_adaptation}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 12 }}>
                                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                          🤝 International Influencer Impact
                                        </Typography>
                                        <Typography variant="body2">
                                          {currentTab.result.data.international_marketing_effectiveness.international_influencer_impact}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                  </Grid>
                                </Paper>
                              </Grid>
                            )}

                            {/* Integrated Marketing Effectiveness (Hybrid Events) */}
                            {currentTab.result.data.integrated_marketing_effectiveness && (
                              <Grid size={{ xs: 12, md: 12 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'warning.lighter' }}>
                                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: 'warning.main' }}>
                                    🔄 Integrated Marketing Effectiveness
                                  </Typography>
                                  <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                          🎯 Cross-Channel Marketing Strategy
                                        </Typography>
                                        <Typography variant="body2">
                                          {currentTab.result.data.integrated_marketing_effectiveness.cross_channel_marketing_strategy}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                          🔄 Hybrid Marketing Optimization
                                        </Typography>
                                        <Typography variant="body2">
                                          {currentTab.result.data.integrated_marketing_effectiveness.hybrid_marketing_optimization}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                  </Grid>
                                </Paper>
                              </Grid>
                            )}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Marketing Effectiveness Display */}
                    {(currentTab.result.data.local_marketing_effectiveness || 
                      currentTab.result.data.international_marketing_effectiveness || 
                      currentTab.result.data.integrated_marketing_effectiveness) && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                            📊 Marketing Effectiveness Analysis
                          </Typography>
                          
                          <Grid container spacing={3}>
                            {currentTab.result.data.local_marketing_effectiveness && (
                              <Grid size={{ xs: 12, md: 4 }}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.lighter' }}>
                                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'success.main' }}>
                                    🏠 Local Marketing Effectiveness
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {currentTab.result.data.local_marketing_effectiveness.offline_publicity && (
                                      <Typography variant="body2">
                                        <strong>Offline Publicity:</strong> {currentTab.result.data.local_marketing_effectiveness.offline_publicity}
                                      </Typography>
                                    )}
                                    {currentTab.result.data.local_marketing_effectiveness.meetup_community_building && (
                                      <Typography variant="body2">
                                        <strong>Meetup Community:</strong> {currentTab.result.data.local_marketing_effectiveness.meetup_community_building}
                                      </Typography>
                                    )}
                                    {currentTab.result.data.local_marketing_effectiveness.geographic_digital_targeting && (
                                      <Typography variant="body2">
                                        <strong>Geographic Targeting:</strong> {currentTab.result.data.local_marketing_effectiveness.geographic_digital_targeting}
                                      </Typography>
                                    )}
                                    {currentTab.result.data.local_marketing_effectiveness.regional_influencer_impact && (
                                      <Typography variant="body2">
                                        <strong>Regional Influencer:</strong> {currentTab.result.data.local_marketing_effectiveness.regional_influencer_impact}
                                      </Typography>
                                    )}
                                  </Box>
                                </Paper>
                              </Grid>
                            )}
                            
                            {currentTab.result.data.international_marketing_effectiveness && (
                              <Grid size={{ xs: 12, md: 4 }}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.lighter' }}>
                                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'info.main' }}>
                                    🌍 International Marketing Effectiveness
                                  </Typography>
                                  {typeof currentTab.result.data.international_marketing_effectiveness === 'string' ? (
                                    <Typography variant="body2">
                                      {currentTab.result.data.international_marketing_effectiveness}
                                    </Typography>
                                  ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                      {currentTab.result.data.international_marketing_effectiveness.digital_channel_performance && (
                                        <Typography variant="body2">
                                          <strong>Digital Channels:</strong> {currentTab.result.data.international_marketing_effectiveness.digital_channel_performance}
                                        </Typography>
                                      )}
                                      {currentTab.result.data.international_marketing_effectiveness.social_media_global_reach && (
                                        <Typography variant="body2">
                                          <strong>Social Media Reach:</strong> {currentTab.result.data.international_marketing_effectiveness.social_media_global_reach}
                                        </Typography>
                                      )}
                                      {currentTab.result.data.international_marketing_effectiveness.country_specific_strategies && (
                                        <Typography variant="body2">
                                          <strong>Country Strategies:</strong> {currentTab.result.data.international_marketing_effectiveness.country_specific_strategies}
                                        </Typography>
                                      )}
                                      {currentTab.result.data.international_marketing_effectiveness.international_influencer_impact && (
                                        <Typography variant="body2">
                                          <strong>Influencer Impact:</strong> {currentTab.result.data.international_marketing_effectiveness.international_influencer_impact}
                                        </Typography>
                                      )}
                                    </Box>
                                  )}
                                </Paper>
                              </Grid>
                            )}
                            
                            {currentTab.result.data.integrated_marketing_effectiveness && (
                              <Grid size={{ xs: 12, md: 4 }}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'warning.lighter' }}>
                                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'warning.main' }}>
                                    🔄 Integrated Marketing Effectiveness
                                  </Typography>
                                  {typeof currentTab.result.data.integrated_marketing_effectiveness === 'string' ? (
                                    <Typography variant="body2">
                                      {currentTab.result.data.integrated_marketing_effectiveness}
                                    </Typography>
                                  ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                      {Object.entries(currentTab.result.data.integrated_marketing_effectiveness).map(([key, value]) => (
                                        <Typography key={key} variant="body2">
                                          <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {value}
                                        </Typography>
                                      ))}
                                    </Box>
                                  )}
                                </Paper>
                              </Grid>
                            )}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Recommendations */}
                    {currentTab.result.data.recommendations && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'warning.main' }}>
                            🎯 Strategic Recommendations
                          </Typography>
                          
                          <Grid container spacing={3}>
                            {/* Optimization Strategies */}
                            {currentTab.result.data.recommendations.optimization_strategies && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'success.lighter',
                                    borderColor: 'success.main'
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'success.darker' }}>
                                    ✅ Optimization Strategies
                                  </Typography>
                                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                    {currentTab.result.data.recommendations.optimization_strategies.map((strategy, index) => (
                                      <Typography component="li" variant="body2" key={index} sx={{ mb: 1, color: 'success.darker' }}>
                                        {strategy}
                                      </Typography>
                                    ))}
                                  </Box>
                                </Paper>
                              </Grid>
                            )}

                            {/* Risk Mitigation */}
                            {currentTab.result.data.recommendations.risk_mitigation && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'error.lighter',
                                    borderColor: 'error.main'
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'error.darker' }}>
                                    ⚠️ Risk Mitigation
                                  </Typography>
                                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                    {currentTab.result.data.recommendations.risk_mitigation.map((risk, index) => (
                                      <Typography component="li" variant="body2" key={index} sx={{ mb: 1, color: 'error.darker' }}>
                                        {risk}
                                      </Typography>
                                    ))}
                                  </Box>
                                </Paper>
                              </Grid>
                            )}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Actionable Metrics */}
                    {currentTab.result.data.actionable_metrics && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'info.main' }}>
                            📊 Actionable Metrics & KPIs
                          </Typography>
                          
                          <Grid container spacing={3}>
                            {/* Conversion Rates */}
                            {currentTab.result.data.actionable_metrics.conversion_rates && (
                              <Grid size={{ xs: 12, md: currentTab.result.data.event_analysis_type === 'hybrid' ? 12 : 4 }}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'primary.lighter',
                                    borderColor: 'primary.main'
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.darker', textAlign: 'center' }}>
                                    🎯 Conversion Rates
                                  </Typography>
                                  
                                  {/* Handle different conversion rate structures */}
                                  {currentTab.result.data.event_analysis_type === 'hybrid' ? (
                                    // Hybrid event conversion rates with format breakdown
                                    Object.entries(currentTab.result.data.actionable_metrics.conversion_rates).map(([stage, values], index) => (
                                      <Box key={index} sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ color: 'primary.darker', fontWeight: 'bold', mb: 1 }}>
                                          {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Typography>
                                        <Grid container spacing={1}>
                                          {typeof values === 'object' && values !== null ? (
                                            Object.entries(values).map(([format, rate], formatIndex) => (
                                              <Grid size={{ xs: 4 }} key={formatIndex}>
                                                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                                                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                                    {format.replace(/_/g, ' ')}
                                                  </Typography>
                                                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                    {rate}
                                                  </Typography>
                                                </Box>
                                              </Grid>
                                            ))
                                          ) : (
                                            <Grid size={{ xs: 12 }}>
                                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.darker' }}>
                                                {values}
                                              </Typography>
                                            </Grid>
                                          )}
                                        </Grid>
                                      </Box>
                                    ))
                                  ) : (
                                    // Standard conversion rates for in-person/virtual
                                    Object.entries(currentTab.result.data.actionable_metrics.conversion_rates).map(([key, value], index) => (
                                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ color: 'primary.darker', textTransform: 'capitalize' }}>
                                          {key.replace(/_/g, ' ')}:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.darker' }}>
                                          {value}
                                        </Typography>
                                      </Box>
                                    ))
                                  )}
                                </Paper>
                              </Grid>
                            )}

                            {/* Revenue Projections */}
                            {currentTab.result.data.actionable_metrics.revenue_projections && (
                              <Grid size={{ xs: 12, md: currentTab.result.data.event_analysis_type === 'hybrid' ? 6 : 4 }}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'success.lighter',
                                    borderColor: 'success.main'
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'success.darker', textAlign: 'center' }}>
                                    💰 Revenue Projections
                                  </Typography>
                                  
                                  {/* Handle hybrid vs standard revenue structure */}
                                  {currentTab.result.data.event_analysis_type === 'hybrid' && currentTab.result.data.actionable_metrics.revenue_projections.revenue_breakdown ? (
                                    <Box>
                                      {/* Total Revenue */}
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 1, bgcolor: 'success.main', borderRadius: 1 }}>
                                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                                          Total Revenue:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
                                          {currentTab.result.data.actionable_metrics.revenue_projections.total_revenue}
                                        </Typography>
                                      </Box>
                                      
                                      {/* Revenue Breakdown */}
                                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'success.darker' }}>
                                        Revenue Breakdown:
                                      </Typography>
                                      {Object.entries(currentTab.result.data.actionable_metrics.revenue_projections.revenue_breakdown).map(([key, value], index) => (
                                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pl: 2 }}>
                                          <Typography variant="body2" sx={{ color: 'success.darker', textTransform: 'capitalize' }}>
                                            {key.replace(/_/g, ' ')}:
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.darker' }}>
                                            {value}
                                          </Typography>
                                        </Box>
                                      ))}
                                      
                                      {/* Break Even Analysis */}
                                      {currentTab.result.data.actionable_metrics.revenue_projections.break_even_analysis && (
                                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'success.light' }}>
                                          <Typography variant="subtitle2" sx={{ mb: 1, color: 'success.darker' }}>
                                            Break Even Analysis:
                                          </Typography>
                                          {Object.entries(currentTab.result.data.actionable_metrics.revenue_projections.break_even_analysis).map(([key, value], index) => (
                                            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pl: 2 }}>
                                              <Typography variant="body2" sx={{ color: 'success.darker', textTransform: 'capitalize' }}>
                                                {key.replace(/_/g, ' ')}:
                                              </Typography>
                                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.darker' }}>
                                                {value}
                                              </Typography>
                                            </Box>
                                          ))}
                                        </Box>
                                      )}
                                    </Box>
                                  ) : (
                                    // Standard revenue projections
                                    Object.entries(currentTab.result.data.actionable_metrics.revenue_projections).map(([key, value], index) => (
                                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ color: 'success.darker', textTransform: 'capitalize' }}>
                                          {key.replace(/_/g, ' ')}:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.darker' }}>
                                          {value}
                                        </Typography>
                                      </Box>
                                    ))
                                  )}
                                </Paper>
                              </Grid>
                            )}

                            {/* Format-specific metrics */}
                            {/* Capacity Utilization (in-person) */}
                            {currentTab.result.data.event_analysis_type === 'in-person' && currentTab.result.data.actionable_metrics.capacity_utilization && (
                              <Grid size={{ xs: 12, md: 4 }}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'warning.lighter',
                                    borderColor: 'warning.main'
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'warning.darker', textAlign: 'center' }}>
                                    📊 Capacity Utilization
                                  </Typography>
                                  {Object.entries(currentTab.result.data.actionable_metrics.capacity_utilization).map(([key, value], index) => (
                                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                      <Typography variant="body2" sx={{ color: 'warning.darker', textTransform: 'capitalize' }}>
                                        {key.replace(/_/g, ' ')}:
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.darker' }}>
                                        {value}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Paper>
                              </Grid>
                            )}

                            {/* Engagement Metrics (virtual) */}
                            {currentTab.result.data.event_analysis_type === 'virtual' && currentTab.result.data.actionable_metrics.engagement_metrics && (
                              <Grid size={{ xs: 12, md: 4 }}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'info.lighter',
                                    borderColor: 'info.main'
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'info.darker', textAlign: 'center' }}>
                                    🎮 Engagement Metrics
                                  </Typography>
                                  {Object.entries(currentTab.result.data.actionable_metrics.engagement_metrics).map(([key, value], index) => (
                                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                      <Typography variant="body2" sx={{ color: 'info.darker', textTransform: 'capitalize' }}>
                                        {key.replace(/_/g, ' ')}:
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'info.darker' }}>
                                        {value}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Paper>
                              </Grid>
                            )}

                            {/* Format Distribution (hybrid) */}
                            {currentTab.result.data.event_analysis_type === 'hybrid' && currentTab.result.data.actionable_metrics.format_distribution && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'purple.lighter',
                                    borderColor: 'purple.main'
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'purple.darker', textAlign: 'center' }}>
                                    🔄 Format Distribution
                                  </Typography>
                                  
                                  {/* Capacity Utilization */}
                                  {currentTab.result.data.actionable_metrics.format_distribution.capacity_utilization && (
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'purple.darker' }}>
                                        Capacity Utilization:
                                      </Typography>
                                      {Object.entries(currentTab.result.data.actionable_metrics.format_distribution.capacity_utilization).map(([key, value], index) => (
                                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pl: 2 }}>
                                          <Typography variant="body2" sx={{ color: 'purple.darker', textTransform: 'capitalize' }}>
                                            {key.replace(/_/g, ' ')}:
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'purple.darker' }}>
                                            {value}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  )}
                                  
                                  {/* Format Preference Split */}
                                  {currentTab.result.data.actionable_metrics.format_distribution.format_preference_split && (
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'purple.darker' }}>
                                        Format Preferences:
                                      </Typography>
                                      {Object.entries(currentTab.result.data.actionable_metrics.format_distribution.format_preference_split).map(([key, value], index) => (
                                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pl: 2 }}>
                                          <Typography variant="body2" sx={{ color: 'purple.darker', textTransform: 'capitalize' }}>
                                            {key.replace(/_/g, ' ')}:
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'purple.darker' }}>
                                            {value}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  )}
                                  
                                  {/* Engagement Comparison */}
                                  {currentTab.result.data.actionable_metrics.format_distribution.engagement_comparison && (
                                    <Box>
                                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'purple.darker' }}>
                                        Engagement Rates:
                                      </Typography>
                                      {Object.entries(currentTab.result.data.actionable_metrics.format_distribution.engagement_comparison).map(([key, value], index) => (
                                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pl: 2 }}>
                                          <Typography variant="body2" sx={{ color: 'purple.darker', textTransform: 'capitalize' }}>
                                            {key.replace(/_/g, ' ')}:
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'purple.darker' }}>
                                            {value}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  )}
                                </Paper>
                              </Grid>
                            )}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Success Metrics */}
                    {currentTab.result.data.success_metrics && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'success.main' }}>
                            🎯 Success Metrics
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.entries(currentTab.result.data.success_metrics).map(([key, value], index) => (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 2, 
                                    bgcolor: 'success.lighter',
                                    borderColor: 'success.light'
                                  }}
                                >
                                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'success.darker', textTransform: 'capitalize' }}>
                                    {key.replace(/_/g, ' ')}
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.darker' }}>
                                    {typeof value === 'object' ? (
                                      <Box>
                                        {Object.entries(value).map(([subKey, subValue], subIndex) => (
                                          <Box key={subIndex} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="body2" sx={{ color: 'success.darker', textTransform: 'capitalize' }}>
                                              {subKey.replace(/_/g, ' ')}:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.darker' }}>
                                              {subValue}
                                            </Typography>
                                          </Box>
                                        ))}
                                      </Box>
                                    ) : (
                                      value
                                    )}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Timeline Analysis */}
                    {currentTab.result.data.timeline_analysis && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'info.main' }}>
                            ⏰ Timeline Analysis
                          </Typography>
                          <Grid container spacing={3}>
                            {/* Timeline Overview */}
                            {currentTab.result.data.timeline_analysis.timeline_overview && (
                              <Grid size={12}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'info.lighter',
                                    borderColor: 'info.main'
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'info.darker' }}>
                                    📅 Timeline Overview
                                  </Typography>
                                  {typeof currentTab.result.data.timeline_analysis.timeline_overview === 'object' ? (
                                    <Grid container spacing={2}>
                                      {Object.entries(currentTab.result.data.timeline_analysis.timeline_overview).map(([key, value], index) => (
                                        <Grid size={{ xs: 12, md: 6 }} key={index}>
                                          <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid', borderColor: 'info.light' }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'info.darker', textTransform: 'capitalize' }}>
                                              {key.replace(/_/g, ' ')}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'info.darker' }}>
                                              {Array.isArray(value) ? (
                                                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                                  {value.map((item, itemIndex) => (
                                                    <Typography component="li" variant="body2" key={itemIndex} sx={{ mb: 0.5 }}>
                                                      {item}
                                                    </Typography>
                                                  ))}
                                                </Box>
                                              ) : (
                                                value
                                              )}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                      ))}
                                    </Grid>
                                  ) : (
                                    <Typography variant="body2" sx={{ color: 'info.darker' }}>
                                      {currentTab.result.data.timeline_analysis.timeline_overview}
                                    </Typography>
                                  )}
                                </Paper>
                              </Grid>
                            )}

                            {/* Key Milestones */}
                            {currentTab.result.data.timeline_analysis.key_milestones && (
                              <Grid size={12}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'primary.lighter',
                                    borderColor: 'primary.main'
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.darker' }}>
                                    🎯 Key Milestones
                                  </Typography>
                                  {Array.isArray(currentTab.result.data.timeline_analysis.key_milestones) ? (
                                    <Grid container spacing={2}>
                                      {currentTab.result.data.timeline_analysis.key_milestones.map((milestone, index) => (
                                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                                          <Paper 
                                            variant="outlined" 
                                            sx={{ 
                                              p: 2, 
                                              bgcolor: 'white',
                                              borderLeft: '4px solid',
                                              borderLeftColor: 'primary.main',
                                              height: '100%'
                                            }}
                                          >
                                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.darker' }}>
                                              Milestone {index + 1}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'primary.darker' }}>
                                              {typeof milestone === 'object' ? JSON.stringify(milestone, null, 2) : milestone}
                                            </Typography>
                                          </Paper>
                                        </Grid>
                                      ))}
                                    </Grid>
                                  ) : (
                                    <Typography variant="body2" sx={{ color: 'primary.darker' }}>
                                      {currentTab.result.data.timeline_analysis.key_milestones}
                                    </Typography>
                                  )}
                                </Paper>
                              </Grid>
                            )}

                            {/* Other Timeline Data */}
                            {Object.entries(currentTab.result.data.timeline_analysis)
                              .filter(([key]) => !['timeline_overview', 'key_milestones'].includes(key))
                              .map(([key, value], index) => (
                                <Grid size={{ xs: 12, md: 6 }} key={index}>
                                  <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                      p: 2, 
                                      bgcolor: 'grey.50',
                                      borderColor: 'grey.300'
                                    }}
                                  >
                                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary', textTransform: 'capitalize' }}>
                                      {key.replace(/_/g, ' ')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* ROI Analysis */}
                    {currentTab.result.data.roi_analysis && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'warning.main' }}>
                            💰 ROI Analysis
                          </Typography>
                          <Grid container spacing={3}>
                            {/* ROI Metrics */}
                            {currentTab.result.data.roi_analysis.roi_metrics && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'warning.lighter',
                                    borderColor: 'warning.main'
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'warning.darker' }}>
                                    📊 ROI Metrics
                                  </Typography>
                                  {typeof currentTab.result.data.roi_analysis.roi_metrics === 'object' ? (
                                    Object.entries(currentTab.result.data.roi_analysis.roi_metrics).map(([key, value], index) => (
                                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, p: 1, bgcolor: 'white', borderRadius: 1 }}>
                                        <Typography variant="body2" sx={{ color: 'warning.darker', textTransform: 'capitalize', fontWeight: 'medium' }}>
                                          {key.replace(/_/g, ' ')}:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.darker' }}>
                                          {value}
                                        </Typography>
                                      </Box>
                                    ))
                                  ) : (
                                    <Typography variant="body2" sx={{ color: 'warning.darker' }}>
                                      {currentTab.result.data.roi_analysis.roi_metrics}
                                    </Typography>
                                  )}
                                </Paper>
                              </Grid>
                            )}

                            {/* Investment Breakdown */}
                            {currentTab.result.data.roi_analysis.investment_breakdown && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'secondary.lighter',
                                    borderColor: 'secondary.main'
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'secondary.darker' }}>
                                    💼 Investment Breakdown
                                  </Typography>
                                  {typeof currentTab.result.data.roi_analysis.investment_breakdown === 'object' ? (
                                    Object.entries(currentTab.result.data.roi_analysis.investment_breakdown).map(([key, value], index) => (
                                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, p: 1, bgcolor: 'white', borderRadius: 1 }}>
                                        <Typography variant="body2" sx={{ color: 'secondary.darker', textTransform: 'capitalize', fontWeight: 'medium' }}>
                                          {key.replace(/_/g, ' ')}:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.darker' }}>
                                          {value}
                                        </Typography>
                                      </Box>
                                    ))
                                  ) : (
                                    <Typography variant="body2" sx={{ color: 'secondary.darker' }}>
                                      {currentTab.result.data.roi_analysis.investment_breakdown}
                                    </Typography>
                                  )}
                                </Paper>
                              </Grid>
                            )}

                            {/* Return Projections */}
                            {currentTab.result.data.roi_analysis.return_projections && (
                              <Grid size={12}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'success.lighter',
                                    borderColor: 'success.main'
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'success.darker' }}>
                                    📈 Return Projections
                                  </Typography>
                                  {typeof currentTab.result.data.roi_analysis.return_projections === 'object' ? (
                                    <Grid container spacing={2}>
                                      {Object.entries(currentTab.result.data.roi_analysis.return_projections).map(([key, value], index) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                          <Paper 
                                            variant="outlined" 
                                            sx={{ 
                                              p: 2, 
                                              bgcolor: 'white',
                                              borderLeft: '4px solid',
                                              borderLeftColor: 'success.main',
                                              height: '100%'
                                            }}
                                          >
                                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'success.darker', textTransform: 'capitalize' }}>
                                              {key.replace(/_/g, ' ')}
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.darker' }}>
                                              {value}
                                            </Typography>
                                          </Paper>
                                        </Grid>
                                      ))}
                                    </Grid>
                                  ) : (
                                    <Typography variant="body2" sx={{ color: 'success.darker' }}>
                                      {currentTab.result.data.roi_analysis.return_projections}
                                    </Typography>
                                  )}
                                </Paper>
                              </Grid>
                            )}

                            {/* Other ROI Data */}
                            {Object.entries(currentTab.result.data.roi_analysis)
                              .filter(([key]) => !['roi_metrics', 'investment_breakdown', 'return_projections'].includes(key))
                              .map(([key, value], index) => (
                                <Grid size={{ xs: 12, md: 6 }} key={index}>
                                  <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                      p: 2, 
                                      bgcolor: 'grey.50',
                                      borderColor: 'grey.300'
                                    }}
                                  >
                                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary', textTransform: 'capitalize' }}>
                                      {key.replace(/_/g, ' ')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Cost Breakdown */}
                    {currentTab.result.data.cost_breakdown && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
                          <Typography variant="h6" sx={{ mb: 3, color: 'error.main' }}>
                            💳 Cost Breakdown
                          </Typography>
                          <Grid container spacing={3}>
                            {/* Direct Costs */}
                            {currentTab.result.data.cost_breakdown.direct_costs && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'error.lighter',
                                    borderColor: 'error.main'
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'error.darker' }}>
                                    💰 Direct Costs
                                  </Typography>
                                  {typeof currentTab.result.data.cost_breakdown.direct_costs === 'object' ? (
                                    Object.entries(currentTab.result.data.cost_breakdown.direct_costs).map(([key, value], index) => (
                                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, p: 1, bgcolor: 'white', borderRadius: 1 }}>
                                        <Typography variant="body2" sx={{ color: 'error.darker', textTransform: 'capitalize', fontWeight: 'medium' }}>
                                          {key.replace(/_/g, ' ')}:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.darker' }}>
                                          {value}
                                        </Typography>
                                      </Box>
                                    ))
                                  ) : (
                                    <Typography variant="body2" sx={{ color: 'error.darker' }}>
                                      {currentTab.result.data.cost_breakdown.direct_costs}
                                    </Typography>
                                  )}
                                </Paper>
                              </Grid>
                            )}

                            {/* Indirect Costs */}
                            {currentTab.result.data.cost_breakdown.indirect_costs && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'warning.lighter',
                                    borderColor: 'warning.main'
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'warning.darker' }}>
                                    📋 Indirect Costs
                                  </Typography>
                                  {typeof currentTab.result.data.cost_breakdown.indirect_costs === 'object' ? (
                                    Object.entries(currentTab.result.data.cost_breakdown.indirect_costs).map(([key, value], index) => (
                                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, p: 1, bgcolor: 'white', borderRadius: 1 }}>
                                        <Typography variant="body2" sx={{ color: 'warning.darker', textTransform: 'capitalize', fontWeight: 'medium' }}>
                                          {key.replace(/_/g, ' ')}:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.darker' }}>
                                          {value}
                                        </Typography>
                                      </Box>
                                    ))
                                  ) : (
                                    <Typography variant="body2" sx={{ color: 'warning.darker' }}>
                                      {currentTab.result.data.cost_breakdown.indirect_costs}
                                    </Typography>
                                  )}
                                </Paper>
                              </Grid>
                            )}

                            {/* Total Cost Summary */}
                            {currentTab.result.data.cost_breakdown.total_cost && (
                              <Grid size={12}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'primary.lighter',
                                    borderColor: 'primary.main',
                                    borderWidth: 2
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.darker', textAlign: 'center' }}>
                                    💯 Total Cost Summary
                                  </Typography>
                                  {typeof currentTab.result.data.cost_breakdown.total_cost === 'object' ? (
                                    <Grid container spacing={2}>
                                      {Object.entries(currentTab.result.data.cost_breakdown.total_cost).map(([key, value], index) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                                          <Paper 
                                            variant="outlined" 
                                            sx={{ 
                                              p: 2, 
                                              bgcolor: 'white',
                                              borderLeft: '4px solid',
                                              borderLeftColor: 'primary.main',
                                              textAlign: 'center'
                                            }}
                                          >
                                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.darker', textTransform: 'capitalize' }}>
                                              {key.replace(/_/g, ' ')}
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.darker' }}>
                                              {value}
                                            </Typography>
                                          </Paper>
                                        </Grid>
                                      ))}
                                    </Grid>
                                  ) : (
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.darker', textAlign: 'center' }}>
                                      {currentTab.result.data.cost_breakdown.total_cost}
                                    </Typography>
                                  )}
                                </Paper>
                              </Grid>
                            )}

                            {/* Cost Categories */}
                            {currentTab.result.data.cost_breakdown.cost_categories && (
                              <Grid size={12}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    bgcolor: 'info.lighter',
                                    borderColor: 'info.main'
                                  }}
                                >
                                  <Typography variant="h6" sx={{ mb: 2, color: 'info.darker' }}>
                                    📊 Cost Categories
                                  </Typography>
                                  {Array.isArray(currentTab.result.data.cost_breakdown.cost_categories) ? (
                                    <Grid container spacing={2}>
                                      {currentTab.result.data.cost_breakdown.cost_categories.map((category, index) => (
                                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                                          <Paper 
                                            variant="outlined" 
                                            sx={{ 
                                              p: 2, 
                                              bgcolor: 'white',
                                              borderLeft: '4px solid',
                                              borderLeftColor: 'info.main',
                                              height: '100%'
                                            }}
                                          >
                                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'info.darker' }}>
                                              Category {index + 1}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'info.darker' }}>
                                              {typeof category === 'object' ? JSON.stringify(category, null, 2) : category}
                                            </Typography>
                                          </Paper>
                                        </Grid>
                                      ))}
                                    </Grid>
                                  ) : typeof currentTab.result.data.cost_breakdown.cost_categories === 'object' ? (
                                    <Grid container spacing={2}>
                                      {Object.entries(currentTab.result.data.cost_breakdown.cost_categories).map(([key, value], index) => (
                                        <Grid size={{ xs: 12, md: 6 }} key={index}>
                                          <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid', borderColor: 'info.light' }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'info.darker', textTransform: 'capitalize' }}>
                                              {key.replace(/_/g, ' ')}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'info.darker' }}>
                                              {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                      ))}
                                    </Grid>
                                  ) : (
                                    <Typography variant="body2" sx={{ color: 'info.darker' }}>
                                      {currentTab.result.data.cost_breakdown.cost_categories}
                                    </Typography>
                                  )}
                                </Paper>
                              </Grid>
                            )}

                            {/* Other Cost Data */}
                            {Object.entries(currentTab.result.data.cost_breakdown)
                              .filter(([key]) => !['direct_costs', 'indirect_costs', 'total_cost', 'cost_categories'].includes(key))
                              .map(([key, value], index) => (
                                <Grid size={{ xs: 12, md: 6 }} key={index}>
                                  <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                      p: 2, 
                                      bgcolor: 'grey.50',
                                      borderColor: 'grey.300'
                                    }}
                                  >
                                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary', textTransform: 'capitalize' }}>
                                      {key.replace(/_/g, ' ')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}
                </Box>
              )}
            </Stack>
          )}
        </Paper>
      </Card>

      {/* Marketing Strategy Configuration Modal */}
      <Dialog 
        open={marketingModalOpen} 
        onClose={handleCloseMarketingModal} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5">
              {selectedMarketingChannel && `${getChannelDisplayName(selectedMarketingChannel)} Marketing Strategy`}
            </Typography>
            <IconButton onClick={handleCloseMarketingModal}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMarketingChannel && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Target Audience */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  🎯 Target Audience
                </Typography>
              </Grid>

              <Grid size={12}>
                <Controller
                  name={`marketing_strategy.${selectedMarketingChannel}.audience`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Target Audience"
                      placeholder={selectedMarketingChannel === 'offline_publicity' 
                        ? "e.g., Tech professionals aged 25-45, Local business owners, Industry leaders"
                        : "e.g., Tech professionals, AI researchers, Startup founders aged 25-45"
                      }
                      multiline
                      rows={3}
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              {/* Placement Strategy */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'secondary.main' }}>
                  📍 Placement & Distribution Strategy
                </Typography>
              </Grid>

              <Grid size={12}>
                <Controller
                  name={`marketing_strategy.${selectedMarketingChannel}.placement`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Placement Strategy"
                      placeholder={getPlacementPlaceholder(selectedMarketingChannel)}
                      multiline
                      rows={4}
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              {/* Reach & Engagement Goals */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'info.main' }}>
                  📈 Reach & Engagement Goals
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`marketing_strategy.${selectedMarketingChannel}.reach`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Expected Reach/Impressions"
                      placeholder={selectedMarketingChannel === 'offline_publicity' 
                        ? "e.g., 50,000 people, 500 flyers distributed"
                        : "e.g., 100,000 impressions, 5,000 engagements"
                      }
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`marketing_strategy.${selectedMarketingChannel}.reaction`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Expected Reaction/Response"
                      placeholder="e.g., 2% CTR, 500 registrations, High engagement"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              {/* Budget & Timeline */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'warning.main' }}>
                  💰 Budget & Timeline
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`marketing_strategy.${selectedMarketingChannel}.budget`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Budget Allocation"
                      placeholder="e.g., $5,000, €3,000, 15% of total budget"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`marketing_strategy.${selectedMarketingChannel}.timeline`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Campaign Timeline"
                      placeholder="e.g., 4 weeks before event, Launch 2 months prior"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              {/* Content Strategy */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'success.main' }}>
                  🎨 Content Strategy
                </Typography>
              </Grid>

              <Grid size={12}>
                <Controller
                  name={`marketing_strategy.${selectedMarketingChannel}.content_type`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Content Type & Format"
                      placeholder={getContentPlaceholder(selectedMarketingChannel)}
                      multiline
                      rows={3}
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              {/* Influencer Partnerships - Only for social media channels */}
              {['facebook', 'instagram', 'linkedin', 'x_twitter', 'youtube'].includes(selectedMarketingChannel) && (
                <>
                  <Grid size={12}>
                    <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'purple.main' }}>
                      🤝 Influencer Partnerships
                    </Typography>
                  </Grid>
                  
                  <Grid size={12}>
                    <InfluencerPartnershipsSection 
                      channelName={selectedMarketingChannel}
                      methods={methods}
                    />
                  </Grid>
                </>
              )}

              {/* Additional Information */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'text.secondary' }}>
                  ℹ️ Additional Strategy Notes
                </Typography>
              </Grid>
              
              <Grid size={12}>
                <Controller
                  name={`marketing_strategy.${selectedMarketingChannel}.additional_info`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Additional Information"
                      multiline
                      rows={3}
                      placeholder="Any special considerations, partnerships, or strategy notes..."
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleCloseMarketingModal} variant="outlined">
            Close
          </Button>
          <Button 
            onClick={handleSaveMarketingModal} 
            variant="contained"
            startIcon={<Iconify icon="eva:checkmark-circle-2-outline" />}
          >
            Save Marketing Strategy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Country Marketing Configuration Modal - Same as In-Person Marketing Modal */}
      <Dialog 
        open={countryMarketingModalOpen} 
        onClose={() => setCountryMarketingModalOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {selectedCountryForMarketing && (
                <>
                  <img 
                    src={COUNTRIES_LIST.find(c => c.code === selectedCountryForMarketing.countryCode)?.flag} 
                    alt={selectedCountryForMarketing.countryCode} 
                    style={{ width: 16, height: 12 }} 
                  />
                  {getChannelDisplayName(selectedCountryForMarketing.channel)} for {COUNTRIES_LIST.find(c => c.code === selectedCountryForMarketing.countryCode)?.name}
                </>
              )}
            </Typography>
            <IconButton onClick={() => setCountryMarketingModalOpen(false)}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCountryForMarketing && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Configure {getChannelDisplayName(selectedCountryForMarketing.channel)} marketing strategy for{' '}
                  <strong>{COUNTRIES_LIST.find(c => c.code === selectedCountryForMarketing.countryCode)?.name}</strong>{' '}
                  in <strong>{LANGUAGES_LIST.find(l => l.code === watch('event_language'))?.name}</strong>.
                  Consider local culture, timing, and preferred platforms.
                </Alert>
              </Grid>

              {/* Target Audience */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  🎯 Target Audience
                </Typography>
              </Grid>

              <Grid size={12}>
                <Controller
                  name={`country_marketing.${selectedCountries.findIndex(c => c === selectedCountryForMarketing.countryCode)}.marketing_strategy.${selectedCountryForMarketing.channel}.audience`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Target Audience"
                      placeholder={selectedCountryForMarketing.channel === 'offline_publicity' 
                        ? `e.g., Tech professionals aged 25-45 in ${COUNTRIES_LIST.find(c => c.code === selectedCountryForMarketing.countryCode)?.name}, Local business owners, Industry leaders`
                        : `e.g., Tech professionals in ${COUNTRIES_LIST.find(c => c.code === selectedCountryForMarketing.countryCode)?.name}, AI researchers, Startup founders aged 25-45`
                      }
                      multiline
                      rows={3}
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              {/* Placement Strategy */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'secondary.main' }}>
                  📍 Placement & Distribution Strategy
                </Typography>
              </Grid>

              <Grid size={12}>
                <Controller
                  name={`country_marketing.${selectedCountries.findIndex(c => c === selectedCountryForMarketing.countryCode)}.marketing_strategy.${selectedCountryForMarketing.channel}.placement`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Placement Strategy"
                      placeholder={`${getPlacementPlaceholder(selectedCountryForMarketing.channel)} - adapted for ${COUNTRIES_LIST.find(c => c.code === selectedCountryForMarketing.countryCode)?.name}`}
                      multiline
                      rows={4}
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              {/* Reach & Engagement Goals */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'info.main' }}>
                  📈 Reach & Engagement Goals
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`country_marketing.${selectedCountries.findIndex(c => c === selectedCountryForMarketing.countryCode)}.marketing_strategy.${selectedCountryForMarketing.channel}.reach`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Expected Reach/Impressions"
                      placeholder={selectedCountryForMarketing.channel === 'offline_publicity' 
                        ? `e.g., 25,000 people in ${COUNTRIES_LIST.find(c => c.code === selectedCountryForMarketing.countryCode)?.name}, 500 flyers distributed`
                        : `e.g., 50,000 impressions in ${COUNTRIES_LIST.find(c => c.code === selectedCountryForMarketing.countryCode)?.name}, 3,000 engagements`
                      }
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`country_marketing.${selectedCountries.findIndex(c => c === selectedCountryForMarketing.countryCode)}.marketing_strategy.${selectedCountryForMarketing.channel}.reaction`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Expected Reaction/Response"
                      placeholder="e.g., 2% CTR, 150 registrations, High engagement"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              {/* Budget & Timeline */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'warning.main' }}>
                  💰 Budget & Timeline
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`country_marketing.${selectedCountries.findIndex(c => c === selectedCountryForMarketing.countryCode)}.marketing_strategy.${selectedCountryForMarketing.channel}.budget`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Budget Allocation"
                      placeholder="e.g., $2,000 USD, €1,500, Local currency equivalent"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`country_marketing.${selectedCountries.findIndex(c => c === selectedCountryForMarketing.countryCode)}.marketing_strategy.${selectedCountryForMarketing.channel}.timeline`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Campaign Timeline"
                      placeholder="e.g., 4 weeks before event, Consider local holidays"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              {/* Content Strategy */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'success.main' }}>
                  🎨 Content Strategy
                </Typography>
              </Grid>

              <Grid size={12}>
                <Controller
                  name={`country_marketing.${selectedCountries.findIndex(c => c === selectedCountryForMarketing.countryCode)}.marketing_strategy.${selectedCountryForMarketing.channel}.content_type`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Content Type & Format"
                      placeholder={`${getContentPlaceholder(selectedCountryForMarketing.channel)} - localized for ${COUNTRIES_LIST.find(c => c.code === selectedCountryForMarketing.countryCode)?.name} in ${LANGUAGES_LIST.find(l => l.code === watch('event_language'))?.name}`}
                      multiline
                      rows={3}
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              {/* Influencer Partnerships - Only for social media channels */}
              {['facebook', 'instagram', 'linkedin', 'x_twitter', 'youtube'].includes(selectedCountryForMarketing.channel) && (
                <>
                  <Grid size={12}>
                    <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'purple.main' }}>
                      🤝 Local Influencer Partnerships
                    </Typography>
                  </Grid>
                  
                  <Grid size={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Add local influencers from {COUNTRIES_LIST.find(c => c.code === selectedCountryForMarketing.countryCode)?.name} for this {getChannelDisplayName(selectedCountryForMarketing.channel)} campaign
                      </Typography>
                      <InfluencerPartnershipsSection 
                        channelName={`country_marketing.${selectedCountries.findIndex(c => c === selectedCountryForMarketing.countryCode)}.marketing_strategy.${selectedCountryForMarketing.channel}`}
                        methods={methods}
                      />
                    </Box>
                  </Grid>
                </>
              )}

              {/* Additional Information */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'text.secondary' }}>
                  ℹ️ Additional Strategy Notes
                </Typography>
              </Grid>
              
              <Grid size={12}>
                <Controller
                  name={`country_marketing.${selectedCountries.findIndex(c => c === selectedCountryForMarketing.countryCode)}.marketing_strategy.${selectedCountryForMarketing.channel}.additional_info`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Additional Information"
                      multiline
                      rows={3}
                      placeholder={`Cultural considerations, local partnerships, timezone optimizations for ${COUNTRIES_LIST.find(c => c.code === selectedCountryForMarketing.countryCode)?.name}...`}
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setCountryMarketingModalOpen(false)} variant="outlined">
            Close
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              setCountryMarketingModalOpen(false);
              toast.success(`${getChannelDisplayName(selectedCountryForMarketing?.channel)} marketing strategy saved for ${COUNTRIES_LIST.find(c => c.code === selectedCountryForMarketing?.countryCode)?.name}!`);
            }}
            startIcon={<Iconify icon="eva:checkmark-circle-2-outline" />}
          >
            Save Marketing Strategy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Day Configuration Modal */}
      <Dialog 
        open={dayModalOpen} 
        onClose={handleCloseDayModal} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5">
              Day {selectedDayIndex !== null ? selectedDayIndex + 1 : ''} Configuration
            </Typography>
            <IconButton onClick={handleCloseDayModal}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDayIndex !== null && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Basic Information */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  📅 Basic Information
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name={`days.${selectedDayIndex}.event_date`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Event Date"
                      type="date"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name={`days.${selectedDayIndex}.start_time`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Start Time"
                      type="time"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name={`days.${selectedDayIndex}.end_time`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="End Time"
                      type="time"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              {/* Venue Information - Only for In-Person and Hybrid Events */}
              {(watch('event_type') === 'in-person' || watch('event_type') === 'hybrid') && (
                <>
                  <Grid size={12}>
                    <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'secondary.main' }}>
                      🏢 Venue Information
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 8 }}>
                    <Controller
                      name={`days.${selectedDayIndex}.venue_name`}
                      control={methods.control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Venue Name"
                          placeholder="e.g., Moscone Center, Convention Hall A"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Controller
                      name={`days.${selectedDayIndex}.venue_capacity`}
                      control={methods.control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Venue Capacity"
                          placeholder="e.g., 5000"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              {/* Virtual Platform Information - Only for Virtual and Hybrid Events */}
              {(watch('event_type') === 'virtual' || watch('event_type') === 'hybrid') && (
                <>
                  <Grid size={12}>
                    <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'info.main' }}>
                      💻 Virtual Platform Information
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name={`days.${selectedDayIndex}.virtual_platform.platform_name`}
                      control={methods.control}
                      render={({ field, fieldState: { error } }) => (
                        <FormControl fullWidth error={!!error}>
                          <InputLabel>Platform</InputLabel>
                          <Select
                            {...field}
                            label="Platform"
                          >
                            {VIRTUAL_PLATFORMS.map((platform) => (
                              <MenuItem key={platform.name} value={platform.name}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Iconify icon="mdi:monitor" />
                                  {platform.name}
                                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    (up to {platform.maxParticipants.toLocaleString()})
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                            <MenuItem value="other">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Iconify icon="mdi:plus" />
                                Other Platform
                              </Box>
                            </MenuItem>
                          </Select>
                          {error && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                              {error.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name={`days.${selectedDayIndex}.virtual_platform.max_participants`}
                      control={methods.control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Max Participants"
                          placeholder="e.g., 1000"
                          type="number"
                          fullWidth
                          error={!!error}
                          helperText={error?.message || "Maximum number of attendees for this session"}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Controller
                      name={`days.${selectedDayIndex}.virtual_platform.platform_link`}
                      control={methods.control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Meeting/Event Link (Optional)"
                          placeholder="e.g., https://zoom.us/j/123456789 or https://teams.microsoft.com/..."
                          fullWidth
                          error={!!error}
                          helperText={error?.message || "Direct link for attendees to join the virtual event"}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name={`days.${selectedDayIndex}.virtual_platform.features`}
                      control={methods.control}
                      render={({ field, fieldState: { error } }) => (
                        <Autocomplete
                          {...field}
                          multiple
                          freeSolo
                          options={[
                            'Breakout rooms',
                            'Screen sharing',
                            'Recording',
                            'Live streaming',
                            'Q&A sessions',
                            'Polls and surveys',
                            'Chat functionality',
                            'Networking rooms',
                            'Virtual backgrounds',
                            'Whiteboard collaboration'
                          ]}
                          value={field.value || []}
                          onChange={(_, newValue) => field.onChange(newValue)}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip {...getTagProps({ index })} key={option} label={option} size="small" />
                            ))
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Platform Features"
                              placeholder="Select or type features"
                              error={!!error}
                              helperText={error?.message || "Features available on this platform"}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name={`days.${selectedDayIndex}.virtual_platform.access_requirements`}
                      control={methods.control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Access Requirements (Optional)"
                          placeholder="e.g., Registration required, Free access, Paid ticket needed"
                          multiline
                          rows={2}
                          fullWidth
                          error={!!error}
                          helperText={error?.message || "What attendees need to access this virtual event"}
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              {/* Event Sector and Activities */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'info.main' }}>
                  🎯 Event Details
                </Typography>
              </Grid>
              
              <Grid size={12}>
                <Controller
                  name={`days.${selectedDayIndex}.primary_sector`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Primary Sector Focus"
                      placeholder="e.g., Technology, Healthcare, Finance, Marketing"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              {/* Speakers */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'info.main' }}>
                  🎤 Speakers & Presenters
                </Typography>
              </Grid>
              
              <Grid size={12}>
                <Controller
                  name={`days.${selectedDayIndex}.speakers`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Speakers List"
                      multiline
                      rows={4}
                      placeholder="List keynote speakers, panelists, and presenters (one per line):&#10;&#10;Dr. Sarah Johnson - AI Research Director&#10;Marcus Chen - Machine Learning Expert&#10;Prof. Lisa Wang - Data Science Leader&#10;John Smith - Industry Keynote Speaker"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              {/* Activities */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'success.main' }}>
                  📋 Activities & Schedule
                </Typography>
              </Grid>
              
              <Grid size={12}>
                <Controller
                  name={`days.${selectedDayIndex}.activities`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Daily Activities & Schedule"
                      multiline
                      rows={5}
                      placeholder="Describe the day's detailed schedule:&#10;&#10;9:00 AM - Registration & Welcome Coffee&#10;9:30 AM - Opening Keynote&#10;10:30 AM - Panel Discussion&#10;12:00 PM - Networking Lunch&#10;2:00 PM - Interactive Workshops&#10;4:00 PM - Startup Showcase&#10;6:00 PM - Closing & Networking"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              {/* Additional Information */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'warning.main' }}>
                  ℹ️ Additional Information
                </Typography>
              </Grid>
              
              <Grid size={12}>
                <Controller
                  name={`days.${selectedDayIndex}.additional_info`}
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Special Notes & Requirements"
                      multiline
                      rows={3}
                      placeholder="Any special information:&#10;&#10;• Business casual dress code&#10;• Lunch provided for all attendees&#10;• Live streaming available&#10;• Parking available in adjacent garage&#10;• Translation services available"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleCloseDayModal} variant="outlined">
            Close
          </Button>
          <Button 
            onClick={handleSaveDayModal} 
            variant="contained"
            startIcon={<Iconify icon="eva:checkmark-circle-2-outline" />}
          >
            Save Day Configuration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Tab Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Tab</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tab Name"
            fullWidth
            variant="outlined"
            value={saveTabName}
            onChange={(e) => setSaveTabName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setSaveDialogOpen(false)}
            disabled={isSavingTab}
          >
            Cancel
          </Button>
          <LoadingButton 
            onClick={confirmSaveTab} 
            variant="contained"
            loading={isSavingTab}
            disabled={isSavingTab}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Delete Tab Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Close Tab</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to close this tab?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteTab} color="error" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load from Database Dialog */}
      <Dialog 
        open={loadModalOpen} 
        onClose={() => setLoadModalOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Load Saved Tabs</Typography>
            <IconButton onClick={() => setLoadModalOpen(false)}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {loadModalLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : savedTabs?.items?.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <Typography variant="body1" color="text.secondary">
                No saved tabs found
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedTabsToLoad.length === savedTabs?.items?.length}
                          indeterminate={
                            selectedTabsToLoad.length > 0 && 
                            selectedTabsToLoad.length < savedTabs?.items?.length
                          }
                          onChange={handleSelectAllTabs}
                          title="Select/Deselect all for loading"
                        />
                      </TableCell>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedTabsToDelete.length === savedTabs?.items?.length}
                          indeterminate={
                            selectedTabsToDelete.length > 0 && 
                            selectedTabsToDelete.length < savedTabs?.items?.length
                          }
                          onChange={handleSelectAllTabsToDelete}
                          color="error"
                          title="Select/Deselect all for deletion"
                        />
                      </TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Number of Days</TableCell>
                      <TableCell>Created Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {savedTabs?.items?.map((tab) => {
                      const tabId = tab._id || tab.id;
                      const content = tab.content || {};
                      const inputData = content.input_data || {};
                      const numberOfDays = inputData.number_of_days || 'N/A';
                      const createdDate = content.created_at 
                        ? new Date(content.created_at).toLocaleDateString()
                        : 'N/A';
                      
                      return (
                        <TableRow 
                          key={tabId}
                          hover
                          selected={selectedTabsToLoad.includes(tabId)}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedTabsToLoad.includes(tabId)}
                              onChange={() => handleSelectTab(tabId)}
                              title="Select for loading"
                            />
                          </TableCell>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedTabsToDelete.includes(tabId)}
                              onChange={() => handleSelectTabToDelete(tabId)}
                              color="error"
                              title="Select for deletion"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {tab.title || 'Untitled Tab'}
                            </Typography>
                            {inputData.event_name && (
                              <Typography variant="body2" color="text.secondary">
                                {inputData.event_name}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {numberOfDays}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {createdDate}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSingleTab(tabId)}
                              disabled={loadModalLoading}
                              title="Delete this tab"
                            >
                              <Iconify icon="eva:trash-2-outline" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadModalOpen(false)}>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleDeleteSelectedTabs}
            color="error"
            disabled={selectedTabsToDelete.length === 0}
            loading={loadModalLoading}
            startIcon={<Iconify icon="eva:trash-2-outline" />}
          >
            Delete Selected ({selectedTabsToDelete.length})
          </LoadingButton>
          <LoadingButton
            onClick={handleLoadSelectedTabs}
            variant="contained"
            disabled={selectedTabsToLoad.length === 0}
            loading={loadModalLoading}
          >
            Load Selected ({selectedTabsToLoad.length})
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

