import { useState, useEffect, useMemo } from 'react';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Chart, useChart, ChartLegends } from 'src/components/chart';
import { Box } from '@mui/material';
import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

// Function to generate distinct colors using HSL
function generateDistinctColors(numColors) {
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const hue = Math.round((i * 360) / numColors);
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  return colors;
}

export function AnalyticsIndustrySkills({
  title = 'Industry Skills Overview',
  subheader,
  sx,
  ...other
}) {
  const theme = useTheme();
  const [chart, setChart] = useState(null);
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [industryColors, setIndustryColors] = useState({});

  const handleFilterChange = (_, newValue) => {
    if (newValue !== null) setSelectedIndustry(newValue);
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(endpoints.analytics.details);
        const heatmap = response.data.data.industry_skills_heatmap;

        const series = heatmap.map((industry) => ({
          name: industry.industry,
          skills: industry.top_skills.map((skill) => ({
            name: skill.skill,
            rating: skill.count,
          })),
        }));

        setChart({ series });
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Memoize industry options
  const industryOptions = useMemo(() => chart?.series.map((item) => item.name) || [], [chart]);
  const uniqueIndustries = useMemo(() => [...new Set(industryOptions)], [industryOptions]);

  // Generate distinct colors
  useEffect(() => {
    const generatedColors = generateDistinctColors(uniqueIndustries.length);
    const colorMap = {};
    uniqueIndustries.forEach((industry, index) => {
      colorMap[industry] = generatedColors[index];
    });
    setIndustryColors(colorMap);
  }, [uniqueIndustries]);

  // Only show selected series
  const selectedSeries = useMemo(
    () =>
      !chart
        ? []
        : selectedIndustry === 'all'
          ? chart.series.slice(0, 6).map((item) => ({
              name: item.name,
              data: item.skills.map((s) => s.rating),
            }))
          : [
              {
                name: selectedIndustry,
                data:
                  chart.series
                    .find((item) => item.name === selectedIndustry)
                    ?.skills.map((s) => s.rating) || [],
              },
            ],
    [chart, selectedIndustry]
  );

  // Colors for the selected series only
  const chartColors = useMemo(
    () => selectedSeries.map((item) => industryColors[item.name] || theme.palette.grey[500]),
    [selectedSeries, industryColors]
  );
  const chartOptions = useChart({
    chart: { type: 'radar' },
    fill: { opacity: 0.48 },
    stroke: { width: 2 },
    colors: chartColors,
    xaxis: {
      categories:
        selectedSeries.length > 0
          ? selectedSeries[0].data.map((_, idx) => chart.series[0].skills[idx].name)
          : [],
    },
    legend: { show: false },
  });

  if (!chart)
    return (
      <Card sx={sx} {...other}>
        Loading...
      </Card>
    );

  return (
    <Card sx={sx} {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          '& .MuiCardHeader-content': { flexGrow: 1, width: '100%' },
          '& .MuiCardHeader-title': { width: '100%', whiteSpace: 'normal', marginBottom: 1 },
          '& .MuiCardHeader-subheader': { width: '100%', whiteSpace: 'normal', marginBottom: 2 },
          '& .MuiCardHeader-action': { width: '100%', ml: 0 },
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
            {industryOptions.slice(0, 6).map((industry) => (
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
        sx={{ my: 1, mx: 'auto', width: '100%', height: 350 }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      {/* Scrollable single-line legend showing only displayed series */}
      <Box sx={{ overflowX: 'auto', px: 3, py: 1 }}>
        <Box sx={{ display: 'inline-flex', whiteSpace: 'nowrap' }}>
          <ChartLegends
            labels={selectedSeries.map((item) => item.name)}
            colors={chartColors}
            sx={{ flexShrink: 0 }}
          />
        </Box>
      </Box>
    </Card>
  );
}

export default AnalyticsIndustrySkills;
