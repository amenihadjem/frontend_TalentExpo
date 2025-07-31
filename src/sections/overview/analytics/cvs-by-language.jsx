import { varAlpha } from 'minimal-shared/utils';

import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

export function CVsByLanguage({
  title = 'Total CVs by language',
  subheader,
  total,
  chart,
  sx,
  ...other
}) {
  const theme = useTheme();

  const chartSeries = chart.series.map((s) => (s.value / total) * 100);

  const chartColors = chart.colors ?? [
    [theme.palette.primary.light, theme.palette.primary.main], // Example: Male
    [hexAlpha(theme.palette.warning.light, 0.8), hexAlpha(theme.palette.warning.main, 0.8)], // Example: Female
    [hexAlpha(theme.palette.info.light, 0.8), hexAlpha(theme.palette.info.main, 0.8)], // Example: Other/Unknown
  ];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors.map((color) => color[1]),
    labels: chart.series.map((item) => item.label), // Example: ['Male', 'Female', 'Other']
    series: chart.series.map((s) => (s.value / total) * 100), // display percentage arc
    stroke: { width: 0 },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: chartColors.map((color) => [
          { offset: 0, color: color[0], opacity: 1 },
          { offset: 100, color: color[1], opacity: 1 },
        ]),
      },
    },
    grid: { padding: { top: -40, bottom: -40 } },
    plotOptions: {
      radialBar: {
        hollow: { margin: 10, size: '32%' },
        track: { margin: 10, background: varAlpha(theme.vars.palette.grey['500Channel'], 0.08) },
        dataLabels: {
          total: { formatter: () => fNumber(total) },
          value: {
            offsetY: 2,
            fontSize: theme.typography.h5.fontSize,
            formatter: (val) => `${fNumber(val)}%`,
          },

          name: { offsetY: -10 },
        },
      },
    },

    ...chart.options,
  });

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Chart
        type="radialBar"
        series={chartSeries}
        options={chartOptions}
        slotProps={{ loading: { p: 4 } }}
        sx={{
          my: 1.5,
          mx: 'auto',
          width: { xs: 260, xl: 260 },
          height: { xs: 340, xl: 360 },
        }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <ChartLegends
        labels={chartOptions?.labels}
        colors={chartOptions?.colors}
        sx={{ p: 3, justifyContent: 'center' }}
      />
    </Card>
  );
}
