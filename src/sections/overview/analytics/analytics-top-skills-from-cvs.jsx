import { useState } from 'react';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { Chart, useChart } from 'src/components/chart';
// ----------------------------------------------------------------------

export function AnalyticsTopSkillsFromCVs({
  title = 'Most Frequently Extracted Skills',
  subheader = 'Common skillsets among applicants',
  chart,
  sx,
  ...other
}) {
  const theme = useTheme();
  const [filter, setFilter] = useState('both');

  const handleFilterChange = (_, newFilter) => {
    if (newFilter !== null) setFilter(newFilter);
  };

  const filteredSeries = {
    both: chart.series,
    thisMonth: [chart.series[0]],
    lastMonth: [chart.series[1]],
  }[filter];

  const chartColorsMap = {
    thisMonth: [theme.palette.primary.main],
    lastMonth: [hexAlpha(theme.palette.warning.main, 0.8)],
    both: [theme.palette.primary.main, hexAlpha(theme.palette.warning.main, 0.8)],
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
    colors: chartColorsMap[filter], // ✅ Dynamic color mapping
    stroke: { width: 2, colors: ['transparent'] },
    xaxis: { categories: chart.categories },
    legend: { show: true },
    tooltip: {
      y: {
        formatter: (value) => `${value} mentions`,
      },
    },
    ...chart.options,
  });

  return (
    <Card sx={sx} {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <ToggleButtonGroup value={filter} exclusive onChange={handleFilterChange} size="small">
            <ToggleButton value="both">Both</ToggleButton>
            <ToggleButton value="thisMonth">This Month</ToggleButton>
            <ToggleButton value="lastMonth">Last Month</ToggleButton>
          </ToggleButtonGroup>
        }
      />

      <Chart
        type="bar"
        series={filteredSeries}
        options={chartOptions}
        slotProps={{ loading: { p: 2.5 } }}
        sx={{ pl: 1, py: 2.5, pr: 2.5, height: 450 }}
      />
    </Card>
  );
}
