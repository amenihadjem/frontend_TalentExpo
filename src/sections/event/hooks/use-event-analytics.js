import { useState, useCallback } from 'react';
import axios from 'src/lib/axios';

// ----------------------------------------------------------------------

export function useEventAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeEvent = useCallback(async (eventData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Your n8n webhook endpoint
      const N8N_WEBHOOK_URL = 'https://n8n.talentexpo.eu/webhook/simulate-event';
      
      // Structure the event data according to your workflow schema
      const payload = {
        event_name: eventData.name,
        event_description: eventData.description,
        city: eventData.location.city,
        state: eventData.location.state,
        population: eventData.location.population,
        coordinates: eventData.location.coordinates,
        number_of_days: eventData.days.length,
        days: eventData.days.map(day => ({
          event_date: day.date,
          start_time: day.startTime,
          end_time: day.endTime,
          venue_name: day.venue.name,
          venue_capacity: day.venue.capacity,
          primary_sector: day.sector,
          speakers: Array.isArray(day.speakers) ? day.speakers.join('\n') : day.speakers,
          activities: Array.isArray(day.activities) ? day.activities.join('\n') : day.activities,
          additional_info: day.additionalInfo,
        })),
        // Add marketing and demographic data if available
        marketing_channels: eventData.marketing?.channels || [],
        target_demographics: eventData.demographics || {},
        budget: eventData.budget || null,
        historical_data: eventData.historicalData || null,
      };

      const response = await axios.post(N8N_WEBHOOK_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      });

      const analyticsResult = response.data;
      
      // Validate the response structure
      if (!analyticsResult.registration_expected || !analyticsResult.attendance_expected) {
        throw new Error('Invalid response format from analytics service');
      }

      setAnalytics(analyticsResult);
      return analyticsResult;
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to analyze event data';
      setError(errorMessage);
      console.error('Event analytics error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetAnalytics = useCallback(() => {
    setAnalytics(null);
    setError(null);
  }, []);

  // Helper function to validate event data before sending
  const validateEventData = useCallback((eventData) => {
    const requiredFields = ['name', 'description', 'location', 'days'];
    const missingFields = requiredFields.filter(field => !eventData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    if (!Array.isArray(eventData.days) || eventData.days.length === 0) {
      throw new Error('Event must have at least one day scheduled');
    }

    eventData.days.forEach((day, index) => {
      if (!day.date || !day.venue?.name || !day.venue?.capacity) {
        throw new Error(`Day ${index + 1} is missing required venue information`);
      }
    });

    return true;
  }, []);

  // Simulate analytics for testing purposes
  const simulateAnalytics = useCallback((eventData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockAnalytics = {
          analysis: "Comprehensive analysis based on provided event data. Strong potential for AI & Innovation Summit in San Francisco with excellent speaker lineup and venue selection.",
          registration_expected: 2500,
          attendance_expected: 1875,
          confidence_level: 85,
          data_visualizations: {
            audience_segmentation: {
              type: "donut_chart",
              title: "Target Audience Distribution",
              data: [
                { label: "Senior Engineers", value: 35, color: "#1976d2" },
                { label: "Product Managers", value: 25, color: "#ed6c02" },
                { label: "Data Scientists", value: 20, color: "#2e7d32" },
                { label: "Engineering Leaders", value: 20, color: "#9c27b0" }
              ],
              chart_config: { innerRadius: 60, showLabels: true, showLegends: true }
            },
            geographic_distribution: {
              type: "bar_chart",
              title: "Expected Attendance by Region",
              data: {
                categories: ["California", "New York", "Texas", "Washington", "Massachusetts", "Other"],
                series: [{
                  name: "Expected Attendees",
                  data: [650, 420, 315, 280, 210, 500],
                  color: "#2e7d32"
                }]
              }
            },
            registration_trend: {
              type: "line_chart",
              title: "Predicted Registration Timeline",
              data: {
                categories: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
                series: [{
                  name: "Expected Registrations",
                  data: [150, 420, 750, 1200, 1800, 2500],
                  color: "#1976d2"
                }, {
                  name: "Conservative Estimate",
                  data: [100, 320, 580, 950, 1400, 1950],
                  color: "#ed6c02"
                }]
              }
            },
            industry_breakdown: {
              type: "pie_chart",
              title: "Attendees by Industry Sector",
              data: [
                { label: "Technology", value: 45, color: "#1976d2" },
                { label: "Finance", value: 20, color: "#ed6c02" },
                { label: "Healthcare", value: 15, color: "#2e7d32" },
                { label: "Education", value: 12, color: "#9c27b0" },
                { label: "Other", value: 8, color: "#f57c00" }
              ]
            },
            daily_attendance_forecast: {
              type: "multi_bar_chart",
              title: "Daily Attendance Breakdown",
              data: {
                categories: ["Day 1", "Day 2", "Day 3"],
                series: [{
                  name: "Expected Attendance",
                  data: [1875, 1650, 1425],
                  color: "#1976d2"
                }, {
                  name: "Venue Capacity",
                  data: [5000, 3500, 2000],
                  color: "#ed6c02"
                }]
              }
            },
            confidence_indicators: {
              type: "radar_chart",
              title: "Prediction Confidence Factors",
              data: {
                categories: ["Historical Data", "Market Research", "Economic Indicators", "Competitor Analysis", "Weather Impact", "Venue Accessibility"],
                series: [{
                  name: "Confidence Score",
                  data: [90, 85, 75, 80, 95, 88],
                  color: "#1976d2"
                }]
              }
            },
            marketing_effectiveness: {
              type: "stacked_bar_chart",
              title: "Expected Registrations by Marketing Channel",
              data: {
                categories: ["Social Media", "Email Campaigns", "WhatsApp Campaigns", "Google Ads", "Professional Networks", "Partner Referrals", "Direct Search"],
                series: [
                  { name: "Early Bird (Week 1-2)", data: [200, 150, 180, 220, 180, 120, 100], color: "#1976d2" },
                  { name: "Regular (Week 3-4)", data: [350, 280, 250, 320, 220, 180, 150], color: "#ed6c02" },
                  { name: "Last Minute (Week 5-6)", data: [180, 120, 110, 140, 100, 80, 70], color: "#2e7d32" }
                ]
              }
            },
            email_campaign_metrics: {
              type: "multi_bar_chart",
              title: "Email Campaign Performance Metrics",
              data: {
                categories: ["Welcome Series", "Speaker Announcements", "Early Bird Reminder", "Agenda Reveal", "Final Call", "Day-of Updates"],
                series: [
                  { name: "Open Rate (%)", data: [68, 72, 65, 78, 58, 85], color: "#1976d2" },
                  { name: "Click Rate (%)", data: [24, 28, 31, 35, 22, 42], color: "#ed6c02" },
                  { name: "Registration Rate (%)", data: [8, 12, 18, 22, 15, 28], color: "#2e7d32" }
                ]
              }
            },
            whatsapp_campaign_metrics: {
              type: "line_chart",
              title: "WhatsApp Campaign Engagement Timeline",
              data: {
                categories: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
                series: [
                  { name: "Group Members", data: [150, 280, 450, 680, 920, 1200], color: "#25D366" },
                  { name: "Active Participants", data: [45, 98, 162, 238, 324, 420], color: "#128C7E" },
                  { name: "Registrations Generated", data: [12, 35, 68, 105, 142, 180], color: "#075E54" }
                ]
              }
            },
            campaign_roi_analysis: {
              type: "donut_chart",
              title: "Marketing ROI by Campaign Type",
              data: [
                { label: "Email Campaigns", value: 420, color: "#1976d2" },
                { label: "WhatsApp Campaigns", value: 360, color: "#25D366" },
                { label: "Social Media", value: 680, color: "#E1306C" },
                { label: "Google Ads", value: 750, color: "#4285F4" },
                { label: "Other Channels", value: 290, color: "#9c27b0" }
              ],
              chart_config: { 
                innerRadius: 60, 
                showLabels: true, 
                showLegends: true,
                valuePrefix: "$",
                valueSuffix: " ROI"
              }
            }
          },
          key_insights: [
            "Strong alignment between database audience and event topic increases confidence",
            "San Francisco location provides optimal accessibility for tech professionals",
            "Multi-day format may cause 15-20% attendance drop-off between days",
            "Premium speaker lineup significantly boosts registration conversion rates",
            "Email campaigns show 72% average open rate with peak performance during agenda reveals",
            "WhatsApp groups demonstrate 35% engagement rate with direct community building impact",
            "Combined email + WhatsApp strategy increases conversion by 45% over single-channel approach",
            "Mobile-first WhatsApp updates drive 28% higher day-of attendance rates"
          ],
          recommendations: {
            optimization_strategies: [
              "Focus marketing on California and NY regions for highest ROI",
              "Implement early bird pricing to capture 40% of registrations in first 3 weeks",
              "Create day-specific value propositions to maintain multi-day attendance",
              "Leverage LinkedIn and professional networks for primary outreach",
              "Use Google Ads targeting for AI/ML professionals with 25-45 age range",
              "Implement Google Ads remarketing campaigns for website visitors",
              "Deploy personalized email campaigns with speaker spotlights and agenda highlights",
              "Leverage WhatsApp groups and community channels for direct engagement and updates",
              "Email Campaign Strategy: Send 6-email sequence with 72h intervals, A/B test subject lines",
              "WhatsApp Campaign Strategy: Create 8-10 industry-specific groups, max 250 members each",
              "Email automation: Trigger based workflows for different registration stages",
              "WhatsApp broadcast lists: Segment by job title for targeted messaging",
              "Cross-channel integration: WhatsApp group invites in email signatures",
              "Email personalization: Dynamic content based on industry and experience level",
              "WhatsApp community management: Assign 2-3 moderators per group, daily engagement",
              "Email retargeting: Re-engage non-openers with different subject lines after 48h"
            ],
            risk_mitigation: [
              "Secure backup speakers for critical keynote slots",
              "Implement hybrid attendance options for weather contingency",
              "Monitor competitor event announcements and adjust pricing accordingly",
              "Create waitlist system due to strong predicted demand vs venue capacity"
            ]
          },
          actionable_metrics: {
            conversion_rates: {
              awareness_to_interest: "49.4%",
              interest_to_registration: "59.5%",
              registration_to_attendance: "75.0%"
            },
            revenue_projections: {
              total_revenue: "$1,875,000",
              average_ticket_price: "$750",
              break_even_attendance: "1,200"
            },
            capacity_utilization: {
              day_1: "37.5%",
              day_2: "47.1%", 
              day_3: "71.3%"
            },
            email_campaign_kpis: {
              total_emails_sent: "15,000",
              average_open_rate: "68.5%",
              average_click_rate: "28.3%",
              registration_conversion: "18.7%",
              cost_per_registration: "$12.50",
              email_roi: "420%"
            },
            whatsapp_campaign_kpis: {
              total_groups_created: "8",
              total_members: "1,200",
              average_engagement_rate: "35.2%",
              message_response_rate: "67.8%",
              registration_conversion: "15.0%",
              cost_per_registration: "$8.75",
              whatsapp_roi: "360%"
            }
          }
        };
        
        setAnalytics(mockAnalytics);
        resolve(mockAnalytics);
      }, 2000);
    });
  }, []);

  return {
    analytics,
    loading,
    error,
    analyzeEvent,
    resetAnalytics,
    validateEventData,
    simulateAnalytics, // Remove this in production
  };
}
