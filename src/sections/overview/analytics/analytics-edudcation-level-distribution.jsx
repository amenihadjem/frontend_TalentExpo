import React, { useState, useEffect } from 'react';
import {
  Pie,
  Cell,
  Tooltip,
  PieChart,
  ResponsiveContainer,
} from 'recharts';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';
import axios, { endpoints } from 'src/lib/axios';

export default function AnalyticsEducationLevelDistribution({ title, subheader, chart, ...other }) {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use Minimal theme colors
  const MINIMAL_COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    alpha(theme.palette.primary.main, 0.8),
    alpha(theme.palette.secondary.main, 0.8),
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(endpoints.analytics.details);
        const educationData = response.data?.data?.education_levels || [];
        
        console.log('Raw education data from details endpoint:', educationData);

        // Group similar education levels together
        const grouped = {
          'Bachelor': 0,
          'Master': 0,
          'Associate': 0,
          'Doctorate': 0,
          'PhD': 0,
        };

        educationData.forEach((item) => {
          const key = item.key.toLowerCase();
          
          if (key.includes('bachelor')) {
            grouped['Bachelor'] += item.doc_count;
          } else if (key.includes('master')) {
            grouped['Master'] += item.doc_count;
          } else if (key.includes('associate')) {
            grouped['Associate'] += item.doc_count;
          } else if (key.includes('doctorate')) {
            grouped['Doctorate'] += item.doc_count;
          } else if (key.includes('doctor of philosophy') || key === 'phd') {
            grouped['PhD'] += item.doc_count;
          }
        });

        // Transform to chart format, filter out zero values
        const transformedData = Object.entries(grouped)
          .filter(([key, value]) => value > 0)
          .map(([key, value]) => ({
            name: key,
            value: value,
          }));

        console.log('Grouped education data:', transformedData);
        setData(transformedData);
      } catch (error) {
        console.error('Failed to fetch education data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <Card {...other} sx={{ height: '100%' }}>
        <CardHeader title="Loading..." />
      </Card>
    );
  }

  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader
        title={title || 'Education Level Distribution'}
        subheader={subheader}
        sx={{
          '& .MuiCardHeader-title': {
            fontSize: '1.1rem',
            fontWeight: 600,
            color: theme.palette.text.primary,
          },
          '& .MuiCardHeader-subheader': {
            fontSize: '0.875rem',
            color: theme.palette.text.secondary,
          },
        }}
      />

      <Box sx={{ height: 280, position: 'relative', p: 2 }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={false} // Remove labels from chart
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={MINIMAL_COLORS[index % MINIMAL_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => {
                  const percentage = ((value / total) * 100).toFixed(1);
                  return [`${value.toLocaleString()} (${percentage}%)`, name];
                }}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  borderRadius: theme.shape.borderRadius,
                  color: theme.palette.text.primary,
                  boxShadow: theme.shadows[16],
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
            No education data available
          </Box>
        )}
      </Box>

      {/* Custom Legend Under Chart */}
      {data.length > 0 && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {data.map((entry, index) => {
              const percentage = ((entry.value / total) * 100).toFixed(1);
              return (
                <Box 
                  key={entry.name}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    minWidth: 'fit-content'
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: MINIMAL_COLORS[index % MINIMAL_COLORS.length],
                      flexShrink: 0
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {entry.name} ({percentage}%)
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Card>
  );
}
