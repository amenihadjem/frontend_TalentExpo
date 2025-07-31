import { useState, useEffect, useMemo } from 'react';

import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

// Function to generate distinct colors using HSL
function generateDistinctColors(numColors) {
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const hue = Math.round((i * 360) / numColors);
    colors.push(`hsl(${hue}, 70%, 50%)`); // You can adjust saturation and lightness
  }
  return colors;
}

export function AnalyticsIndustrySkills({ title, subheader, chart, sx, ...other }) {
  const theme = useTheme();
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [industryColors, setIndustryColors] = useState({});

  const handleFilterChange = (_, newValue) => {
    if (newValue !== null) setSelectedIndustry(newValue);
  };

  // Memoize industryOptions to prevent unnecessary re-creation
  const industryOptions = useMemo(() => chart.series.map((item) => item.name), [chart.series]);
  // Memoize uniqueIndustries based on industryOptions
  const uniqueIndustries = useMemo(() => [...new Set(industryOptions)], [industryOptions]);

  useEffect(() => {
    const generatedColors = generateDistinctColors(uniqueIndustries.length);
    const colorMap = {};
    uniqueIndustries.forEach((industry, index) => {
      colorMap[industry] = generatedColors[index];
    });
    setIndustryColors(colorMap);
  }, [uniqueIndustries]);

  const selectedSeries = useMemo(
    () =>
      selectedIndustry === 'all'
        ? (chart?.series || []).map((item) => ({
            name: item.name,
            data: item.skills?.map((skill) => skill.rating) ?? [],
          }))
        : [
            {
              name: selectedIndustry,
              data:
                chart?.series
                  ?.find((item) => item.name === selectedIndustry)
                  ?.skills?.map((skill) => skill.rating) ?? [],
            },
          ],
    [chart?.series, selectedIndustry]
  );

  const chartColors = useMemo(
    () =>
      selectedIndustry === 'all'
        ? chart.series.map((item) => industryColors[item.name] || theme.palette.grey[500])
        : [industryColors[selectedIndustry] || theme.palette.grey[500]],
    [chart.series, selectedIndustry, industryColors]
  );

  const chartOptions = useChart({
    chart: {
      type: 'radar',
    },
    fill: { opacity: 0.48 },
    stroke: { width: 2 },
    colors: chartColors,
    xaxis: {
      categories: chart?.series?.[0]?.skills?.map((skill) => skill.name) ?? [],
    },

    legend: { show: false }, // 👈 Hide default legend
  });

  return (
    <Card sx={sx} {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{
          display: 'flex', // Enable flexbox for the CardHeader content
          flexDirection: 'column', // Stack title and subheader vertically
          alignItems: 'flex-start', // Align title and subheader to the start (left)
          '& .MuiCardHeader-content': {
            // Target the content container
            flexGrow: 1, // Allow content to take up available horizontal space
            width: '100%', // Ensure content tries to be full width
          },
          '& .MuiCardHeader-title': {
            width: '100%',
            whiteSpace: 'normal',
            marginBottom: 1,
          },
          '& .MuiCardHeader-subheader': {
            width: '100%',
            whiteSpace: 'normal',
            marginBottom: 2,
          },

          '& .MuiCardHeader-action': {
            width: '100%', // Make action take full width
            ml: 0, // Reset auto margin
          },
        }}
        action={
          <ToggleButtonGroup
            value={selectedIndustry}
            exclusive
            onChange={handleFilterChange}
            size="small"
            color="primary"
            sx={{ width: '100%', justifyContent: 'space-around' }}
          >
            <ToggleButton value="all">All</ToggleButton>
            {industryOptions.map((industry) => (
              <ToggleButton key={industry} value={industry}>
                {industry}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
      />

      <Chart
        type="radar"
        series={selectedSeries}
        options={chartOptions}
        slotProps={{ loading: { py: 2.5 } }}
        sx={{
          my: 1,
          mx: 'auto',
          width: 300,
          height: 300,
        }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <ChartLegends
        labels={selectedSeries.map((item) => item.name)}
        colors={chartColors}
        sx={{ p: 3, justifyContent: 'center' }}
      />
    </Card>
  );
}
