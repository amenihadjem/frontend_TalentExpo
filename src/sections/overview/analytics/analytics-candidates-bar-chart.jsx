import React from 'react';
import { Bar, XAxis, YAxis, Tooltip, BarChart, ResponsiveContainer } from 'recharts';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export function AnalyticsCandidatesBarChart({ countryCounts }) {
  const theme = useTheme();

  console.log('countryCounts:', countryCounts);

  const data = Object.entries(countryCounts || {}).map(([country, count]) => ({
    country: country.charAt(0).toUpperCase() + country.slice(1),
    count,
  }));

  const topN = 20;
  const sortedData = data.sort((a, b) => b.count - a.count).slice(0, topN);

  const barHeight = 40;
  const chartHeight = sortedData.length > 0 ? sortedData.length * barHeight : 300;

  // Fallback data to test
  // const sortedData = [
  //   { country: 'USA', count: 10 },
  //   { country: 'France', count: 5 },
  //   { country: 'Germany', count: 7 },
  // ];

  return (
    <Box sx={{ mt: theme.spacing(6) }}>
      <Typography variant="h6" gutterBottom>
        Top {topN} Candidates Count by Country
      </Typography>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          width={700}
          height={chartHeight}
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          layout="vertical"
        >
          <XAxis type="number" stroke={theme.palette.text.secondary} tick={{ fontSize: 12 }} />
          <YAxis
            dataKey="country"
            type="category"
            interval={0}
            width={140}
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 8,
              borderColor: theme.palette.divider,
            }}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Bar dataKey="count" fill={theme.palette.primary.main} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
