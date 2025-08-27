import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

export function AnalyticsCandidatesBarChart({ countryCounts }) {
  const theme = useTheme();

  // countryCounts is expected as an array now
  const data = (countryCounts || [])
    .map((item) => ({
      country: item.country.charAt(0).toUpperCase() + item.country.slice(1),
      count: Number(item.count) || 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // top 20

  const chartHeight = data.length > 0 ? data.length * 40 : 300;

  if (data.length === 0) {
    return (
      <Box sx={{ mt: theme.spacing(6), textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Top Candidates Count by Country
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No data available to display.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: theme.spacing(6) }}>
      <Typography variant="h6" gutterBottom>
        Top Candidates Count by Country
      </Typography>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
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
