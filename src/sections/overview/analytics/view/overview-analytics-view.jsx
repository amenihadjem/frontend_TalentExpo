// ----------------------------------------------------------------------

import { useEffect, useState } from 'react';
import axios, { endpoints } from 'src/lib/axios';

import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsWidgetSummary } from '../analytics-widget-summary';

import { CONFIG } from 'src/global-config';

import { CvUploadsChart } from '../cv-uploads-chart';
import { AnalyticsTopSkillsFromCVs } from '../analytics-top-skills-from-cvs';
import { AnalyticsExperienceSegments } from '../analytics-experience-segments';
import { AnalyticsIndustrySkills } from '../analytics-industry-skills';
import { CVsByLanguage } from '../cvs-by-language';
import { AnalyticsCandidateMap } from '../analytics-candidate-map';
import { AnalyticsCandidatesBarChart } from '../analytics-candidates-bar-chart';
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

  return { series };
}

// Updated to use the new 8/4 layout as requested
export function OverviewAnalyticsView() {
  const [filter, setFilter] = useState('daily');

  // Main stats from the new unified endpoint
  const [mainStats, setMainStats] = useState({
    total_cvs: 0,
    new_cvs_today: 0,
    cvs_with_phone: { count: 0, percentage: '0' },
    cvs_with_email: { count: 0, percentage: '0' },
    avg_experience_years: 0,
    top_countries: [],
    top_industries: [],
    experience_segments: [],
  });

  // Additional data that needs separate endpoints
  const [cvByLanguageData, setCvByLanguageData] = useState([]);
  const [cvWithSocialMedia, setCvWithSocialMedia] = useState(0);
  const [topSkills, setTopSkills] = useState({ categories: [], series: [] });
  const [industrySkillsData, setIndustrySkillsData] = useState([]);
  const [cvUploadsData, setCvUploadsData] = useState({ daily: [], weekly: [] });
  const [mapData, setMapData] = useState([]);

  // CV processing status
  const [cvProcessingStatus, setCvProcessingStatus] = useState({
    total_processed: 0,
    success_count: 0,
    fail_count: 0,
    cv_in_queue: 0,
  });

  // Fetch main statistics from the unified endpoint
  useEffect(() => {
    const fetchMainStats = async () => {
      try {
        const response = await axios.get(endpoints.analytics.stats);
        if (response.data.success) {
          setMainStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch main stats:', error);
      }
    };

    fetchMainStats();
  }, []);

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
  }, []);

  // Fetch additional data that's not in the main stats endpoint
  useEffect(() => {
    const fetchAdditionalData = async () => {
      console.log('🔍 Starting fetchAdditionalData...');

      try {
        console.log('📡 Fetching CVs with social media...');
        // Fetch CVs with social media
        try {
          const socialMediaResponse = await axios.get(endpoints.analytics.candidateWithSocialMedia);
          console.log('✅ Social media response:', socialMediaResponse.data);
          const socialMediaData = socialMediaResponse.data?.data || {};
          setCvWithSocialMedia(socialMediaData.count_with_social_media || 0);
        } catch (socialError) {
          console.error('❌ Social media fetch failed:', socialError);
          // Continue with other fetches even if this one fails
        }

        console.log('📡 Fetching top skills...');
        // Fetch top skills
        try {
          const skillsResponse = await axios.get(endpoints.analytics.topSkills);
          console.log('✅ Skills response:', skillsResponse.data);
          const skillsData = skillsResponse.data?.data || [];
          const categories = skillsData.map((item) => item.skill_name);
          const thisMonthSeries = skillsData.map((item) => parseInt(item.this_month, 10));
          const lastMonthSeries = skillsData.map((item) => parseInt(item.last_month, 10));
          setTopSkills({
            categories,
            series: [
              { name: 'This Month', data: thisMonthSeries },
              { name: 'Last Month', data: lastMonthSeries },
            ],
          });
        } catch (skillsError) {
          console.error('❌ Skills fetch failed:', skillsError);
          // Continue with other fetches even if this one fails
        }

        console.log('📡 Fetching industry skills...');
        // Fetch industry skills
        try {
          const industrySkillsResponse = await axios.get(
            endpoints.analytics.topSkillsByTopIndustries
          );
          console.log('✅ Industry skills response:', industrySkillsResponse.data);
          const industrySkillsRawData = industrySkillsResponse.data?.data || [];
          const formattedIndustrySkills = formatChartData({ data: industrySkillsRawData });
          setIndustrySkillsData(formattedIndustrySkills.series);
        } catch (industryError) {
          console.error('❌ Industry skills fetch failed:', industryError);
          // Continue with other fetches even if this one fails
        }

        console.log('📡 Fetching map data...');
        // Fetch map data
        try {
          const mapResponse = await axios.get(endpoints.analytics.candidatesByCountry);
          console.log('✅ Map response:', mapResponse.data);
          setMapData(mapResponse.data?.data || []);
        } catch (mapError) {
          console.error('❌ Map fetch failed:', mapError);
          // Continue with other fetches even if this one fails
        }

        console.log('📡 Fetching details for language distribution...');
        console.log('🔗 Using endpoint:', endpoints.analytics.details);

        // 🔹 THIS IS THE IMPORTANT PART - Fetch language distribution (limit to top 3)
        try {
          const detailsResponse = await axios.get(endpoints.analytics.details);
          console.log('✅ Details response status:', detailsResponse.status);
          console.log('✅ Full details response:', detailsResponse.data);

          if (!detailsResponse.data) {
            console.error('❌ No data in details response');
            setCvByLanguageData([]);
            return;
          }

          if (!detailsResponse.data.data) {
            console.error('❌ No data.data in details response');
            console.log('📋 Available keys:', Object.keys(detailsResponse.data));
            setCvByLanguageData([]);
            return;
          }

          const langRaw = detailsResponse.data.data.language_distribution || [];
          console.log('🗣️ Raw language data:', langRaw);
          console.log('🗣️ Language data type:', typeof langRaw);
          console.log('🗣️ Language data length:', langRaw.length);

          if (langRaw.length === 0) {
            console.warn('⚠️ Language data is empty');
            setCvByLanguageData([]);
            return;
          }

          const top3Languages = langRaw
            .slice() // clone so we don't mutate
            .sort((a, b) => {
              console.log(`Comparing ${a.key} (${a.doc_count}) vs ${b.key} (${b.doc_count})`);
              return b.doc_count - a.doc_count;
            })
            .slice(0, 3)
            .map((item) => {
              console.log(`Mapping ${item.key}: ${item.doc_count}`);
              return {
                label: item.key,
                value: item.doc_count,
              };
            });

          console.log('🎯 Transformed top 3 languages:', top3Languages);
          console.log('🎯 Setting cvByLanguageData to:', top3Languages);
          setCvByLanguageData(top3Languages);

          console.log('✅ Language data fetch completed successfully');
        } catch (languageError) {
          console.error('❌ Language data fetch failed:', languageError);
          console.error('❌ Language error details:', {
            message: languageError.message,
            status: languageError.response?.status,
            statusText: languageError.response?.statusText,
            data: languageError.response?.data,
          });
          setCvByLanguageData([]);
        }

        console.log('✅ fetchAdditionalData completed successfully');
      } catch (error) {
        console.error('❌ Failed to fetch additional data:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config,
        });
      }
    };

    console.log('🚀 Starting fetchAdditionalData useEffect...');
    fetchAdditionalData();
  }, []);

  // Fetch CV uploads data
  useEffect(() => {
    const fetchCvUploadsData = async () => {
      try {
        const [dailyResponse, weeklyResponse] = await Promise.all([
          axios.get(endpoints.analytics.cvUploadsDaily),
          axios.get(endpoints.analytics.cvUploadsWeekly),
        ]);

        setCvUploadsData({
          daily: dailyResponse.data.data || [],
          weekly: weeklyResponse.data.data || [],
        });
      } catch (error) {
        console.error('Failed to fetch CV uploads data:', error);
      }
    };

    fetchCvUploadsData();
  }, []);

  // Prepare chart data
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

  // Prepare experience segments data for the chart
  const experienceSegmentsChartData = mainStats.experience_segments.map((segment) => ({
    label: segment.level,
    value: segment.count,
  }));

  // Prepare country data for bar chart (top 10 countries)
  const countryChartData = mainStats.top_countries.slice(0, 10).map((country) => ({
    country: country.country,
    count: country.count,
  }));

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, Welcome back 👋
      </Typography>

      {/* Group 1: Main Statistics Widgets */}
      <Box sx={{ mb: 5 }}>
        <Grid container spacing={1} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} width="24%">
            <AnalyticsWidgetSummary
              title="Total CVs"
              total={mainStats.total_cvs}
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
              title="New CVs Today"
              total={mainStats.new_cvs_today}
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
              title="CVs with Email"
              total={mainStats.cvs_with_email.count}
              subheader={`${mainStats.cvs_with_email.percentage}%`}
              color="info"
              icon={
                <img
                  alt="CVs with Email"
                  src={`${CONFIG.assetsDir}/assets/icons/glass/ic-glass-email.svg`}
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} width="24%">
            <AnalyticsWidgetSummary
              title="Avg. Experience"
              total={mainStats.avg_experience_years}
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

      {/* Main content grid */}
      <Grid container spacing={3} justifyContent="space-between">
        {/* CV Uploads Chart */}
        {/* <Grid size={{ xs: 12, md: 12, lg: 12 }}>
          <CvUploadsChart
            filter={filter}
            onFilterChange={(newFilter) => setFilter(newFilter)}
            title="Uploaded CVs"
            subheader={`Showing ${filter} uploads`}
            chart={cvUploadsChartData}
          />
        </Grid> */}

        {/* Charts Row */}
        <Grid
          container
          spacing={2}
          justifyContent="space-between"
          sx={{ display: 'flex', alignItems: 'stretch' }}
        >
          {/* Candidate Map */}
          <Grid size={12}>
            <AnalyticsCandidateMap />
          </Grid>

          {/* Top Countries Bar Chart - using map data */}
          <Grid size={12}>
            <AnalyticsCandidatesBarChart
              title="Top 10 Countries by Candidate Count"
              countryCounts={countryChartData}
            />
          </Grid>

          {/* Heatmap and Education Level Distribution Side by Side - 8/4 layout */}
          <Grid container spacing={3} sx={{ width: '100%', mt: 2 }}>
            {/* Industry Skills Heatmap - Takes 8/12 columns */}
            <Grid size={{ xs: 12, md: 8 }}>
              <AnalyticsIndustrySkillsHeatmap />
            </Grid>

            {/* Education Level Distribution - Takes 4/12 columns */}
            <Grid size={{ xs: 12, md: 4 }}>
              <AnalyticsEducationLevelDistribution />
            </Grid>
          </Grid>

          {/* Four pie charts in a row */}
          <Grid container spacing={2} sx={{ width: '100%', mt: 2 }}>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <AnalyticsExperienceSegments
                title="Experience Levels"
                chart={{
                  series: experienceSegmentsChartData,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <CVsByLanguage
                title="CVs by Language"
                total={cvByLanguageData.reduce((sum, lang) => sum + lang.value, 0)}
                chart={{
                  series: cvByLanguageData,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <CVsByLanguage
                title="CVs with Phone Number"
                total={mainStats.total_cvs}
                chart={{
                  series: [
                    { label: 'With Phone', value: mainStats.cvs_with_phone.count },
                    {
                      label: 'Without Phone',
                      value: mainStats.total_cvs - mainStats.cvs_with_phone.count,
                    },
                  ],
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <CVsByLanguage
                title="CVs with Social Media"
                total={mainStats.total_cvs}
                chart={{
                  series: [
                    { label: 'With Social Media', value: cvWithSocialMedia },
                    {
                      label: 'Without Social Media',
                      value: mainStats.total_cvs - cvWithSocialMedia,
                    },
                  ],
                }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Skills and Industry Analysis */}
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

        {/* CV Processing Status Section */}
        {/* <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 3, mt: 5 }}>
            CV Processing Status
          </Typography>
        </Grid> */}
      </Grid>

      {/* CV Processing Status Widgets */}
      {/* <Box sx={{ mb: 5 }}>
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
      </Box> */}
    </DashboardContent>
  );
}

// Make sure to export as default as well
export default OverviewAnalyticsView;
