import React, { useEffect, useState } from 'react';
import { Box, useTheme, Typography, CircularProgress } from '@mui/material';
import { Card, CardTitle, CardHeader, CardContent } from 'src/components/ui/card';
import axios, { endpoints } from 'src/lib/axios';

const TOP_SKILLS_LIMIT = 5; // Optional: limit top skills

export default function IndustrySkillsHeatmap() {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(endpoints.analytics.details);
        const heatmap = response.data.data.industry_skills_heatmap;

        // Aggregate skill counts across all industries
        const skillCounts = {};
        heatmap.forEach((industry) => {
          industry.top_skills.forEach((s) => {
            skillCounts[s.skill] = (skillCounts[s.skill] || 0) + s.count;
          });
        });

        // Sort skills by total count and keep top N
        const topSkills = Object.entries(skillCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, TOP_SKILLS_LIMIT)
          ?.map(([skill]) => skill);

        setSkills(topSkills);
        setData(heatmap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getColor = (value) => {
    if (value === 0) return theme.palette.grey[theme.palette.mode === 'dark' ? 900 : 200];
    if (value <= 5000) return theme.palette.warning.light;
    if (value <= 15000) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  if (loading) return <CircularProgress />;

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
            gridTemplateColumns: `150px repeat(${data?.length}, 1fr)`,
            gap: 1,
            overflowX: 'auto',
          }}
        >
          {/* Top-left empty cell */}
          <Box />

          {/* Industry headers */}
          {data?.map((industry) => (
            <Box
              key={industry.industry}
              sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}
            >
              {industry.industry}
            </Box>
          ))}

          {/* Rows for each skill */}
          {skills?.map((skill) => (
            <React.Fragment key={skill}>
              <Box sx={{ fontWeight: 500, fontSize: '0.9rem' }}>{skill}</Box>
              {data?.map((industry) => {
                const skillObj = industry.top_skills.find((s) => s.skill === skill);
                const value = skillObj ? skillObj.count : 0;
                return (
                  <Box
                    key={industry.industry}
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
                );
              })}
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
              }}
            />
            <span>0</span>
            <Box
              sx={{
                backgroundColor: theme.palette.warning.light,
                width: 20,
                height: 20,
                borderRadius: 0.5,
              }}
            />
            <span>1–5k</span>
            <Box
              sx={{
                backgroundColor: theme.palette.warning.main,
                width: 20,
                height: 20,
                borderRadius: 0.5,
              }}
            />
            <span>5k–15k</span>
            <Box
              sx={{
                backgroundColor: theme.palette.error.main,
                width: 20,
                height: 20,
                borderRadius: 0.5,
              }}
            />
            <span>15k+</span>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
