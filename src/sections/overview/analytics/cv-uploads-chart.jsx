import ReactApexChart from 'react-apexcharts';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

export function CvUploadsChart({ title, subheader, chart }) {
  const theme = useTheme();
  const [filter, setFilter] = useState('daily');
  const [chartData, setChartData] = useState({ categories: [], series: [] });

  useEffect(() => {
    if (chart && chart[filter]) {
      setChartData({
        categories: chart[filter].categories || [],
        series: chart[filter].series || [],
      });
    }
  }, [chart, filter]);

  const chartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
    },
    colors: [theme.palette.primary.main],
    stroke: { width: 3 },
    xaxis: {
      categories: chartData.categories,
    },
    yaxis: {
      title: { text: 'CVs' },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light', // Set tooltip theme based on MUI mode
      y: {
        formatter: (val) => `${val} CVs`,
      },
      style: {
        // Further custom styling of the tooltip
        fontSize: '12px',
        fontFamily: theme.typography.fontFamily,
        backgroundColor: theme.palette.background.paper, // Use card background for consistency
        color: theme.palette.text.primary,
        boxShadow: theme.shadows[8], // Add a subtle shadow
        borderRadius: '4px',
        padding: '8px',
      },
    },
  };

  return (
    <Card>
      <CardHeader
        title={title}
        subheader={`${subheader}`}
        action={
          <Select size="small" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
          </Select>
        }
      />

      <Box sx={{ p: 3, pb: 1 }}>
        <ReactApexChart type="line" height={350} series={chartData.series} options={chartOptions} />
      </Box>
    </Card>
  );
}
