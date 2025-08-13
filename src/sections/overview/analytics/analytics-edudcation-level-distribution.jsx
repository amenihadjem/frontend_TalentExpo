import React from 'react';
import {
  Pie,
  Cell,
  Legend,
  Tooltip,
  PieChart,
  // Removed ResponsiveContainer for this test
} from 'recharts';

// Make absolutely sure this path is correct
import { mockedCandidates } from 'src/_mock/mockedCandidates.js';

import { Card, CardTitle, CardHeader, CardContent } from 'src/components/ui/card';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];

const countEducationLevels = (candidates) => {
  console.log('📥 Input candidates (inside countEducationLevels):', candidates);

  if (!Array.isArray(candidates)) {
    console.error("Error: 'candidates' is not an array:", candidates);
    return [];
  }

  const levelCount = {};
  candidates.forEach((candidate) => {
    candidate.education?.forEach((edu) => {
      const level = edu.level || 'Unknown';
      levelCount[level] = (levelCount[level] || 0) + 1;
    });
  });

  const data = Object.entries(levelCount).map(([level, count]) => ({
    name: level,
    value: count,
  }));

  console.log('📊 Education Level Data (inside countEducationLevels):', data);
  return data;
};

export default function AnalyticsEducationLevelDistribution() {
  console.log('🔥 AnalyticsEducationLevelDistribution component started rendering!');

  let data = [];

  try {
    data = countEducationLevels(mockedCandidates);
    console.log('✅ countEducationLevels executed successfully. Data:', data);
  } catch (error) {
    console.error(
      '❌ Error during data calculation in AnalyticsEducationLevelDistribution:',
      error
    );
  }

  console.log('📊 Final Data passed to PieChart:', data);

  return (
    <Card className="w-full max-w-3xl mx-auto mt-6 shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>🎓 Education Level Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px] relative ">
        {data.length > 0 ? (
          // --- TEMPORARY CHANGE FOR DEBUGGING ---
          // Replaced ResponsiveContainer with a fixed-size div
          <div style={{ width: '100%', height: '100%' }}>
            {' '}
            {/* Added margin: 'auto' for centering if desired */}
            <PieChart width={400} height={300}>
              {' '}
              {/* Explicit width and height for PieChart */}
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="55%"
                outerRadius={95}
                label={({ name, percent, value }) =>
                  value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              {data.length > 0 && <Legend verticalAlign="bottom" height={36} />}
            </PieChart>
          </div>
        ) : (
          // --- END TEMPORARY CHANGE ---
          <div className="text-center mt-8 text-muted">No education data available</div>
        )}
      </CardContent>
    </Card>
  );
}
