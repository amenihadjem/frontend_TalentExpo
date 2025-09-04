import React from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import { useTheme } from '@mui/material/styles';

import { fNumber, fPercent } from 'src/utils/format-number';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

export function EventAnalyticsDashboard({ analyticsData }) {
  const theme = useTheme();

  if (!analyticsData?.data_visualizations) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No analytics data available
        </Typography>
      </Card>
    );
  }

  const { data_visualizations, key_insights, recommendations, actionable_metrics } = analyticsData;

  // Chart configurations for different visualization types
  const createChartOptions = (type, data) => {
    const baseOptions = {
      chart: { type },
      colors: data?.colors || theme.palette.chart?.colors || [
        theme.palette.primary.main,
        theme.palette.warning.main,
        theme.palette.info.main,
        theme.palette.error.main,
        theme.palette.success.main,
      ],
    };

    switch (type) {
      case 'donut':
        return {
          ...baseOptions,
          plotOptions: {
            pie: {
              donut: {
                size: data.chart_config?.innerRadius || 60,
                labels: {
                  show: data.chart_config?.showLabels || true,
                  value: {
                    fontSize: '18px',
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                  },
                  total: {
                    show: true,
                    label: 'Total',
                    fontSize: '14px',
                    color: theme.palette.text.secondary,
                  },
                },
              },
            },
          },
          labels: data.data?.map(item => item.label) || [],
          legend: { show: false },
        };

      case 'line':
        return {
          ...baseOptions,
          xaxis: { categories: data.data?.categories || [] },
          stroke: { width: 3, curve: 'smooth' },
          markers: { size: 5 },
          grid: { strokeDashArray: 3 },
        };

      case 'bar':
        return {
          ...baseOptions,
          xaxis: { categories: data.data?.categories || [] },
          plotOptions: {
            bar: {
              borderRadius: 8,
              columnWidth: '60%',
              distributed: false,
            },
          },
        };

      case 'radar':
        return {
          ...baseOptions,
          xaxis: { categories: data.data?.categories || [] },
          plotOptions: {
            radar: {
              polygons: {
                strokeColors: theme.palette.divider,
                fill: { colors: ['transparent'] },
              },
            },
          },
        };

      default:
        return baseOptions;
    }
  };

  // Render individual chart components
  const renderChart = (chartData, title, type = 'donut') => {
    if (!chartData?.data) return null;

    const chartOptions = useChart(createChartOptions(type, chartData));
    
    let series;
    switch (type) {
      case 'donut':
      case 'pie':
        series = chartData.data.map(item => item.value);
        break;
      case 'line':
      case 'bar':
        series = chartData.data.series || [];
        break;
      case 'radar':
        series = chartData.data.series || [];
        break;
      default:
        series = [];
    }

    return (
      <Card>
        <CardHeader title={title} />
        <Box sx={{ p: 3 }}>
          <Chart
            type={type}
            series={series}
            options={chartOptions}
            height={300}
          />
          {(type === 'donut' || type === 'pie') && chartData.data && (
            <Box sx={{ mt: 3 }}>
              <ChartLegends
                labels={chartData.data.map(item => item.label)}
                colors={chartData.data.map(item => item.color)}
                values={chartData.data.map(item => fNumber(item.value))}
                sx={{ justifyContent: 'center' }}
              />
            </Box>
          )}
        </Box>
      </Card>
    );
  };

  // Summary cards for key metrics
  const renderSummaryCard = (title, value, subtitle, color = 'primary') => (
    <Card sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h3" color={`${color}.main`} sx={{ mb: 1 }}>
        {fNumber(value)}
      </Typography>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Card>
  );

  // Insights section
  const renderInsights = () => (
    <Card sx={{ p: 3 }}>
      <CardHeader title="Key Insights" />
      <Stack spacing={2}>
        {key_insights?.map((insight, index) => (
          <Box
            key={index}
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.08),
              borderLeft: `4px solid ${theme.palette.primary.main}`,
            }}
          >
            <Typography variant="body2">{insight}</Typography>
          </Box>
        ))}
      </Stack>
    </Card>
  );

  // Recommendations section
  const renderRecommendations = () => (
    <Card sx={{ p: 3 }}>
      <CardHeader title="Strategic Recommendations" />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" color="success.main" gutterBottom>
            Optimization Strategies
          </Typography>
          <Stack spacing={1}>
            {recommendations?.optimization_strategies?.map((strategy, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    mt: 1,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2">{strategy}</Typography>
              </Box>
            ))}
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" color="warning.main" gutterBottom>
            Risk Mitigation
          </Typography>
          <Stack spacing={1}>
            {recommendations?.risk_mitigation?.map((risk, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'warning.main',
                    mt: 1,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2">{risk}</Typography>
              </Box>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          {renderSummaryCard(
            'Expected Registration',
            analyticsData.registration_expected,
            'Total registrations',
            'primary'
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderSummaryCard(
            'Expected Attendance',
            analyticsData.attendance_expected,
            'Actual attendees',
            'success'
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderSummaryCard(
            'Conversion Rate',
            actionable_metrics?.conversion_rates?.registration_to_attendance || '75%',
            'Registration to attendance',
            'info'
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderSummaryCard(
            'Confidence Level',
            `${analyticsData.confidence_level}%`,
            'Prediction accuracy',
            'warning'
          )}
        </Grid>
      </Grid>

      {/* Main Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          {renderChart(
            data_visualizations.audience_segmentation,
            'Target Audience Distribution',
            'donut'
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart(
            data_visualizations.geographic_distribution,
            'Expected Attendance by Region',
            'bar'
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart(
            data_visualizations.registration_trend,
            'Predicted Registration Timeline',
            'line'
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart(
            data_visualizations.industry_breakdown,
            'Attendees by Industry Sector',
            'pie'
          )}
        </Grid>
        <Grid item xs={12}>
          {renderChart(
            data_visualizations.daily_attendance_forecast,
            'Daily Attendance Breakdown',
            'bar'
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart(
            data_visualizations.confidence_indicators,
            'Prediction Confidence Factors',
            'radar'
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart(
            data_visualizations.marketing_effectiveness,
            'Expected Registrations by Marketing Channel',
            'bar'
          )}
        </Grid>
      </Grid>

      {/* Insights and Recommendations */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {renderInsights()}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderRecommendations()}
        </Grid>
      </Grid>
    </Box>
  );
}
