import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Chart, useChart } from 'src/components/chart';
import axios, { endpoints } from 'src/lib/axios';

export function AnalyticsTopSkillsFromCVs({
  title = 'Most Frequently Extracted Skills',
  subheader = 'Common skillsets among applicants',
  sx,
  ...other
}) {
  const theme = useTheme();
  const [filter, setFilter] = useState('both');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(endpoints.analytics.details);
        const heatmap = response.data.data.industry_skills_heatmap;

        // Aggregate top skills across industries
        const skillCounts = {};
        heatmap.forEach((industry) => {
          industry.top_skills.forEach((s) => {
            skillCounts[s.skill] = (skillCounts[s.skill] || 0) + s.count;
          });
        });

        // Sort and pick top 10 skills
        const topSkills = Object.entries(skillCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10);

        const categories = topSkills.map(([skill]) => skill);
        const series = [
          {
            name: 'Mentions',
            data: topSkills.map(([, count]) => count),
          },
        ];

        setChartData({ categories, series });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (_, newFilter) => {
    if (newFilter !== null) setFilter(newFilter);
  };

  const chartColorsMap = {
    both: [theme.palette.primary.main],
    thisMonth: [theme.palette.primary.main],
    lastMonth: [hexAlpha(theme.palette.warning.main, 0.8)],
  };

  const chartOptions = useChart({
    chart: {
      type: 'bar',
      stacked: false,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '60%',
      },
    },
    colors: chartColorsMap[filter],
    stroke: { width: 2, colors: ['transparent'] },
    xaxis: { categories: chartData?.categories || [] },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (value) => `${value} mentions`,
      },
    },
  });

  return (
    <Card sx={sx} {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <ToggleButtonGroup value={filter} exclusive onChange={handleFilterChange} size="small">
            <ToggleButton value="both">All</ToggleButton>
          </ToggleButtonGroup>
        }
      />

      {loading ? (
        <Box sx={{ p: 4 }}>Loading...</Box>
      ) : (
        <Chart
          type="bar"
          series={chartData.series}
          options={chartOptions}
          slotProps={{ loading: { p: 2.5 } }}
          sx={{ pl: 1, py: 2.5, pr: 2.5, height: 550 }}
        />
      )}
    </Card>
  );
}
