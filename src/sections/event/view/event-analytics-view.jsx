import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useEventAnalytics } from '../hooks/use-event-analytics';
import { EventAnalyticsDashboard } from '../event-analytics-dashboard';

// ----------------------------------------------------------------------

export default function EventAnalyticsPage() {
  const { analytics, loading, error, analyzeEvent, simulateAnalytics, validateEventData, resetAnalytics } = useEventAnalytics();
  
  const [eventForm, setEventForm] = useState({
    name: 'Global AI & Innovation Summit 2025',
    description: 'A comprehensive 3-day conference bringing together AI researchers, tech entrepreneurs, and industry leaders to explore cutting-edge developments in artificial intelligence, machine learning, and digital transformation. Features hands-on workshops, networking sessions, and startup showcases.',
    location: {
      city: 'San Francisco',
      state: 'California',
      population: '884,363',
      coordinates: [37.7749, -122.4194]
    },
    days: [
      {
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '18:00',
        venue: {
          name: 'Moscone Center West Hall',
          capacity: '5000'
        },
        sector: 'Artificial Intelligence & Machine Learning',
        speakers: [
          'Dr. Sarah Chen - Director of AI Research, Stanford University',
          'Marcus Rodriguez - Chief AI Officer, Google DeepMind',
          'Prof. Elena Volkov - Machine Learning Pioneer, MIT',
          'James Park - Founder & CEO, OpenAI',
          'Dr. Raj Patel - VP of AI Ethics, Microsoft'
        ],
        activities: [
          '9:00 AM - Registration & Welcome Coffee',
          '9:30 AM - Opening Keynote: "The Future of AGI"',
          '10:30 AM - AI Ethics Panel Discussion',
          '12:00 PM - Networking Lunch & Tech Expo',
          '2:00 PM - Machine Learning Workshop',
          '4:00 PM - Startup Pitch Competition',
          '5:30 PM - Welcome Reception & Networking'
        ],
        additionalInfo: '• Business professional dress code recommended\n• All meals and refreshments provided\n• Live streaming available for virtual attendees\n• Simultaneous translation in Spanish and Mandarin\n• Parking available at Moscone Garage ($25/day)'
      },
      {
        date: '2025-10-16',
        startTime: '08:30',
        endTime: '19:00',
        venue: {
          name: 'Moscone Center South Hall',
          capacity: '3500'
        },
        sector: 'Digital Transformation & Enterprise AI',
        speakers: [
          'Lisa Wang - CTO, Salesforce',
          'David Kumar - Head of AI Strategy, IBM',
          'Dr. Michelle Foster - Digital Innovation Leader, Accenture',
          'Alex Thompson - VP Engineering, NVIDIA',
          'Maria Santos - AI Product Manager, Meta'
        ],
        activities: [
          '8:30 AM - Continental Breakfast & Networking',
          '9:00 AM - Enterprise AI Implementation Keynote',
          '10:00 AM - Industry Use Cases Panel',
          '11:30 AM - Hands-on AI Development Workshop',
          '1:00 PM - Networking Lunch & Solution Showcase',
          '3:00 PM - Technical Deep-dive Sessions',
          '5:00 PM - Innovation Awards Ceremony',
          '6:30 PM - Evening Gala Dinner'
        ],
        additionalInfo: '• Laptops required for hands-on workshops\n• Technical skill level: Intermediate to Advanced\n• GitHub account needed for coding sessions\n• Awards ceremony features industry recognition\n• Formal attire for evening gala'
      },
      {
        date: '2025-10-17',
        startTime: '09:00',
        endTime: '16:30',
        venue: {
          name: 'San Francisco Convention Center',
          capacity: '2000'
        },
        sector: 'AI Startups & Future Technologies',
        speakers: [
          'Robert Chang - Managing Partner, Andreessen Horowitz',
          'Dr. Amanda Liu - Quantum Computing Researcher, IBM Research',
          'Carlos Mendez - AI Startup Accelerator Director, Y Combinator',
          'Jennifer Kim - Venture Capitalist, Sequoia Capital',
          'Prof. Michael Zhang - Robotics & AI, UC Berkeley'
        ],
        activities: [
          '9:00 AM - Startup Breakfast & Demo Setup',
          '9:30 AM - Future Tech Trends Keynote',
          '10:30 AM - Investor-Entrepreneur Panel',
          '12:00 PM - Startup Demo Showcase (20 companies)',
          '2:00 PM - Funding & Investment Workshop',
          '3:30 PM - Closing Keynote: "AI in 2030"',
          '4:15 PM - Final Networking & Wrap-up'
        ],
        additionalInfo: '• Startup Demo Day featuring 20 selected companies\n• Investor meetings available by appointment\n• Business cards strongly recommended\n• Final networking focused on partnerships\n• Event app available for continued connections'
      }
    ],
    marketing: {
      channels: ['Social Media', 'Email Campaigns', 'WhatsApp Campaigns', 'Google Ads', 'Professional Networks', 'Partner Referrals', 'Direct Search'],
      budget: 150000
    },
    demographics: {
      target_job_titles: ['Software Engineer', 'Data Scientist', 'Product Manager', 'AI Researcher', 'Tech Executive'],
      industries: ['Technology', 'Finance', 'Healthcare', 'Education'],
      regions: ['California', 'New York', 'Texas', 'Washington', 'Massachusetts']
    },
    budget: 2500000
  });

  const handleSubmit = async (useSimulation = false) => {
    try {
      validateEventData(eventForm);
      
      if (useSimulation) {
        await simulateAnalytics(eventForm);
      } else {
        await analyzeEvent(eventForm);
      }
    } catch (err) {
      console.error('Analytics error:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setEventForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field, value) => {
    setEventForm(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" sx={{ mb: 3 }}>
        Event Analytics Dashboard
      </Typography>

      {!analytics ? (
        <Grid container spacing={3}>
          {/* Event Form */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Event Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Event Name"
                  value={eventForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Event Description"
                  value={eventForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={eventForm.location.city}
                      onChange={(e) => handleLocationChange('city', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="State"
                      value={eventForm.location.state}
                      onChange={(e) => handleLocationChange('state', e.target.value)}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Population"
                  value={eventForm.location.population}
                  onChange={(e) => handleLocationChange('population', e.target.value)}
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Budget ($)"
                  value={eventForm.budget}
                  onChange={(e) => handleInputChange('budget', parseInt(e.target.value, 10))}
                />
              </Box>
            </Card>
          </Grid>

          {/* Days Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Event Schedule ({eventForm.days.length} days)
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 400, overflow: 'auto' }}>
                {eventForm.days.map((day, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Day {index + 1} - {day.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {day.venue.name} (Capacity: {day.venue.capacity})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {day.startTime} - {day.endTime}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Sector: {day.sector}
                    </Typography>
                    <Typography variant="body2">
                      Speakers: {Array.isArray(day.speakers) ? day.speakers.length : 'Multiple'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Generate Analytics Report
              </Typography>
              
              {error && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                  Error: {error}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <LoadingButton
                  size="large"
                  variant="contained"
                  loading={loading}
                  onClick={() => handleSubmit(false)}
                >
                  Analyze Event (Live)
                </LoadingButton>
                
                <LoadingButton
                  size="large"
                  variant="outlined"
                  loading={loading}
                  onClick={() => handleSubmit(true)}
                >
                  Demo Analytics
                </LoadingButton>
              </Box>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Box>
          {/* Analytics Dashboard */}
          <EventAnalyticsDashboard analyticsData={analytics} />
          
          {/* Reset Button */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button variant="outlined" onClick={resetAnalytics} size="large">
              Analyze Another Event
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
