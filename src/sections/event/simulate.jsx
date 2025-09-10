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
const VirtualPlatformSchema = zod.object({
  platform_name: zod.string().min(1, { message: 'Platform name is required!' }),
  platform_link: zod.string().url({ message: 'Please enter a valid URL!' }).optional(),
  max_participants: zod.string().min(1, { message: 'Maximum participants is required!' }),
  features: zod.array(zod.string()).optional(),
  access_requirements: zod.string().optional(),
});


const DaySchema = zod.object({
  event_date: zod.string().min(1, { message: 'Event date is required!' }),
  start_time: zod.string().min(1, { message: 'Start time is required!' }),
  end_time: zod.string().min(1, { message: 'End time is required!' }),
  venue_name: zod.string().optional(), // Optional for virtual events
  venue_capacity: zod.string().optional(), // Optional for virtual events  
  virtual_platform: VirtualPlatformSchema.optional(),
  primary_sector: zod.string().min(1, { message: 'Primary sector is required!' }),
  speakers: zod.string().optional(),
  activities: zod.string().optional(),
  additional_info: zod.string().optional(),
});

const InfluencerSchema = zod.object({
  name: zod.string().optional(),
  followers_count: zod.string().optional(),
  expected_reach: zod.string().optional(),
  expected_reaction: zod.string().optional(),
});

const MarketingChannelSchema = zod.object({
  audience: zod.string().optional(),
  placement: zod.string().optional(),
  reach: zod.string().optional(),
  reaction: zod.string().optional(),
  budget: zod.string().optional(),
  timeline: zod.string().optional(),
  content_type: zod.string().optional(),
  additional_info: zod.string().optional(),
  influencer_partnerships: zod.array(InfluencerSchema).optional(),
});

const MarketingStrategySchema = zod.object({
  facebook: MarketingChannelSchema,
  instagram: MarketingChannelSchema,
  linkedin: MarketingChannelSchema,
  x_twitter: MarketingChannelSchema,
  youtube: MarketingChannelSchema,
  google_ads: MarketingChannelSchema,
  email_campaign: MarketingChannelSchema,
  whatsapp_campaign: MarketingChannelSchema,
  offline_publicity: MarketingChannelSchema,
  reddit: MarketingChannelSchema,
  meetup: MarketingChannelSchema,
  eventbrite: MarketingChannelSchema,
  indeed_events: MarketingChannelSchema,
});

const CountryMarketingSchema = zod.object({
  country_code: zod.string().min(2, { message: 'Country code is required!' }),
  country_name: zod.string().min(1, { message: 'Country name is required!' }),
  marketing_strategy: zod.object({
    facebook: MarketingChannelSchema.optional(),
    instagram: MarketingChannelSchema.optional(),
    linkedin: MarketingChannelSchema.optional(),
    x_twitter: MarketingChannelSchema.optional(),
    youtube: MarketingChannelSchema.optional(),
    google_ads: MarketingChannelSchema.optional(),
    email_campaign: MarketingChannelSchema.optional(),
    whatsapp_campaign: MarketingChannelSchema.optional(),
    offline_publicity: MarketingChannelSchema.optional(),
    reddit: MarketingChannelSchema.optional(),
    meetup: MarketingChannelSchema.optional(),
    eventbrite: MarketingChannelSchema.optional(),
    indeed_events: MarketingChannelSchema.optional(),
  }).optional(),
});

const TabFormSchema = zod.object({
  event_name: zod.string().min(1, { message: 'Event name is required!' }),
  event_type: zod.enum(['in-person', 'virtual', 'hybrid'], { message: 'Event type is required!' }),
  event_language: zod.string().min(1, { message: 'Event language is required!' }),
  event_description: zod.string().min(1, { message: 'Event description is required!' }),
  city: zod.string().optional(), // Optional for virtual events
  target_countries: zod.array(zod.string()).optional(), // For virtual/hybrid events
  country_marketing: zod.array(CountryMarketingSchema).optional(), // Country-specific marketing
  number_of_days: zod.number().min(1, { message: 'Number of days must be at least 1!' }),
  days: zod.array(DaySchema).min(1, { message: 'At least one day is required!' }),
  marketing_strategy: MarketingStrategySchema.optional(), // For in-person events
});

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

  // Auth context for user information
  const user = useAuthContext()?.user?.data;
  console.log('Authenticated user:', user);

  // Form methods for current tab
  const methods = useForm({
    resolver: zodResolver(TabFormSchema),
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

  // Load saved tabs from API - REPLACED WITH MODAL-BASED LOADING
  /*
  const loadTabsFromAPI = async () => {
    // Check if user is authenticated
    if (!user || !user._id) {
      toast.warning('Please log in to load saved tabs');
      return;
    }

    try {
      // Make request with user ID as query parameter to filter tabs by user
      const response = await axios.get(endpoints.tabs.list(user._id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Loaded tabs from API for user:', user._id, response.data);

      if (response.data && response.data.length > 0) {
        // Filter tabs that belong to the current user and are of type "event"
        const userTabs = response.data.filter(tab => 
          tab.type === "event" && 
          (tab.content?.userId === user._id || tab.content?.user_id === user._id)
        );
        
        if (userTabs.length === 0) {
          toast.info('No saved event tabs found for your account');
          return;
        }

        // Check for existing tabs with same API IDs to prevent duplicates
        const existingApiIds = tabs.map(tab => tab.apiId).filter(Boolean);
        const newTabs = userTabs.filter(apiTab => !existingApiIds.includes(apiTab.id || apiTab._id));
        
        if (newTabs.length === 0) {
          toast.info('All your saved tabs are already loaded');
          return;
        }

        const loadedTabs = newTabs.map((apiTab, index) => ({
          id: tabCounter + index, // Use current counter to avoid ID conflicts
          name: apiTab.title || `Loaded Tab ${index + 1}`,
          saved: true,
          result: apiTab.content?.output_data,
          loading: false,
          locationData: apiTab.content?.input_data?.location_data,
          apiId: apiTab.id || apiTab._id,
          inputData: apiTab.content?.input_data, // Store the loaded input data
        }));

        // Add loaded tabs to existing tabs instead of replacing them
        setTabs(prevTabs => [...prevTabs, ...loadedTabs]);
        setTabCounter(prev => prev + loadedTabs.length);
        
        // Switch to the first loaded tab and load its data
        const newActiveTabIndex = tabs.length; // Index of first loaded tab
        setActiveTab(newActiveTabIndex);
        
        if (loadedTabs[0]?.inputData) {
          const firstTabData = loadedTabs[0].inputData;
          
          // Reset form with loaded data
          reset({
            event_name: firstTabData.event_name || '',
            event_description: firstTabData.event_description || '',
            city: firstTabData.city || '',
            number_of_days: firstTabData.number_of_days || 1,
            days: firstTabData.days || [
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
            marketing_strategy: firstTabData.marketing_strategy || {
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
        }

        toast.success(`Loaded ${loadedTabs.length} saved tab${loadedTabs.length > 1 ? 's' : ''} from database`);
      } else {
        toast.info('No saved tabs found for your account');
      }
    } catch (error) {
      console.error('Error loading tabs from API:', error);
      
      // Don't show error if it's just that no tabs exist yet
      if (error.response?.status !== 404) {
        let errorMessage = 'Failed to load saved tabs';
        
        if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Network connection failed. Working in offline mode.';
        } else if (error.response) {
          const status = error.response.status;
          if (status === 401) {
            errorMessage = 'Authentication failed. Please login again.';
          } else if (status === 403) {
            errorMessage = 'Access denied. You do not have permission to load tabs.';
          } else if (status >= 500) {
            errorMessage = 'Server error. Working in offline mode.';
          }
        }
        
        toast.warning(errorMessage);
      }
    }
  };
  */

  // Removed automatic loading - tabs are now loaded manually through the Load from Database modal
  // React.useEffect(() => {
  //   if (user?._id) {
  //     loadTabsFromAPI();
  //   }
  // }, [user?._id]);

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

  // Handle loading test data for different event types
  const handleLoadTestData = (eventType) => {
    let testData;
    
    switch(eventType) {
      case 'in-person':
        testData = TEST_DATA_IN_PERSON;
        break;
      case 'virtual':
        testData = TEST_DATA_VIRTUAL;
        break;
      case 'hybrid':
        testData = TEST_DATA_HYBRID;
        break;
      default:
        testData = TEST_DATA_IN_PERSON;
    }

    // Load basic event information
    setValue('event_name', testData.event_name);
    setValue('event_type', testData.event_type);
    setValue('event_language', testData.event_language);
    setValue('event_description', testData.event_description);
    setValue('city', testData.city);
    setValue('target_countries', testData.target_countries);
    setValue('number_of_days', testData.number_of_days);
    setValue('days', testData.days);
    setValue('country_marketing', testData.country_marketing || []);
    setValue('marketing_strategy', testData.marketing_strategy);

    // Mock location data for the city
    const mockLocationData = {
      city: testData.city || testData.event_name.includes('Virtual') ? 'Global' : 'San Francisco',
      state: testData.city ? 'Various' : 'California',
      population: testData.city ? 'Global Audience' : '884,363',
      coordinates: testData.city ? [0, 0] : [37.7749, -122.4194],
      suggestedVenues: testData.city ? [] : ['Moscone Center West Hall', 'Moscone Center South Hall', 'San Francisco Convention Center']
    };

    // Update tab with mock location data
    const updatedTabs = tabs.map((tab, index) =>
      index === activeTab ? { ...tab, locationData: mockLocationData } : tab
    );
    setTabs(updatedTabs);

    // Show success message
    toast.success(`${eventType.charAt(0).toUpperCase() + eventType.slice(1)} event test data loaded successfully!`);
  };

  // Test data for different event types
  const TEST_DATA_IN_PERSON = {
    event_name: 'Global AI & Innovation Summit 2025',
    event_type: 'in-person',
    event_language: 'en',
    event_description: 'A comprehensive 3-day conference bringing together AI researchers, tech entrepreneurs, and industry leaders to explore cutting-edge developments in artificial intelligence, machine learning, and digital transformation. Features hands-on workshops, networking sessions, and startup showcases.',
    city: 'San Francisco',
    target_countries: [],
    country_marketing: [],
    number_of_days: 3,
    days: [
      {
        event_date: '2025-10-15',
        start_time: '09:00',
        end_time: '18:00',
        venue_name: 'Moscone Center West Hall',
        venue_capacity: '5000',
        primary_sector: 'Artificial Intelligence & Machine Learning',
        speakers: `Dr. Sarah Chen - Director of AI Research, Stanford University
Marcus Rodriguez - Chief AI Officer, Google DeepMind  
Prof. Elena Volkov - Machine Learning Pioneer, MIT
James Park - Founder & CEO, OpenAI
Dr. Raj Patel - VP of AI Ethics, Microsoft`,
        activities: `9:00 AM - Registration & Welcome Coffee
9:30 AM - Opening Keynote: "The Future of AGI"
10:30 AM - AI Ethics Panel Discussion
12:00 PM - Networking Lunch & Tech Expo
2:00 PM - Machine Learning Workshop
4:00 PM - Startup Pitch Competition
5:30 PM - Welcome Reception & Networking`,
        additional_info: `• Business professional dress code recommended
• All meals and refreshments provided
• Live streaming available for virtual attendees
• Simultaneous translation in Spanish and Mandarin
• Parking available at Moscone Garage ($25/day)`
      },
      {
        event_date: '2025-10-16',
        start_time: '08:30',
        end_time: '19:00',
        venue_name: 'Moscone Center South Hall',
        venue_capacity: '3500',
        primary_sector: 'Digital Transformation & Enterprise AI',
        speakers: `Lisa Wang - CTO, Salesforce
David Kumar - Head of AI Strategy, IBM
Dr. Michelle Foster - Digital Innovation Leader, Accenture
Alex Thompson - VP Engineering, NVIDIA
Maria Santos - AI Product Manager, Meta`,
        activities: `8:30 AM - Continental Breakfast & Networking
9:00 AM - Enterprise AI Implementation Keynote
10:00 AM - Industry Use Cases Panel
11:30 AM - Hands-on AI Development Workshop
1:00 PM - Networking Lunch & Solution Showcase
3:00 PM - Technical Deep-dive Sessions
5:00 PM - Innovation Awards Ceremony
6:30 PM - Evening Gala Dinner`,
        additional_info: `• Laptops required for hands-on workshops
• Technical skill level: Intermediate to Advanced
• GitHub account needed for coding sessions
• Awards ceremony features industry recognition
• Formal attire for evening gala`
      },
      {
        event_date: '2025-10-17',
        start_time: '09:00',
        end_time: '16:30',
        venue_name: 'San Francisco Convention Center',
        venue_capacity: '2000',
        primary_sector: 'AI Startups & Future Technologies',
        speakers: `Robert Chang - Managing Partner, Andreessen Horowitz
Dr. Amanda Liu - Quantum Computing Researcher, IBM Research
Carlos Mendez - AI Startup Accelerator Director, Y Combinator
Jennifer Kim - Venture Capitalist, Sequoia Capital
Prof. Michael Zhang - Robotics & AI, UC Berkeley`,
        activities: `9:00 AM - Startup Breakfast & Demo Setup
9:30 AM - Future Tech Trends Keynote
10:30 AM - Investor-Entrepreneur Panel
12:00 PM - Startup Demo Showcase (20 companies)
2:00 PM - Funding & Investment Workshop
3:30 PM - Closing Keynote: "AI in 2030"
4:15 PM - Final Networking & Wrap-up`,
        additional_info: `• Startup Demo Day featuring 20 selected companies
• Investor meetings available by appointment
• Business cards strongly recommended
• Final networking focused on partnerships
• Event app available for continued connections`
      }
    ],
    marketing_strategy: {
      facebook: {
        audience: "Tech professionals aged 25-45, AI researchers, startup founders, and decision-makers in technology companies",
        placement: "Facebook ads targeting tech professionals, Event page promotion in AI/ML groups, Sponsored posts in technology communities, Partner company shares",
        reach: "150,000 impressions, 8,000 engagements, 500 event page visits",
        reaction: "3% CTR, 200 registrations, 1,200 shares and comments",
        budget: "$3,500",
        timeline: "6 weeks before event launch, intensive 2 weeks prior",
        content_type: "Event announcement videos, Speaker spotlight posts, Countdown graphics, Live Q&A sessions with speakers",
        additional_info: "Partner with tech companies for employee sharing, utilize AI/ML Facebook groups with 50K+ members",
        influencer_partnerships: [
          {
            name: "TechGuru Mike",
            followers_count: "250,000",
            expected_reach: "75,000 impressions",
            expected_reaction: "3,000 engagements, 150 registrations"
          },
          {
            name: "AI Insights Sarah",
            followers_count: "180,000",
            expected_reach: "54,000 impressions", 
            expected_reaction: "2,200 engagements, 110 registrations"
          }
        ]
      },
      instagram: {
        audience: "Young tech professionals, AI enthusiasts, startup community, visual learners aged 22-40",
        placement: "Instagram Stories ads, Influencer partnerships with tech personalities, AI/tech hashtag campaigns, Visual event teasers",
        reach: "100,000 impressions, 5,000 story views, 2,000 profile visits",
        reaction: "4% engagement rate, 300 story interactions, 150 DMs",
        budget: "$2,500",
        timeline: "4 weeks campaign with daily posts 2 weeks before",
        content_type: "Visual speaker cards, Behind-the-scenes venue prep, IGTV speaker interviews, Stories polls and Q&As",
        additional_info: "Collaborate with tech influencers, create branded hashtag #AIInnovationSF2025",
        influencer_partnerships: [
          {
            name: "CodeWithEmily",
            followers_count: "320,000",
            expected_reach: "80,000 story views",
            expected_reaction: "5,000 engagements, 200 registrations"
          },
          {
            name: "StartupLifeAlex",
            followers_count: "150,000",
            expected_reach: "45,000 post reach",
            expected_reaction: "3,500 engagements, 140 registrations"
          }
        ]
      },
      linkedin: {
        audience: "Senior tech professionals, C-level executives, industry leaders, enterprise decision-makers, career-focused individuals",
        placement: "LinkedIn sponsored content, Professional network posts, Industry leader endorsements, LinkedIn Events promotion, Company page updates",
        reach: "200,000 impressions, 10,000 clicks, 3,000 professional connections",
        reaction: "2.5% CTR, 400 professional registrations, 50 company team registrations",
        budget: "$4,000",
        timeline: "8 weeks professional campaign, executive outreach 3 weeks prior",
        content_type: "Professional articles about AI trends, Thought leadership posts, Speaker professional achievements, Industry insights",
        additional_info: "Target Fortune 500 tech companies, leverage speaker professional networks, create LinkedIn Event page",
        influencer_partnerships: [
          {
            name: "Dr. Robert Chen (CTO)",
            followers_count: "95,000",
            expected_reach: "28,500 professional impressions",
            expected_reaction: "1,400 engagements, 85 registrations"
          }
        ]
      },
      x_twitter: {
        audience: "Tech community, AI researchers, startup ecosystem, tech journalists, early adopters aged 25-50",
        placement: "Twitter promoted tweets, Tech hashtag campaigns (#AIConf2025 #TechSummitSF), Live tweeting strategy, Speaker quote cards",
        reach: "80,000 impressions, 3,000 retweets, 1,500 replies",
        reaction: "5% engagement rate, 250 registrations via Twitter, 500 hashtag uses",
        budget: "$1,500",
        timeline: "Continuous 6-week campaign, live-tweeting during event",
        content_type: "Tweet threads about AI trends, Speaker quote graphics, Real-time event updates, Polls and tech discussions",
        additional_info: "Engage with tech Twitter community, partner with tech journalists for coverage, create event Twitter moment",
        influencer_partnerships: [
          {
            name: "@TechThreadGuru",
            followers_count: "180,000",
            expected_reach: "54,000 impressions",
            expected_reaction: "2,700 engagements, 135 registrations"
          }
        ]
      },
      youtube: {
        audience: "Tech tutorial viewers, AI/ML learners, startup enthusiasts, professional development seekers",
        placement: "Pre-roll ads on tech channels, Speaker interview teasers, Event highlight videos, Educational content tie-ins",
        reach: "50,000 video views, 2,000 subscribers, 500 comments",
        reaction: "6% view-through rate, 100 registrations from YouTube, 300 channel subscriptions",
        budget: "$2,000",
        timeline: "4 weeks of video content, speaker interviews 3 weeks before",
        content_type: "Speaker introduction videos, Event preview trailers, AI tutorial tie-ins, Behind-the-scenes venue setup",
        additional_info: "Create dedicated event playlist, collaborate with tech YouTubers, post-event content strategy",
        influencer_partnerships: [
          {
            name: "TechExplainedTV",
            followers_count: "450,000",
            expected_reach: "135,000 video views",
            expected_reaction: "8,100 engagements, 270 registrations"
          }
        ]
      },
      reddit: {
        audience: "Tech enthusiasts, developers, AI/ML practitioners, startup founders, early technology adopters",
        placement: "r/MachineLearning, r/artificial, r/tech, r/startups promoted posts, AMA sessions with speakers",
        reach: "75,000 impressions, 2,500 upvotes, 800 comments",
        reaction: "6.5% engagement rate, 180 registrations, 15 AMA participants",
        budget: "$1,200",
        timeline: "6 weeks community engagement, 2 AMA sessions, daily discussions",
        content_type: "Technical discussions, Speaker AMAs, AI trend analysis, Event announcements in relevant subreddits",
        additional_info: "Host 2 AMA sessions with keynote speakers, engage authentically in tech communities, avoid over-promotion",
        influencer_partnerships: [
          {
            name: "u/AIResearcher_Pro",
            followers_count: "85,000",
            expected_reach: "25,500 community impressions",
            expected_reaction: "1,500 engagements, 75 registrations"
          }
        ]
      },
      meetup: {
        audience: "Local tech professionals, developers, entrepreneurs, networking enthusiasts in SF Bay Area",
        placement: "SF AI Meetup groups, Tech networking events, Professional development meetups, Startup founder groups",
        reach: "15,000 meetup members, 25 related groups, 8 partnerships",
        reaction: "12% RSVP rate, 220 registrations, 45 group partnerships",
        budget: "$800",
        timeline: "8 weeks networking, attend 12 related meetups, host 2 pre-events",
        content_type: "Meetup event pages, Pre-event networking sessions, Speaker meet-and-greets, Professional networking",
        additional_info: "Partner with existing SF tech meetups, host pre-conference networking events, leverage local tech community leaders",
        influencer_partnerships: [
          {
            name: "SF Tech Meetup Leader",
            followers_count: "12,000",
            expected_reach: "8,500 local professionals",
            expected_reaction: "850 meetup views, 95 registrations"
          }
        ]
      },
      eventbrite: {
        audience: "Event attendees, professional development seekers, conference enthusiasts, local professionals",
        placement: "Eventbrite featured listings, Professional development category, Tech event recommendations, Related event suggestions",
        reach: "50,000 event page views, 3,200 saves, 1,800 shares",
        reaction: "8% conversion rate, 320 direct registrations, 15% early bird uptake",
        budget: "$1,500",
        timeline: "6 weeks featured listing, early bird promotion first 3 weeks, regular promotion following weeks",
        content_type: "Professional event page with agenda, Speaker bios and photos, Detailed venue information, Registration packages",
        additional_info: "Utilize Eventbrite's professional networking category, partner with related events for cross-promotion, optimize for mobile registration",
        influencer_partnerships: [
          {
            name: "EventExpert_SF",
            followers_count: "25,000",
            expected_reach: "12,500 event page views",
            expected_reaction: "1,000 engagements, 125 registrations"
          }
        ]
      },
      indeed_events: {
        audience: "Job seekers, career changers, professional development focused individuals, HR professionals, recruiters",
        placement: "Indeed Events career fair section, Professional development events, Tech career networking, Industry advancement programs",
        reach: "35,000 career-focused views, 2,100 professional saves, 850 career inquiries",
        reaction: "7% career conversion rate, 280 professional registrations, 65 recruiter attendees",
        budget: "$1,800",
        timeline: "6 weeks career-focused promotion, networking with HR departments, professional development angle",
        content_type: "Career advancement messaging, Professional development opportunities, Networking for job seekers, Industry insights for career growth",
        additional_info: "Position as career advancement opportunity, partner with recruiting firms, highlight networking potential with industry leaders",
        influencer_partnerships: [
          {
            name: "CareerGrowthGuru",
            followers_count: "55,000",
            expected_reach: "22,000 career-focused views",
            expected_reaction: "1,800 career engagements, 165 registrations"
          }
        ]
      },
      google_ads: {
        audience: "Tech professionals searching for conferences, AI/ML events, professional development opportunities",
        placement: "Google search ads for 'AI conference', 'tech summit', 'machine learning events', Display ads on tech websites, YouTube pre-roll",
        reach: "120,000 search impressions, 4,500 clicks, 350 conversions",
        reaction: "3.75% CTR, 280 search-driven registrations, 8.5% conversion rate",
        budget: "$3,500",
        timeline: "6 weeks search campaign, ramping up final 2 weeks, post-event retargeting for future events",
        content_type: "Search ads with compelling headlines, Display banners featuring speaker lineup, Video ads with event highlights and testimonials",
        additional_info: "Target high-intent keywords, use remarketing for website visitors, A/B test ad creatives for optimal performance, geographic targeting for SF Bay Area",
        influencer_partnerships: []
      },
      email_campaign: {
        audience: "Newsletter subscribers, past event attendees, professional contacts, industry mailing lists",
        placement: "Direct email campaigns, Newsletter inclusions, Automated drip sequences, Partner email lists, Industry publication features",
        reach: "25,000 emails sent, 17,500 delivered, 12,250 opened, 3,675 clicked",
        reaction: "70% open rate, 30% click rate, 22% conversion rate, 485 email-driven registrations",
        budget: "$1,200",
        timeline: "8 weeks email sequence: announcement → early bird → speaker spotlights → agenda reveal → final call → post-event follow-up",
        content_type: "HTML newsletters with event highlights, Personalized speaker introductions, Interactive countdown timers, Early bird pricing announcements, Event agenda previews",
        additional_info: "Segment by industry and seniority level, A/B test subject lines and send times, include social sharing buttons, mobile-optimized templates",
        influencer_partnerships: []
      },
      whatsapp_campaign: {
        audience: "Professional networks, tech communities, startup founder groups, personal and professional contacts",
        placement: "WhatsApp Business groups, Tech community channels, Professional networking circles, Startup founder networks, Industry-specific groups",
        reach: "2,500 group members across 10 groups, 1,750 active participants, 1,200 direct messages",
        reaction: "45% message engagement rate, 38% response rate, 18% conversion rate, 315 WhatsApp-driven registrations",
        budget: "$600",
        timeline: "8 weeks community building and engagement, daily valuable content sharing, event announcements, live updates during event",
        content_type: "Event announcements with compelling visuals, Speaker introduction videos, Interactive polls and discussions, Behind-the-scenes content, Voice messages from organizers",
        additional_info: "Maintain 10 groups max 250 members each, assign dedicated community managers, share valuable content beyond just promotion, respect group guidelines and culture",
        influencer_partnerships: []
      },
      offline_publicity: {
        audience: "Local tech community, university students and faculty, co-working space members, professional associations",
        placement: "Tech conference centers, University campuses (Stanford, UC Berkeley, UCSF), Co-working spaces, Professional association offices, Tech company lobbies",
        reach: "45,000 physical location impressions, 2,500 flyers distributed, 85 partner locations, 15 university partnerships",
        reaction: "2.5% physical-to-digital conversion, 125 walk-in inquiries, 285 QR code scans, 95 phone inquiries",
        budget: "$1,800",
        timeline: "4 weeks physical material distribution, concentrated placement 2 weeks before event, day-of signage and directions",
        content_type: "Professional flyers with QR codes, Venue banners and directional signage, University bulletin board announcements, Co-working space digital displays",
        additional_info: "Partner with local tech meetups for cross-promotion, strategic placement in high-traffic tech areas, Moscone Center area visibility, professional design and materials",
        influencer_partnerships: []
      }
    }
  };

  const TEST_DATA_VIRTUAL = {
    event_name: 'Global Virtual Tech Summit 2025',
    event_type: 'virtual',
    event_language: 'en',
    event_description: 'Join us for an immersive 2-day virtual conference connecting tech professionals worldwide. Experience cutting-edge presentations, interactive workshops, and global networking opportunities from the comfort of your home or office. Features multi-timezone sessions, virtual expo halls, and 1-on-1 meeting capabilities.',
    city: '',
    target_countries: [
      { code: 'US', name: 'United States' },
      { code: 'CA', name: 'Canada' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'DE', name: 'Germany' },
      { code: 'FR', name: 'France' },
      { code: 'AU', name: 'Australia' },
      { code: 'JP', name: 'Japan' },
      { code: 'SG', name: 'Singapore' }
    ],
    number_of_days: 2,
    days: [
      {
        event_date: '2025-11-20',
        start_time: '09:00',
        end_time: '17:00',
        venue_name: '',
        venue_capacity: '',
        virtual_platform: {
          platform_name: 'Hopin',
          platform_link: 'https://app.hopin.com/events/global-virtual-tech-summit-2025',
          max_participants: '10000',
          features: ['Virtual venue', 'Networking', 'Expo booths', 'Multiple stages', 'Breakout rooms', 'Chat'],
          access_requirements: 'High-speed internet connection, updated browser (Chrome/Firefox/Safari), webcam and microphone for networking'
        },
        primary_sector: 'Cloud Computing & DevOps',
        speakers: `Dr. Jennifer Walsh - Cloud Architecture Director, AWS
Miguel Santos - DevOps Lead, Netflix
Prof. Alex Chen - Distributed Systems, Stanford
Sarah Johnson - Site Reliability Engineer, Google
David Kim - Container Technologies, Docker Inc.`,
        activities: `9:00 AM (UTC) - Global Welcome & Platform Orientation
9:30 AM - Keynote: "Cloud-Native Future"
10:30 AM - Multi-timezone Networking Sessions
12:00 PM - Virtual Expo Hall & Sponsor Booths
2:00 PM - DevOps Workshop (Interactive)
3:30 PM - Global Panel: Regional Tech Trends
5:00 PM - Virtual Happy Hour & Closing`,
        additional_info: `• Simultaneous sessions across 3 timezones
• 24-hour virtual expo hall access
• Recording available for 30 days
• Subtitles in 8 languages
• Mobile app available for iOS/Android
• Virtual networking rooms with AI matching`
      },
      {
        event_date: '2025-11-21',
        start_time: '08:00',
        end_time: '18:00',
        venue_name: '',
        venue_capacity: '',
        virtual_platform: {
          platform_name: 'Hopin',
          platform_link: 'https://app.hopin.com/events/global-virtual-tech-summit-2025',
          max_participants: '10000',
          features: ['Virtual venue', 'Networking', 'Expo booths', 'Multiple stages', 'Breakout rooms', 'Chat'],
          access_requirements: 'High-speed internet connection, updated browser (Chrome/Firefox/Safari), webcam and microphone for networking'
        },
        primary_sector: 'Cybersecurity & Data Privacy',
        speakers: `Dr. Rachel Brown - Cybersecurity Research, MIT
James Wilson - CISO, Microsoft Azure
Lisa Zhang - Privacy Engineering, Apple
Carlos Rodriguez - Security Architecture, Cloudflare
Dr. Ahmed Hassan - AI Security, IBM Research`,
        activities: `8:00 AM (UTC) - Early Bird Cybersecurity Breakfast Session
9:00 AM - Opening: "Zero Trust Architecture"
10:00 AM - Interactive Threat Modeling Workshop
11:30 AM - Global Security Challenges Panel
1:00 PM - Virtual Lunch & Learn Sessions
2:30 PM - Hands-on: Penetration Testing
4:00 PM - Data Privacy Compliance Workshop
5:30 PM - Global Wrap-up & Future Connections`,
        additional_info: `• Advanced cybersecurity simulations
• Secure virtual environment demos
• Industry certification opportunities
• Global regulatory compliance session
• 1-on-1 expert consultations available
• Post-event security resource library access`
      }
    ],
    country_marketing: [
      {
        country_code: 'US',
        country_name: 'United States',
        marketing_strategy: {
          facebook: {
            audience: "US tech professionals, software engineers, DevOps specialists, cybersecurity experts aged 25-50",
            budget: "$2,500",
            reach: "85,000 US impressions",
            timeline: "6 weeks with Pacific/Eastern timezone targeting"
          },
          linkedin: {
            audience: "US enterprise professionals, CTOs, engineering managers, tech leads",
            budget: "$3,000",
            reach: "120,000 professional impressions",
            timeline: "8 weeks B2B professional targeting"
          }
        }
      },
      {
        country_code: 'GB',
        country_name: 'United Kingdom',
        marketing_strategy: {
          linkedin: {
            audience: "UK tech professionals, fintech specialists, AI researchers, digital transformation leaders",
            budget: "$2,200",
            reach: "65,000 UK professional impressions",
            timeline: "6 weeks GMT timezone optimization"
          },
          x_twitter: {
            audience: "UK tech Twitter community, startups, scale-ups, university researchers",
            budget: "$1,200",
            reach: "35,000 UK tech impressions",
            timeline: "5 weeks UK tech community engagement"
          }
        }
      }
    ],
    marketing_strategy: {
      facebook: {
        audience: "Global tech professionals, remote workers, digital nomads, virtual event enthusiasts aged 24-50",
        placement: "Global Facebook ads, Virtual event groups, Remote work communities, International tech pages",
        reach: "200,000 global impressions, 12,000 engagements, 800 virtual event page visits",
        reaction: "4% CTR, 320 virtual registrations, 1,800 global shares",
        budget: "$4,200",
        timeline: "8 weeks global campaign, multi-timezone targeting",
        content_type: "Virtual event teasers, Global speaker introductions, Platform demo videos, Time zone countdown posts",
        additional_info: "Target 8 countries simultaneously, multi-language posts, virtual networking promotion",
        influencer_partnerships: []
      },
      linkedin: {
        audience: "International business professionals, remote team leaders, global enterprise decision-makers",
        placement: "LinkedIn global sponsored content, International professional networks, Remote work thought leaders",
        reach: "300,000 global professional impressions, 15,000 clicks, 4,500 connections",
        reaction: "3.2% CTR, 580 professional registrations, 85 enterprise team registrations",
        budget: "$5,500",
        timeline: "10 weeks global professional campaign, C-level executive outreach",
        content_type: "Global thought leadership, Remote work insights, International speaker spotlights, Virtual networking benefits",
        additional_info: "Target Fortune Global 500, international speaker networks, global time zone optimization",
        influencer_partnerships: []
      },
      youtube: {
        audience: "Global tech tutorial viewers, virtual learning enthusiasts, international professional development seekers",
        placement: "YouTube global pre-roll, International tech channels, Virtual event playlists, Educational content",
        reach: "85,000 global video views, 3,200 international subscribers, 850 comments",
        reaction: "7% global view-through rate, 180 YouTube registrations, 450 channel subscriptions",
        budget: "$3,200",
        timeline: "6 weeks global video content, international speaker interviews",
        content_type: "Global speaker introductions, Virtual platform tutorials, International tech trends, Multi-language subtitles",
        additional_info: "8-language subtitle support, global tech YouTuber partnerships, virtual event playlist",
        influencer_partnerships: []
      }
    }
  };

  const TEST_DATA_HYBRID = {
    event_name: 'Hybrid Innovation Conference 2025',
    event_type: 'hybrid',
    event_language: 'en',
    event_description: 'Experience the best of both worlds with our hybrid conference format. Join us in-person in New York City or participate virtually from anywhere in the world. Enjoy seamless integration between physical and digital attendees with interactive Q&As, virtual networking, and synchronized presentations.',
    city: 'New York City',
    target_countries: [
      { code: 'US', name: 'United States' },
      { code: 'CA', name: 'Canada' },
      { code: 'MX', name: 'Mexico' },
      { code: 'BR', name: 'Brazil' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'DE', name: 'Germany' },
      { code: 'IN', name: 'India' },
      { code: 'AU', name: 'Australia' }
    ],
    number_of_days: 2,
    days: [
      {
        event_date: '2025-09-15',
        start_time: '09:00',
        end_time: '18:00',
        venue_name: 'Jacob K. Javits Convention Center',
        venue_capacity: '1200',
        venue_address: '429 11th Avenue, New York, NY 10001',
        virtual_platform: {
          platform_name: 'Zoom Events + Remo',
          platform_link: 'https://events.zoom.us/hybrid-innovation-2025',
          max_participants: '5000',
          features: ['Hybrid integration', 'Virtual expo', 'Breakout rooms', 'Live streaming', 'Q&A integration', 'Networking lounges'],
          access_requirements: 'For virtual: stable internet, webcam recommended. For in-person: photo ID, health certification if required'
        },
        primary_sector: 'Financial Technology & Blockchain',
        speakers: `Dr. Sarah Martinez - Blockchain Lead, JPMorgan Chase (In-person)
Kevin O'Brien - DeFi Strategy, Coinbase (Virtual)
Prof. Michael Zhang - Digital Finance, Columbia University (In-person)
Lisa Thompson - FinTech Innovation, Stripe (Virtual)
Dr. Ahmed Al-Rashid - Central Bank Digital Currencies, IMF (Virtual)`,
        activities: `9:00 AM EST - Hybrid Welcome (In-person + Virtual)
9:30 AM - Keynote: "The Future of Money" (Hybrid Q&A)
10:45 AM - Interactive Workshop: DeFi Protocols (Both formats)
12:00 PM - Hybrid Networking Lunch (Virtual breakout rooms)
1:30 PM - Panel: "Regulation & Innovation" (Cross-platform discussion)
3:00 PM - Hands-on: Smart Contract Development (Hybrid labs)
4:30 PM - Virtual Expo Hall + Physical Booths
6:00 PM - Hybrid Happy Hour & Closing Ceremony`,
        additional_info: `• Seamless hybrid participation with live streaming
• Virtual attendees can join all Q&A sessions
• Physical networking mirrored in virtual rooms
• Mobile app connects in-person and virtual attendees
• Simultaneous translation for global audience
• Hybrid mentorship speed-dating sessions`
      },
      {
        event_date: '2025-09-16',
        start_time: '08:30',
        end_time: '17:30',
        venue_name: 'Jacob K. Javits Convention Center',
        venue_capacity: '1200',
        venue_address: '429 11th Avenue, New York, NY 10001',
        virtual_platform: {
          platform_name: 'Zoom Events + Remo',
          platform_link: 'https://events.zoom.us/hybrid-innovation-2025',
          max_participants: '5000',
          features: ['Hybrid integration', 'Virtual expo', 'Breakout rooms', 'Live streaming', 'Q&A integration', 'Networking lounges'],
          access_requirements: 'For virtual: stable internet, webcam recommended. For in-person: photo ID, health certification if required'
        },
        primary_sector: 'Sustainable Technology & Green Innovation',
        speakers: `Dr. Emma Green - Climate Tech, Tesla (In-person)
Carlos Silva - Renewable Energy AI, Google (Virtual)
Prof. Rachel Kim - Sustainable Computing, MIT (In-person)
James Wilson - Carbon Tracking, Microsoft (Virtual)
Dr. Maria Santos - Green Finance, World Bank (Virtual)`,
        activities: `8:30 AM EST - Early Bird Sustainability Session (Hybrid)
9:00 AM - Opening: "Tech for Climate Action" (Interactive keynote)
10:15 AM - Hybrid Workshop: Carbon Footprint Calculation
11:45 AM - Cross-platform Startup Pitch Competition
1:00 PM - Sustainable Lunch & Global Networking
2:30 PM - Panel: "Investment in Green Tech" (Hybrid format)
4:00 PM - Innovation Showcase (Physical + Virtual demos)
5:30 PM - Global Wrap-up & Future Collaboration Planning`,
        additional_info: `• Carbon-neutral event with offset programs
• Virtual attendees reduce travel emissions
• Hybrid innovation challenges with global teams
• Digital and physical product demonstrations
• Sustainability metrics tracked and reported
• Post-event collaboration platform access`
      }
    ],
    country_marketing: [
      {
        country_code: 'US',
        country_name: 'United States',
        marketing_strategy: {
          facebook: {
            audience: "US tech professionals with option for in-person or virtual attendance",
            budget: "$3,500",
            reach: "125,000 US impressions with venue proximity targeting",
            timeline: "8 weeks with NYC metro area emphasis for in-person attendees"
          },
          linkedin: {
            audience: "US business professionals, emphasizing hybrid work trends and flexibility",
            budget: "$4,200",
            reach: "180,000 professional impressions with hybrid benefits messaging",
            timeline: "10 weeks with corporate team registration incentives"
          }
        }
      },
      {
        country_code: 'GB',
        country_name: 'United Kingdom',
        marketing_strategy: {
          linkedin: {
            audience: "UK professionals interested in virtual participation and global networking",
            budget: "$2,800",
            reach: "85,000 UK professional impressions with virtual convenience messaging",
            timeline: "8 weeks GMT optimization for virtual attendance"
          }
        }
      }
    ],
    marketing_strategy: {
      facebook: {
        audience: "Hybrid event enthusiasts, tech professionals seeking flexible attendance, innovation conference attendees",
        placement: "Facebook hybrid event groups, Flexible work communities, Innovation-focused pages, NYC event promotion",
        reach: "180,000 hybrid audience impressions, 14,000 engagements, 900 event page visits",
        reaction: "4.5% CTR, 425 hybrid registrations (60% virtual, 40% in-person), 2,100 format inquiries",
        budget: "$4,800",
        timeline: "10 weeks campaign with format flexibility emphasis, venue vs virtual choice promotion",
        content_type: "Hybrid experience videos, Format comparison posts, Venue virtual tours, Attendance option explanations",
        additional_info: "Promote attendance flexibility, NYC venue highlights for locals, virtual convenience for global audience",
        influencer_partnerships: []
      },
      linkedin: {
        audience: "Corporate teams considering hybrid attendance, innovation leaders, flexible work advocates",
        placement: "LinkedIn hybrid work thought leadership, Corporate event planning, Team attendance packages",
        reach: "350,000 professional impressions, 18,000 clicks, 5,200 corporate inquiries",
        reaction: "3.8% CTR, 720 professional registrations, 125 corporate team packages",
        budget: "$6,200",
        timeline: "12 weeks B2B campaign with corporate hybrid packages, team attendance incentives",
        content_type: "Hybrid work trend articles, Corporate team benefits, Flexible attendance ROI, Innovation leadership content",
        additional_info: "Target enterprise companies exploring hybrid events, promote team bonding across formats",
        influencer_partnerships: []
      },
      youtube: {
        audience: "Global tech community interested in hybrid participation options",
        placement: "YouTube hybrid work content, Tech channels, Virtual event tutorials",
        reach: "95,000 hybrid-focused video views, 4,200 subscriptions, 1,200 comments",
        reaction: "6.8% engagement rate, 280 YouTube registrations, 520 channel interactions",
        budget: "$3,800",
        timeline: "8 weeks video content showcasing hybrid experience benefits",
        content_type: "Hybrid event experience videos, Platform tutorials, Speaker accessibility content",
        additional_info: "Showcase both in-person and virtual experiences, platform demo videos",
        influencer_partnerships: []
      }
    }
  };

const onSubmit = async (formData) => {
  try {
    // Manual validation with detailed error messages
    const errors = [];
    
    // Basic field validation
    if (!formData.event_name?.trim()) {
      errors.push('Event name is required');
    }
    if (!formData.event_description?.trim()) {
      errors.push('Event description is required');
    }
    if (!formData.city?.trim()) {
      errors.push('City selection is required');
    }
    if (!formData.number_of_days || formData.number_of_days < 1) {
      errors.push('Number of days must be at least 1');
    }
    
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
        if (day.venue_capacity && (isNaN(day.venue_capacity) || parseInt(day.venue_capacity) <= 0)) {
          errors.push(`Day ${index + 1}: Venue capacity must be a positive number`);
        }
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
      incompleteDays.forEach(({ dayNumber, missing }) => {
        errors.push(`Day ${dayNumber} missing: ${missing.join(', ')}`);
      });
    }
    
    // Location data validation
    if (!tabs[activeTab].locationData) {
      errors.push('Please select a location on the map');
    }
    
    // If there are validation errors, show them and return
    if (errors.length > 0) {
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

  const currentTab = tabs[activeTab];  return (
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
              startIcon={<Iconify icon="eva:play-circle-outline" />}
              onClick={() => handleLoadTestData('in-person')}
              color="success"
              size="small"
            >
              Test In-Person
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:monitor-outline" />}
              onClick={() => handleLoadTestData('virtual')}
              color="info"
              size="small"
            >
              Test Virtual
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:layers-outline" />}
              onClick={() => handleLoadTestData('hybrid')}
              color="warning"
              size="small"
            >
              Test Hybrid
            </Button>
            
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
                  <Grid container spacing={3}>
                    {/* Main Analysis Section */}
                    <Grid size={12}>
                      <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.neutral' }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                          📊 Event Analysis & Comprehensive Predictions
                        </Typography>
                        
                        {/* Analysis Text */}
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body1" sx={{ 
                            lineHeight: 1.7, 
                            mb: 2,
                            p: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}>
                            {currentTab.result.data.analysis}
                          </Typography>
                        </Box>

                        {/* Main Statistics Cards */}
                        <Grid container spacing={3} sx={{ mb: 3 }}>
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
                                {currentTab.result.data.registration_expected?.toLocaleString() || 'N/A'}
                              </Typography>
                              <Typography variant="h6" sx={{ 
                                color: 'info.darker',
                                mb: 1 
                              }}>
                                Expected Registrations
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'info.dark' }}>
                                Projected total registrations
                              </Typography>
                            </Paper>
                          </Grid>

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
                                {currentTab.result.data.attendance_expected?.toLocaleString() || 'N/A'}
                              </Typography>
                              <Typography variant="h6" sx={{ 
                                color: 'success.darker',
                                mb: 1 
                              }}>
                                Expected Attendance
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'success.dark' }}>
                                Predicted actual attendees
                              </Typography>
                            </Paper>
                          </Grid>

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
                                {currentTab.result.data.confidence_level || 'N/A'}%
                              </Typography>
                              <Typography variant="h6" sx={{ 
                                color: 'warning.darker',
                                mb: 1 
                              }}>
                                Confidence Level
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'warning.dark' }}>
                                Prediction accuracy score
                              </Typography>
                            </Paper>
                          </Grid>

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
                                {currentTab.result.data.attendance_expected && currentTab.result.data.registration_expected ? 
                                  Math.round((currentTab.result.data.attendance_expected / currentTab.result.data.registration_expected) * 100) : 'N/A'}%
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
                            {currentTab.result.data.data_visualizations.audience_segmentation && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    🎯 {currentTab.result.data.data_visualizations.audience_segmentation.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {currentTab.result.data.data_visualizations.audience_segmentation.data.map((item, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box 
                                          sx={{ 
                                            width: 16, 
                                            height: 16, 
                                            bgcolor: item.color, 
                                            borderRadius: '50%' 
                                          }}
                                        />
                                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                          {item.label}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                          {item.value}%
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </Paper>
                              </Grid>
                            )}

                            {/* Registration Timeline */}
                            {currentTab.result.data.data_visualizations.registration_trend && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    📈 {currentTab.result.data.data_visualizations.registration_trend.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {currentTab.result.data.data_visualizations.registration_trend.data.categories.map((week, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body2" sx={{ minWidth: 60 }}>
                                          {week}:
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                          <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                            {currentTab.result.data.data_visualizations.registration_trend.data.series[0].data[index]}
                                          </Typography>
                                          {currentTab.result.data.data_visualizations.registration_trend.data?.series[1]?.data[index] && (
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                              / {currentTab.result.data.data_visualizations.registration_trend.data.series[1].data[index]} (conservative)
                                            </Typography>
                                          )}
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                </Paper>
                              </Grid>
                            )}

                            {/* Geographic Distribution */}
                            {currentTab.result.data.data_visualizations.geographic_distribution && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    🌎 {currentTab.result.data.data_visualizations.geographic_distribution.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {currentTab.result.data.data_visualizations.geographic_distribution.data.categories.map((region, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body2" sx={{ minWidth: 100 }}>
                                          {region}:
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
                                            bgcolor: '#2e7d32', 
                                            height: '100%', 
                                            width: `${(currentTab.result.data.data_visualizations.geographic_distribution.data.series[0].data[index] / 650) * 100}%`,
                                            borderRadius: 1 
                                          }} />
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 50 }}>
                                          {currentTab.result.data.data_visualizations.geographic_distribution.data.series[0].data[index]}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </Paper>
                              </Grid>
                            )}

                            {/* Daily Attendance Forecast */}
                            {currentTab.result.data.data_visualizations.daily_attendance_forecast && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    📅 {currentTab.result.data.data_visualizations.daily_attendance_forecast.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {currentTab.result.data.data_visualizations.daily_attendance_forecast.data.categories.map((day, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body2" sx={{ minWidth: 50 }}>
                                          {day}:
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 1 }}>
                                          <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 'bold', minWidth: 60 }}>
                                            {currentTab.result.data.data_visualizations.daily_attendance_forecast.data.series[0].data[index]} attendees
                                          </Typography>
                                          {currentTab.result.data.data_visualizations.daily_attendance_forecast.data.series[1]?.data[index] && (
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                              (Capacity: {currentTab.result.data.data_visualizations.daily_attendance_forecast.data.series[1].data[index] })
                                            </Typography>
                                          )}
                                          {currentTab.result.data.data_visualizations.daily_attendance_forecast.data.series[1]?.data[index] && (
                                            <Typography variant="caption" sx={{ 
                                              color: 'success.main', 
                                              fontWeight: 'bold',
                                              bgcolor: 'success.lighter',
                                              px: 1,
                                              borderRadius: 1
                                            }}>
                                              {Math.round((currentTab.result.data.data_visualizations.daily_attendance_forecast.data.series[0].data[index] / 
                                              currentTab.result.data.data_visualizations.daily_attendance_forecast.data.series[1].data[index]) * 100)}% utilized
                                            </Typography>
                                          )}
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                </Paper>
                              </Grid>
                            )}

                            {/* Enhanced Marketing Channel Effectiveness */}
                            {currentTab.result.data.data_visualizations.marketing_effectiveness && (
                              <Grid size={{ xs: 12, md: 12 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    📊 Enhanced Marketing Channel Performance
                                  </Typography>
                                  
                                  <Grid container spacing={2}>
                                    {currentTab.result.data.data_visualizations.marketing_effectiveness.data.categories.map((channel, index) => {
                                      const totalRegistrations = currentTab.result.data.data_visualizations.marketing_effectiveness.data.series.reduce((sum, series) => sum + series.data[index], 0);
                                      const maxTotal = Math.max(...currentTab.result.data.data_visualizations.marketing_effectiveness.data.categories.map((_, i) => 
                                        currentTab.result.data.data_visualizations.marketing_effectiveness.data.series.reduce((sum, series) => sum + series.data[i], 0)
                                      ));
                                      
                                      return (
                                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                                          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center' }}>
                                              {channel}
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                              {currentTab.result.data.data_visualizations.marketing_effectiveness.data.series.map((series, seriesIndex) => (
                                                <Box key={seriesIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                  <Box sx={{ 
                                                    width: 12, 
                                                    height: 12, 
                                                    bgcolor: series.color, 
                                                    borderRadius: 1 
                                                  }} />
                                                  <Typography variant="caption" sx={{ minWidth: 80, fontSize: '0.7rem' }}>
                                                    {series.name.replace(' (Week ', ' (W').replace(')', ')')}:
                                                  </Typography>
                                                  <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                                                    {series.data[index]}
                                                  </Typography>
                                                </Box>
                                              ))}
                                              <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                  Total: {totalRegistrations}
                                                </Typography>
                                                <Box sx={{ 
                                                  mt: 1, 
                                                  height: 6, 
                                                  bgcolor: 'grey.200', 
                                                  borderRadius: 3,
                                                  overflow: 'hidden'
                                                }}>
                                                  <Box sx={{ 
                                                    height: '100%', 
                                                    bgcolor: 'primary.main', 
                                                    width: `${(totalRegistrations / maxTotal) * 100}%`,
                                                    borderRadius: 3
                                                  }} />
                                                </Box>
                                              </Box>
                                            </Box>
                                          </Paper>
                                        </Grid>
                                      );
                                    })}
                                  </Grid>
                                </Paper>
                              </Grid>
                            )}

                            {/* Influencer Marketing ROI Analysis */}
                            <Grid size={{ xs: 12, md: 12 }}>
                              <Paper variant="outlined" sx={{ p: 3, bgcolor: 'purple.50' }}>
                                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: 'purple.main' }}>
                                  🤝 Influencer Marketing Analysis
                                </Typography>
                                
                                <Grid container spacing={3}>
                                  {/* Influencer Reach Distribution */}
                                  <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                      <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
                                        📈 Total Influencer Reach by Platform
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                          <Box sx={{ width: 16, height: 16, bgcolor: '#1877F2', borderRadius: '50%' }} />
                                          <Typography variant="body2" sx={{ flexGrow: 1 }}>Facebook</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>430K followers</Typography>
                                          <Typography variant="caption" sx={{ color: 'success.main' }}>260 registrations</Typography>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                          <Box sx={{ width: 16, height: 16, bgcolor: '#E4405F', borderRadius: '50%' }} />
                                          <Typography variant="body2" sx={{ flexGrow: 1 }}>Instagram</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>750K followers</Typography>
                                          <Typography variant="caption" sx={{ color: 'success.main' }}>520 registrations</Typography>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                          <Box sx={{ width: 16, height: 16, bgcolor: '#0A66C2', borderRadius: '50%' }} />
                                          <Typography variant="body2" sx={{ flexGrow: 1 }}>LinkedIn</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>215K followers</Typography>
                                          <Typography variant="caption" sx={{ color: 'success.main' }}>195 registrations</Typography>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                          <Box sx={{ width: 16, height: 16, bgcolor: '#1DA1F2', borderRadius: '50%' }} />
                                          <Typography variant="body2" sx={{ flexGrow: 1 }}>X (Twitter)</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>400K followers</Typography>
                                          <Typography variant="caption" sx={{ color: 'success.main' }}>300 registrations</Typography>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                          <Box sx={{ width: 16, height: 16, bgcolor: '#FF0000', borderRadius: '50%' }} />
                                          <Typography variant="body2" sx={{ flexGrow: 1 }}>YouTube</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>1.08M subscribers</Typography>
                                          <Typography variant="caption" sx={{ color: 'success.main' }}>648 registrations</Typography>
                                        </Box>
                                        
                                        <Box sx={{ mt: 2, pt: 2, borderTop: '2px solid', borderColor: 'primary.main' }}>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6" sx={{ color: 'primary.main' }}>Total Impact:</Typography>
                                            <Box sx={{ textAlign: 'right' }}>
                                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                2.875M reach
                                              </Typography>
                                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                                1,923 registrations
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </Box>
                                      </Box>
                                    </Paper>
                                  </Grid>

                                  {/* Influencer Engagement Rates */}
                                  <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                      <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
                                        💫 Influencer Engagement Performance
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box>
                                          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                                            Top Performing Influencers
                                          </Typography>
                                          
                                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'success.lighter', borderRadius: 1 }}>
                                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>TechExplainedTV (YouTube)</Typography>
                                              <Typography variant="caption" sx={{ color: 'success.main' }}>270 registrations</Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'info.lighter', borderRadius: 1 }}>
                                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>CodeWithEmily (Instagram)</Typography>
                                              <Typography variant="caption" sx={{ color: 'info.main' }}>200 registrations</Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'warning.lighter', borderRadius: 1 }}>
                                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>@AINewsNow (Twitter)</Typography>
                                              <Typography variant="caption" sx={{ color: 'warning.main' }}>165 registrations</Typography>
                                            </Box>
                                          </Box>
                                        </Box>
                                        
                                        <Box sx={{ mt: 2 }}>
                                          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', color: 'secondary.main' }}>
                                            Platform ROI Comparison
                                          </Typography>
                                          
                                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                              <Typography variant="caption" sx={{ minWidth: 70 }}>YouTube:</Typography>
                                              <Box sx={{ flexGrow: 1, bgcolor: 'grey.200', height: 8, borderRadius: 4 }}>
                                                <Box sx={{ width: '100%', bgcolor: 'error.main', height: '100%', borderRadius: 4 }} />
                                              </Box>
                                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                                60% ROI
                                              </Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                              <Typography variant="caption" sx={{ minWidth: 70 }}>Instagram:</Typography>
                                              <Box sx={{ flexGrow: 1, bgcolor: 'grey.200', height: 8, borderRadius: 4 }}>
                                                <Box sx={{ width: '85%', bgcolor: 'warning.main', height: '100%', borderRadius: 4 }} />
                                              </Box>
                                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                                51% ROI
                                              </Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                              <Typography variant="caption" sx={{ minWidth: 70 }}>Twitter:</Typography>
                                              <Box sx={{ flexGrow: 1, bgcolor: 'grey.200', height: 8, borderRadius: 4 }}>
                                                <Box sx={{ width: '75%', bgcolor: 'info.main', height: '100%', borderRadius: 4 }} />
                                              </Box>
                                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                                                45% ROI
                                              </Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                              <Typography variant="caption" sx={{ minWidth: 70 }}>Facebook:</Typography>
                                              <Box sx={{ flexGrow: 1, bgcolor: 'grey.200', height: 8, borderRadius: 4 }}>
                                                <Box sx={{ width: '65%', bgcolor: 'primary.main', height: '100%', borderRadius: 4 }} />
                                              </Box>
                                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                39% ROI
                                              </Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                              <Typography variant="caption" sx={{ minWidth: 70 }}>LinkedIn:</Typography>
                                              <Box sx={{ flexGrow: 1, bgcolor: 'grey.200', height: 8, borderRadius: 4 }}>
                                                <Box sx={{ width: '55%', bgcolor: 'success.main', height: '100%', borderRadius: 4 }} />
                                              </Box>
                                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                                33% ROI
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </Box>
                                      </Box>
                                    </Paper>
                                  </Grid>
                                </Grid>
                              </Paper>
                            </Grid>

                            {/* Social Media vs Traditional Marketing Comparison */}
                            <Grid size={{ xs: 12, md: 12 }}>
                              <Paper variant="outlined" sx={{ p: 3, bgcolor: 'gradient.main' }}>
                                <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
                                  ⚖️ Marketing Channel Performance Comparison
                                </Typography>
                                
                                <Grid container spacing={2}>
                                  <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.lighter', border: '2px solid success.main' }}>
                                      <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: 'success.darker' }}>
                                        🌐 Digital Marketing
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                          <Typography variant="body2">Social Media Channels:</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                            1,923 registrations
                                          </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                          <Typography variant="body2">Google Ads:</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                            150 registrations
                                          </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                          <Typography variant="body2">Email Campaigns:</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                            280 registrations
                                          </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                          <Typography variant="body2">WhatsApp Campaigns:</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                            95 registrations
                                          </Typography>
                                        </Box>
                                        <Box sx={{ mt: 1, pt: 1, borderTop: '2px solid', borderColor: 'success.main', display: 'flex', justifyContent: 'space-between' }}>
                                          <Typography variant="h6" sx={{ color: 'success.darker' }}>Digital Total:</Typography>
                                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                            2,448 registrations
                                          </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ textAlign: 'center', color: 'success.darker', mt: 1 }}>
                                          Average Cost per Registration: $4.50 | ROI: 320%
                                        </Typography>
                                      </Box>
                                    </Paper>
                                  </Grid>
                                  
                                  <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'warning.lighter', border: '2px solid warning.main' }}>
                                      <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: 'warning.darker' }}>
                                        📰 Traditional Marketing
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                          <Typography variant="body2">Offline Publicity:</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                            52 registrations
                                          </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                          <Typography variant="body2">Print Media:</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                            18 registrations
                                          </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                          <Typography variant="body2">Radio Sponsorship:</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                            8 registrations
                                          </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                          <Typography variant="body2">Direct Mail:</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                            12 registrations
                                          </Typography>
                                        </Box>
                                        <Box sx={{ mt: 1, pt: 1, borderTop: '2px solid', borderColor: 'warning.main', display: 'flex', justifyContent: 'space-between' }}>
                                          <Typography variant="h6" sx={{ color: 'warning.darker' }}>Traditional Total:</Typography>
                                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                            90 registrations
                                          </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ textAlign: 'center', color: 'warning.darker', mt: 1 }}>
                                          Average Cost per Registration: $22.50 | ROI: 85%
                                        </Typography>
                                      </Box>
                                    </Paper>
                                  </Grid>
                                </Grid>
                                
                                <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                                  <Typography variant="h5" sx={{ textAlign: 'center', color: 'primary.main', mb: 1 }}>
                                    📊 Overall Marketing Performance
                                  </Typography>
                                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                        2,538
                                      </Typography>
                                      <Typography variant="body1" sx={{ color: 'primary.darker' }}>
                                        Total Registrations
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                        96.4%
                                      </Typography>
                                      <Typography variant="body1" sx={{ color: 'primary.darker' }}>
                                        Digital Conversion
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                        $6.75
                                      </Typography>
                                      <Typography variant="body1" sx={{ color: 'primary.darker' }}>
                                        Avg Cost/Registration
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              </Paper>
                            </Grid>

                            {/* Marketing Timeline & Campaign Effectiveness */}
                            <Grid size={{ xs: 12, md: 12 }}>
                              <Paper variant="outlined" sx={{ p: 3, bgcolor: 'secondary.lighter' }}>
                                <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: 'secondary.main' }}>
                                  📅 Marketing Campaign Timeline Analysis
                                </Typography>
                                
                                <Grid container spacing={3}>
                                  <Grid size={{ xs: 12, md: 8 }}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                                        📈 Weekly Registration Trends by Channel
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, weekIndex) => (
                                          <Box key={week} sx={{ p: 2, bgcolor: weekIndex % 2 === 0 ? 'grey.50' : 'white', borderRadius: 1 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                                              {week}
                                            </Typography>
                                            
                                            <Grid container spacing={1}>
                                              <Grid size={{ xs: 6, md: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                  <Box sx={{ width: 8, height: 8, bgcolor: '#1877F2', borderRadius: '50%' }} />
                                                  <Typography variant="caption">Facebook: {[65, 72, 68, 55][weekIndex]}</Typography>
                                                </Box>
                                              </Grid>
                                              <Grid size={{ xs: 6, md: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                  <Box sx={{ width: 8, height: 8, bgcolor: '#E4405F', borderRadius: '50%' }} />
                                                  <Typography variant="caption">Instagram: {[130, 145, 135, 110][weekIndex]}</Typography>
                                                </Box>
                                              </Grid>
                                              <Grid size={{ xs: 6, md: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                  <Box sx={{ width: 8, height: 8, bgcolor: '#1DA1F2', borderRadius: '50%' }} />
                                                  <Typography variant="caption">Twitter: {[75, 82, 78, 65][weekIndex]}</Typography>
                                                </Box>
                                              </Grid>
                                              <Grid size={{ xs: 6, md: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                  <Box sx={{ width: 8, height: 8, bgcolor: '#FF0000', borderRadius: '50%' }} />
                                                  <Typography variant="caption">YouTube: {[162, 180, 171, 135][weekIndex]}</Typography>
                                                </Box>
                                              </Grid>
                                            </Grid>
                                            
                                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                Week Total: {[432, 479, 452, 365][weekIndex]}
                                              </Typography>
                                              <Typography variant="caption" sx={{ 
                                                color: weekIndex === 1 ? 'success.main' : weekIndex === 3 ? 'error.main' : 'primary.main' 
                                              }}>
                                                {weekIndex === 1 ? '+10.9%' : weekIndex === 3 ? '-19.2%' : weekIndex === 2 ? '-5.6%' : 'baseline'}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        ))}
                                      </Box>
                                    </Paper>
                                  </Grid>
                                  
                                  <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                                        🎯 Campaign Success Metrics
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
                                            Best Performing Week
                                          </Typography>
                                          <Typography variant="h5" sx={{ color: 'success.main' }}>Week 2</Typography>
                                          <Typography variant="caption">479 registrations (+10.9%)</Typography>
                                        </Box>
                                        
                                        <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'info.main', mb: 1 }}>
                                            Most Consistent Channel
                                          </Typography>
                                          <Typography variant="h6" sx={{ color: 'info.main' }}>Instagram</Typography>
                                          <Typography variant="caption">±7% variance across weeks</Typography>
                                        </Box>
                                        
                                        <Box sx={{ p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main', mb: 1 }}>
                                            Growth Opportunity
                                          </Typography>
                                          <Typography variant="h6" sx={{ color: 'warning.main' }}>Facebook</Typography>
                                          <Typography variant="caption">Showed decline in Week 4</Typography>
                                        </Box>
                                        
                                        <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main', mb: 1 }}>
                                            Peak Engagement Day
                                          </Typography>
                                          <Typography variant="h6" sx={{ color: 'error.main' }}>Wednesday</Typography>
                                          <Typography variant="caption">35% higher than average</Typography>
                                        </Box>
                                      </Box>
                                    </Paper>
                                  </Grid>
                                </Grid>
                              </Paper>
                            </Grid>

                            {/* Advanced Influencer Analytics */}
                            <Grid size={{ xs: 12, md: 12 }}>
                              <Paper variant="outlined" sx={{ p: 3, bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: 'black' }}>
                                  🌟 Advanced Influencer Performance Analytics
                                </Typography>
                                
                                <Grid container spacing={3}>
                                  <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                                        💎 Influencer Tier Performance
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ p: 2, bgcolor: 'gold', color: 'white', borderRadius: 2 }}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            🥇 Mega Influencers (1M+ followers)
                                          </Typography>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                              <Typography variant="body2">Count: 3 influencers</Typography>
                                              <Typography variant="body2">Total Reach: 1.8M</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>540</Typography>
                                              <Typography variant="caption">registrations</Typography>
                                            </Box>
                                          </Box>
                                        </Box>
                                        
                                        <Box sx={{ p: 2, bgcolor: 'silver', color: 'white', borderRadius: 2 }}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            🥈 Macro Influencers (100K-1M followers)
                                          </Typography>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                              <Typography variant="body2">Count: 5 influencers</Typography>
                                              <Typography variant="body2">Total Reach: 875K</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>945</Typography>
                                              <Typography variant="caption">registrations</Typography>
                                            </Box>
                                          </Box>
                                        </Box>
                                        
                                        <Box sx={{ p: 2, bgcolor: '#CD7F32', color: 'white', borderRadius: 2 }}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            🥉 Micro Influencers (10K-100K followers)
                                          </Typography>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                              <Typography variant="body2">Count: 4 influencers</Typography>
                                              <Typography variant="body2">Total Reach: 200K</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>438</Typography>
                                              <Typography variant="caption">registrations</Typography>
                                            </Box>
                                          </Box>
                                        </Box>
                                      </Box>
                                    </Paper>
                                  </Grid>
                                  
                                  <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                                        📊 Engagement Rate vs Conversion Analysis
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {[
                                          { name: 'TechExplainedTV', platform: 'YouTube', engagement: 4.2, conversion: 2.1, registrations: 270 },
                                          { name: 'CodeWithEmily', platform: 'Instagram', engagement: 6.8, conversion: 1.8, registrations: 200 },
                                          { name: 'AINewsNow', platform: 'Twitter', engagement: 3.1, conversion: 2.4, registrations: 165 },
                                          { name: 'TechInnovator', platform: 'LinkedIn', engagement: 2.9, conversion: 3.2, registrations: 125 },
                                          { name: 'DataScienceDaily', platform: 'Instagram', engagement: 5.4, conversion: 1.6, registrations: 180 }
                                        ].map((influencer, index) => (
                                          <Box key={index} sx={{ 
                                            p: 2, 
                                            border: '1px solid', 
                                            borderColor: 'divider', 
                                            borderRadius: 1,
                                            bgcolor: index % 2 === 0 ? 'grey.50' : 'white'
                                          }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                {influencer.name}
                                              </Typography>
                                              <Typography variant="caption" sx={{ 
                                                px: 1, 
                                                py: 0.5, 
                                                bgcolor: influencer.platform === 'YouTube' ? '#FF0000' : 
                                                         influencer.platform === 'Instagram' ? '#E4405F' :
                                                         influencer.platform === 'Twitter' ? '#1DA1F2' : '#0A66C2',
                                                color: 'white',
                                                borderRadius: 1
                                              }}>
                                                {influencer.platform}
                                              </Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
                                              <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                  Engagement Rate
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                  <Box sx={{ 
                                                    width: '100%', 
                                                    height: 6, 
                                                    bgcolor: 'grey.200', 
                                                    borderRadius: 3 
                                                  }}>
                                                    <Box sx={{ 
                                                      width: `${(influencer.engagement / 7) * 100}%`, 
                                                      height: '100%', 
                                                      bgcolor: 'primary.main', 
                                                      borderRadius: 3 
                                                    }} />
                                                  </Box>
                                                  <Typography variant="caption" sx={{ minWidth: 35 }}>
                                                    {influencer.engagement}%
                                                  </Typography>
                                                </Box>
                                              </Box>
                                              
                                              <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                  Conversion Rate
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                  <Box sx={{ 
                                                    width: '100%', 
                                                    height: 6, 
                                                    bgcolor: 'grey.200', 
                                                    borderRadius: 3 
                                                  }}>
                                                    <Box sx={{ 
                                                      width: `${(influencer.conversion / 4) * 100}%`, 
                                                      height: '100%', 
                                                      bgcolor: 'success.main', 
                                                      borderRadius: 3 
                                                    }} />
                                                  </Box>
                                                  <Typography variant="caption" sx={{ minWidth: 35 }}>
                                                    {influencer.conversion}%
                                                  </Typography>
                                                </Box>
                                              </Box>
                                            </Box>
                                            
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                                              {influencer.registrations} registrations
                                            </Typography>
                                          </Box>
                                        ))}
                                      </Box>
                                    </Paper>
                                  </Grid>
                                </Grid>
                              </Paper>
                            </Grid>

                            {/* Marketing Budget Allocation & ROI Heatmap */}
                            <Grid size={{ xs: 12, md: 12 }}>
                              <Paper variant="outlined" sx={{ p: 3, bgcolor: 'info.lighter' }}>
                                <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: 'info.main' }}>
                                  💰 Marketing Budget Allocation & ROI Heatmap
                                </Typography>
                                
                                <Grid container spacing={3}>
                                  <Grid size={{ xs: 12, md: 8 }}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                                        🎯 Channel Performance Heatmap
                                      </Typography>
                                      
                                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, mb: 2 }}>
                                        {[
                                          { channel: 'YouTube', budget: '$8,000', roi: 60, registrations: 648 },
                                          { channel: 'Instagram', budget: '$6,500', roi: 51, registrations: 520 },
                                          { channel: 'Twitter', budget: '$4,200', roi: 45, registrations: 300 },
                                          { channel: 'Facebook', budget: '$5,000', roi: 39, registrations: 260 },
                                          { channel: 'LinkedIn', budget: '$3,800', roi: 33, registrations: 195 },
                                          { channel: 'Offline', budget: '$2,800', roi: 12, registrations: 52 }
                                        ].map((item, index) => (
                                          <Box key={index} sx={{ 
                                            p: 2, 
                                            bgcolor: item.roi > 50 ? 'success.main' : 
                                                    item.roi > 35 ? 'warning.main' : 
                                                    item.roi > 20 ? 'info.main' : 'error.main',
                                            color: 'white',
                                            borderRadius: 1,
                                            textAlign: 'center',
                                            opacity: item.roi > 50 ? 1 : item.roi > 35 ? 0.8 : item.roi > 20 ? 0.6 : 0.4
                                          }}>
                                            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                                              {item.channel}
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                              {item.roi}%
                                            </Typography>
                                            <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem' }}>
                                              {item.budget}
                                            </Typography>
                                            <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem' }}>
                                              {item.registrations} reg
                                            </Typography>
                                          </Box>
                                        ))}
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Box sx={{ width: 16, height: 16, bgcolor: 'success.main', borderRadius: 1 }} />
                                          <Typography variant="caption">Excellent ROI (50%+)</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Box sx={{ width: 16, height: 16, bgcolor: 'warning.main', borderRadius: 1, opacity: 0.8 }} />
                                          <Typography variant="caption">Good ROI (35-50%)</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Box sx={{ width: 16, height: 16, bgcolor: 'info.main', borderRadius: 1, opacity: 0.6 }} />
                                          <Typography variant="caption">Fair ROI (20-35%)</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Box sx={{ width: 16, height: 16, bgcolor: 'error.main', borderRadius: 1, opacity: 0.4 }} />
                                          <Typography variant="caption">Poor ROI (less than 20%)</Typography>
                                        </Box>
                                      </Box>
                                    </Paper>
                                  </Grid>
                                  
                                  <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                                        💡 Budget Optimization Recommendations
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ p: 2, bgcolor: 'success.lighter', borderLeft: '4px solid', borderColor: 'success.main' }}>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
                                            ✅ Scale Up Investment
                                          </Typography>
                                          <Typography variant="caption">
                                            Increase YouTube budget by 25% - highest ROI at 60%
                                          </Typography>
                                        </Box>
                                        
                                        <Box sx={{ p: 2, bgcolor: 'warning.lighter', borderLeft: '4px solid', borderColor: 'warning.main' }}>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main', mb: 1 }}>
                                            ⚡ Optimize Strategy
                                          </Typography>
                                          <Typography variant="caption">
                                            LinkedIn shows potential - test premium targeting
                                          </Typography>
                                        </Box>
                                        
                                        <Box sx={{ p: 2, bgcolor: 'error.lighter', borderLeft: '4px solid', borderColor: 'error.main' }}>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main', mb: 1 }}>
                                            ❌ Reduce Allocation
                                          </Typography>
                                          <Typography variant="caption">
                                            Reallocate offline budget to digital channels
                                          </Typography>
                                        </Box>
                                        
                                        <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', textAlign: 'center' }}>
                                            Projected Improvement
                                          </Typography>
                                          <Typography variant="h5" sx={{ color: 'primary.main', textAlign: 'center', mt: 1 }}>
                                            +18% ROI
                                          </Typography>
                                          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
                                            With recommended changes
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Paper>
                                  </Grid>
                                </Grid>
                              </Paper>
                            </Grid>
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
                              <Grid size={{ xs: 12, md: 4 }}>
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
                                  {Object.entries(currentTab.result.data.actionable_metrics.conversion_rates).map(([key, value], index) => (
                                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                      <Typography variant="body2" sx={{ color: 'primary.darker', textTransform: 'capitalize' }}>
                                        {key.replace(/_/g, ' ')}:
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.darker' }}>
                                        {value}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Paper>
                              </Grid>
                            )}

                            {/* Revenue Projections */}
                            {currentTab.result.data.actionable_metrics.revenue_projections && (
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
                                  {Object.entries(currentTab.result.data.actionable_metrics.revenue_projections).map(([key, value], index) => (
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

                            {/* Capacity Utilization */}
                            {currentTab.result.data.actionable_metrics.capacity_utilization && (
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
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Data Summary */}
                    <Grid size={12}>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                          <strong>Analysis Generated:</strong> {new Date().toLocaleString()} | 
                          <strong> Confidence Score:</strong> {currentTab.result.data.confidence_level || 'N/A'}% |
                          <strong> Data Points Analyzed:</strong> {currentTab.result.data.data_visualizations ? Object.keys(currentTab.result.data.data_visualizations).length : 0}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
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
                    {console.log('Saved Tabs:', savedTabs) /* Debugging line */}
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

