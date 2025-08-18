// ----------------------------------------------------------------------

import { useEffect, useState } from 'react';
import axios, { endpoints } from 'src/lib/axios';

import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material'; // Import Box for spacing

import { DashboardContent } from 'src/layouts/dashboard';
import {
  _analyticTasks,
  _analyticPosts,
  _analyticTraffic,
  _analyticOrderTimeline,
} from 'src/_mock';

import { AnalyticsWidgetSummary } from '../analytics-widget-summary';

import { CONFIG } from 'src/global-config';

import { CvUploadsChart } from '../cv-uploads-chart';
import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsTrafficBySite } from '../analytics-traffic-by-site';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';
import { countryCounts } from 'src/_mock/mockCandidates';

import { AnalyticsTopSkillsFromCVs } from '../analytics-top-skills-from-cvs';
import { AnalyticsExperienceSegments } from '../analytics-experience-segments';
import { AnalyticsLanguageLocationMap } from '../analytics-language-location-map';
import { AnalyticsIndustrySkills } from '../analytics-industry-skills';
import { CVsByLanguage } from '../cvs-by-language';
import { AnalyticsCandidateMap } from '../analytics-candidate-map';
import { AnalyticsCandidatesBarChart } from '../analytics-candidates-bar-chart'; // <-- import new chart component
import AnalyticsIndustrySkillsHeatmap from '../analytics-industry-skills-heatmap';
import AnalyticsEducationLevelDistribution from '../analytics-edudcation-level-distribution';

function formatChartData(rawData) {
  const grouped = {};

  rawData.data.forEach(({ industry, skill, skill_count }) => {
    if (!grouped[industry]) {
      grouped[industry] = [];
    }

    grouped[industry].push({
      name: skill,
      rating: Number(skill_count),
    });
  });

  const series = Object.entries(grouped).map(([industry, skills]) => ({
    name: industry,
    skills,
  }));
  console.log('Formatted Chart Data:', series);

  return { series };
}

export function OverviewAnalyticsView() {
  const [filter, setFilter] = useState('daily');

  const [totalCVs, setTotalCVs] = useState(0);
  const [newCVs, setNewCVs] = useState(0);
  const [avgSkillsCount, setAvgSkillsCount] = useState(0);
  const [avgExperience, setAvgExperience] = useState(0);
  const [cvByLanguageData, setCvByLanguageData] = useState([]);
  const [cvWithSocialMedia, setCvWithSocialMedia] = useState(0);
  const [cvWithPhoneNumber, setCvWithPhoneNumber] = useState(0);
  const [experienceSegments, setExperienceSegments] = useState([]);
  const [topSkills, setTopSkills] = useState({ categories: [], series: [] });
  const [industrySkillsData, setIndustrySkillsData] = useState([]);
  const [cvUploadsData, setCvUploadsData] = useState({ daily: [], weekly: [] });

  // New state for CV processing status
  const [cvProcessingStatus, setCvProcessingStatus] = useState({
    total_processed: 0,
    success_count: 0,
    fail_count: 0,
    cv_in_queue: 0,
  });

  // Function to fetch CV processing status
  const fetchCvProcessingStatus = async () => {
    try {
      const response = await axios.get(endpoints.analytics.cvProgress);
      if (response.data.success) {
        setCvProcessingStatus(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch CV processing status:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchCvProcessingStatus();

    // Set up interval for refetching every 1 minute (60000 ms)
    const intervalId = setInterval(fetchCvProcessingStatus, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  useEffect(() => {
    const fetchTotalCVs = async () => {
      try {
        const response = await axios.get(endpoints.analytics.totalCv);
        const count = response.data.data?.total_cvs || 0; // adjust based on API response

        setTotalCVs(count);
      } catch (error) {
        console.error('Failed to fetch total CVs:', error);
      }
    };

    fetchTotalCVs();
  }, []);
  useEffect(() => {
    const fetchNewCVs = async () => {
      try {
        const response = await axios.get(endpoints.analytics.newCv);
        const count = response.data.data?.new_candidates || 0; // adjust based on API response

        setNewCVs(count);
      } catch (error) {
        console.error('Failed to fetch new CVs:', error);
      }
    };
    fetchNewCVs();
  }, []);

  useEffect(() => {
    const fetchAvgSkillsCount = async () => {
      try {
        const response = await axios.get(endpoints.analytics.avgSkillsCount);
        const count = response.data.data?.avg_skill_count || 0; // adjust based on API response

        setAvgSkillsCount(count);
      } catch (error) {
        console.error('Failed to fetch average skills count:', error);
      }
    };
    fetchAvgSkillsCount();
  }, []);
  useEffect(() => {
    const fetchAvgExperience = async () => {
      try {
        const response = await axios.get(endpoints.analytics.avgExperience);
        const count = response.data.data?.avg_experience_years || 0; // adjust based on API response

        setAvgExperience(count);
      } catch (error) {
        console.error('Failed to fetch average experience:', error);
      }
    };
    fetchAvgExperience();
  }, []);
  useEffect(() => {
    const fetchCvByLanguage = async () => {
      try {
        const response = await axios.get(endpoints.analytics.cvByLanguage);
        const data = response.data?.data || [];

        const parsedData = data.map((item) => ({
          label: item.language,
          value: item.count,
        }));

        setCvByLanguageData(parsedData);
      } catch (error) {
        console.error('Failed to fetch CVs by language:', error);
      }
    };

    fetchCvByLanguage();
  }, []);
  useEffect(() => {
    const fetchCvsWithSocialMedia = async () => {
      try {
        const response = await axios.get(endpoints.analytics.candidateWithSocialMedia);
        const data = response.data?.data || [];
        console.log('CVs with Social Media:', data);
        setCvWithSocialMedia(data.count_with_social_media);
      } catch (error) {
        console.error('Failed to count cvs with social media:', error);
      }
    };

    fetchCvsWithSocialMedia();
  }, []);
  useEffect(() => {
    const fetchCvsWithPhoneNumber = async () => {
      try {
        const response = await axios.get(endpoints.analytics.candidateWithPhoneNumber);
        const data = response.data?.data || {};
        const percent = parseFloat(data.percent_with_phone || '0');

        // Convert percentage to actual count using totalCVs
        const count = Math.round((percent / 100) * totalCVs);

        setCvWithPhoneNumber(count);
      } catch (error) {
        console.error('Failed to count cvs with phone number:', error);
      }
    };

    if (totalCVs > 0) {
      fetchCvsWithPhoneNumber();
    }
  }, [totalCVs]); // depends on totalCVs being fetched

  useEffect(() => {
    const fetchExperienceSegments = async () => {
      try {
        const response = await axios.get(endpoints.analytics.experienceSegments);
        const data = response.data?.data?.segments || [];

        const parsedSegments = data.map((segment) => ({
          label: segment.segment,
          value: segment.count,
        }));

        setExperienceSegments(parsedSegments);
      } catch (error) {
        console.error('Failed to fetch experience segments:', error);
      }
    };

    fetchExperienceSegments();
  }, []);
  useEffect(() => {
    const fetchTopSkills = async () => {
      try {
        const response = await axios.get(endpoints.analytics.topSkills);
        const data = response.data?.data || [];

        const categories = data.map((item) => item.skill_name);
        const thisMonthSeries = data.map((item) => parseInt(item.this_month, 10));
        const lastMonthSeries = data.map((item) => parseInt(item.last_month, 10));

        setTopSkills({
          categories,
          series: [
            { name: 'This Month', data: thisMonthSeries },
            { name: 'Last Month', data: lastMonthSeries },
          ],
        });
      } catch (error) {
        console.error('Failed to fetch top skills:', error);
      }
    };

    fetchTopSkills();
  }, []);
  useEffect(() => {
    const fetchIndustrySkills = async () => {
      try {
        const response = await axios.get(endpoints.analytics.topSkillsByTopIndustries);
        const rawData = response.data?.data || [];
        console.log('Industry Skills Data:', rawData);

        const formatted = formatChartData({ data: rawData });
        setIndustrySkillsData(formatted.series);
        console.log('Formatted Industry Skills Data:', formatted.series);
      } catch (error) {
        console.error('Failed to fetch industry skills data:', error);
      }
    };

    fetchIndustrySkills();
  }, []);
  useEffect(() => {
    const fetchDailyCvUploads = async () => {
      try {
        const response = await axios.get(endpoints.analytics.cvUploadsDaily);
        setCvUploadsData((prev) => ({
          ...prev,
          daily: response.data.data,
        }));
      } catch (error) {
        console.error('Failed to fetch daily CV uploads:', error);
      }
    };

    const fetchWeeklyCvUploads = async () => {
      try {
        const response = await axios.get(endpoints.analytics.cvUploadsWeekly); // Assuming you have this endpoint
        setCvUploadsData((prev) => ({
          ...prev,
          weekly: response.data.data,
        }));
      } catch (error) {
        console.error('Failed to fetch weekly CV uploads:', error);
      }
    };

    fetchDailyCvUploads();
    fetchWeeklyCvUploads();
  }, []);

  const formattedChart = { series: industrySkillsData };
  const cvUploadsChartData = {
    daily: {
      categories: cvUploadsData.daily.map((item) => item.label),
      series: [{ name: 'Uploads', data: cvUploadsData.daily.map((item) => item.uploads) }],
    },
    weekly: {
      categories: cvUploadsData.weekly.map((item) => item.label),
      series: [{ name: 'Uploads', data: cvUploadsData.weekly.map((item) => item.uploads) }],
    },
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, Welcome back 👋
      </Typography>

      {/* Group 1: Initial AnalyticsWidgetSummary components */}
      {/* This Box ensures consistent outer spacing for the first row of widgets */}
      <Box sx={{ mb: 5 }}>
        <Grid container spacing={1} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} width="24%">
            <AnalyticsWidgetSummary
              title="Total CVs"
              total={totalCVs}
              color="secondary"
              icon={
                <img
                  alt="Total CVs"
                  src={`${CONFIG.assetsDir}/assets/icons/glass/ic-glass-users.svg`}
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} width="24%">
            <AnalyticsWidgetSummary
              title="New CVs"
              total={newCVs}
              color="error"
              icon={
                <img
                  alt="New CVs"
                  src={`${CONFIG.assetsDir}/assets/icons/glass/ic-glass-message.svg`}
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} width="24%">
            <AnalyticsWidgetSummary
              title="Avg. Skills per CV"
              total={avgSkillsCount}
              color="info"
              icon={
                <img
                  alt="Avg Skills"
                  src={`${CONFIG.assetsDir}/assets/icons/glass/ic-glass-skills.svg`}
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} width="24%">
            <AnalyticsWidgetSummary
              title="Avg. Exp years"
              total={avgExperience}
              subheader="Years"
              color="secondary"
              icon={
                <img
                  alt="Avg Experience"
                  src={`${CONFIG.assetsDir}/assets/icons/glass/ic-glass-exp.svg`}
                />
              }
            />
          </Grid>
        </Grid>
      </Box>

      {/* Main content grid begins here */}
      <Grid container spacing={3} justifyContent="space-between">
        <Grid size={{ xs: 12, md: 12, lg: 12 }}>
          <Grid item xs={12} md={12} lg={12}>
            <CvUploadsChart
              filter={filter}
              onFilterChange={(newFilter) => setFilter(newFilter)}
              title="Uploaded CVs"
              subheader={`Showing ${filter} uploads`}
              chart={cvUploadsChartData}
            />
          </Grid>
        </Grid>
        {/* Container for the four components in the same row (Experience Segments, CVs by Language, etc.) */}
        <Grid
          container
          spacing={2}
          justifyContent="space-between"
          sx={{ display: 'flex', alignItems: 'stretch' }}
        >
          <Grid size={12}>
            <AnalyticsCandidateMap />
          </Grid>
          <Grid size={12}>
            <AnalyticsCandidatesBarChart countryCounts={countryCounts} />
          </Grid>
          <Grid size={12}>
            <AnalyticsIndustrySkillsHeatmap />
          </Grid>
          {/* Centered and isolated AnalyticsEducationLevelDistribution */}
          <Grid container justifyContent="center" sx={{ width: '100%', my: 3 }}>
            <Grid item xs={12} md={10} lg={8}>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <AnalyticsEducationLevelDistribution />
              </Box>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <AnalyticsExperienceSegments
              chart={{
                series: experienceSegments,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <CVsByLanguage
              total={cvByLanguageData.reduce((sum, lang) => sum + lang.value, 0)}
              chart={{
                series: cvByLanguageData,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <CVsByLanguage
              title="CVs with Phone Number"
              total={totalCVs}
              chart={{
                series: [
                  { label: 'Yes', value: cvWithPhoneNumber },
                  { label: 'No', value: totalCVs - cvWithPhoneNumber },
                ],
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <CVsByLanguage
              title="CVs with Social Media"
              total={totalCVs}
              chart={{
                series: [
                  { label: 'No', value: totalCVs - cvWithSocialMedia },
                  { label: 'Yes', value: cvWithSocialMedia },
                ],
              }}
            />
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <AnalyticsTopSkillsFromCVs chart={topSkills} />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <AnalyticsIndustrySkills
            title="Industry Skills Overview"
            subheader="Compare skills required by industry"
            chart={{
              series: industrySkillsData,
            }}
          />
        </Grid>

        {/* CV Processing Status section - Group 2: AnalyticsWidgetSummary components */}
        {/* Full width grid item for the title */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 3, mt: 5 }}>
            CV Processing Status
          </Typography>
        </Grid>

        {/* End of new section */}
      </Grid>
      {/* This Box ensures consistent outer spacing for the second row of widgets */}
      <Box sx={{ mb: 5 }}>
        {' '}
        {/* Added Box wrapper here */}
        <Grid container spacing={1} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} width="24%">
            <AnalyticsWidgetSummary
              title="Total Processed"
              total={cvProcessingStatus.total_processed}
              color="primary"
              icon={
                <img
                  alt="Total Processed"
                  src={`${CONFIG.assetsDir}/assets/icons/glass/ic-glass-total.svg`}
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} width="24%">
            <AnalyticsWidgetSummary
              title="Successful"
              total={cvProcessingStatus.success_count}
              color="success"
              icon={
                <img
                  alt="Successful"
                  src={`${CONFIG.assetsDir}/assets/icons/glass/ic-glass-done.svg`}
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} width="24%">
            <AnalyticsWidgetSummary
              title="Failed"
              total={cvProcessingStatus.fail_count}
              color="error"
              icon={
                <img
                  alt="Failed"
                  src={`${CONFIG.assetsDir}/assets/icons/glass/ic-glass-failed.svg`}
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} width="24%">
            <AnalyticsWidgetSummary
              title="CVs In Queue"
              total={cvProcessingStatus.cv_in_queue}
              color="warning"
              icon={
                <img
                  alt="CVs In Queue"
                  src={`${CONFIG.assetsDir}/assets/icons/glass/ic-glass-progress.svg`}
                />
              }
            />
          </Grid>
        </Grid>
      </Box>
    </DashboardContent>
  );
}
