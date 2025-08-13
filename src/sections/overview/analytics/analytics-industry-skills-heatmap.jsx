import React from 'react';

import { Box, useTheme, Typography } from '@mui/material';

import { Card, CardTitle, CardHeader, CardContent } from 'src/components/ui/card';

const industries = ['Software', 'Data Science', 'Marketing', 'Design'];
const skills = [
  'JavaScript',
  'Python',
  'R',
  'SQL',
  'SEO',
  'Content Writing',
  'Analytics',
  'Figma',
  'Photoshop',
];

const matrix = [
  [30, 45, 25, 0, 0, 0, 0, 0, 0], // Software
  [0, 50, 20, 40, 0, 0, 0, 0, 0], // Data Science
  [0, 0, 0, 0, 15, 25, 30, 0, 0], // Marketing
  [0, 0, 0, 0, 0, 0, 0, 20, 35], // Design
];

export default function IndustrySkillsHeatmap() {
  const theme = useTheme();

  const getColor = (value) => {
    if (value === 0) return theme.palette.grey[theme.palette.mode === 'dark' ? 900 : 200];
    if (value <= 20) return theme.palette.warning.light;
    if (value <= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Industry vs. Skills Heatmap</CardTitle>
        <Typography variant="body2" color="text.secondary">
          Visualizing how frequently each skill appears in different industries
        </Typography>
      </CardHeader>

      <CardContent>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `150px repeat(${skills.length}, 1fr)`,
            gap: 1,
            overflowX: 'auto',
          }}
        >
          <Box />
          {skills.map((skill) => (
            <Box key={skill} sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>
              {skill}
            </Box>
          ))}

          {industries.map((industry, rowIdx) => (
            <React.Fragment key={industry}>
              <Box sx={{ fontWeight: 500, fontSize: '0.9rem' }}>{industry}</Box>
              {matrix[rowIdx].map((value, colIdx) => (
                <Box
                  key={colIdx}
                  sx={{
                    backgroundColor: getColor(value),
                    color:
                      value === 0
                        ? theme.palette.text.disabled
                        : theme.palette.getContrastText(getColor(value)),
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    transition: 'background-color 0.4s ease, color 0.4s ease',
                  }}
                >
                  {value === 0 ? '—' : value}
                </Box>
              ))}
            </React.Fragment>
          ))}
        </Box>

        {/* Legend */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Legend:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: theme.palette.grey[theme.palette.mode === 'dark' ? 900 : 200],
                width: 20,
                height: 20,
                borderRadius: 0.5,
                transition: 'background-color 0.4s ease',
              }}
            />
            <span>0</span>
            <Box
              sx={{
                backgroundColor: theme.palette.warning.light,
                width: 20,
                height: 20,
                borderRadius: 0.5,
                transition: 'background-color 0.4s ease',
              }}
            />
            <span>1–20</span>
            <Box
              sx={{
                backgroundColor: theme.palette.warning.main,
                width: 20,
                height: 20,
                borderRadius: 0.5,
                transition: 'background-color 0.4s ease',
              }}
            />
            <span>21–40</span>
            <Box
              sx={{
                backgroundColor: theme.palette.error.main,
                width: 20,
                height: 20,
                borderRadius: 0.5,
                transition: 'background-color 0.4s ease',
              }}
            />
            <span>41+</span>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
