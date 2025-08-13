import React from 'react';

import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Stack,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';

export default function CandidateCardV2({ candidateData }) {
  // Extract fields with proper keys matching your data structure
  const name = candidateData?.candidate?.full_name || 'Unknown Name';

  // For title, try experience first then fallback to empty string
  const title = candidateData?.job_title || candidateData?.experience?.[0]?.title?.name || '';

  // Location and country fallback to empty string
  const location = candidateData?.location_name || '';
  const country = candidateData?.location_country || '';

  // Industry and yearsExperience fallback
  const industry = candidateData?.industry || '';
  const yearsExperience =
    candidateData?.yearsExperience ?? candidateData?.inferred_years_experience;

  // Skills array fallback
  const skills = candidateData?.skills || [];

  // Summary text from cv_metadata or summary field
  const summary = candidateData?.cv_metadata?.summary || candidateData?.summary || '';

  // Education array fallback (support degrees and majors as arrays)
  const education = candidateData?.education || [];

  // Social media profiles array (some data may be under `profiles`)
  const profiles = candidateData?.social_media || candidateData?.profiles || [];

  // CV url if available
  const cvUrl = candidateData?.cvUrl || '';

  // Create initials for avatar
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '';

  // Extract LinkedIn and Facebook profiles
  const linkedinProfile = profiles.find((p) => p.network?.toLowerCase() === 'linkedin');
  const facebookProfile = profiles.find((p) => p.network?.toLowerCase() === 'facebook');

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        p: 2,
        width: 870,
        gap: 2,
      }}
    >
      {/* Left Panel */}
      <Stack
        spacing={1}
        alignItems="center"
        sx={{ minWidth: 200, pr: { sm: 2 }, borderRight: { sm: '1px solid #eee' } }}
      >
        <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>{initials}</Avatar>
        <Typography variant="h6" textAlign="center">
          {name}
        </Typography>

        {title && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {title}
          </Typography>
        )}

        {(location || country) && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {location} {country && `(${country})`}
          </Typography>
        )}

        {industry && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {industry}
          </Typography>
        )}

        {typeof yearsExperience === 'number' && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {yearsExperience} years experience
          </Typography>
        )}

        <Stack direction="row" spacing={1}>
          {linkedinProfile && linkedinProfile.url && (
            <Tooltip title="LinkedIn">
              <IconButton
                href={
                  linkedinProfile.url.startsWith('http')
                    ? linkedinProfile.url
                    : `https://${linkedinProfile.url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                <LinkedInIcon sx={{ color: '#00eeff' }} />
              </IconButton>
            </Tooltip>
          )}
          {facebookProfile && facebookProfile.url && (
            <Tooltip title="Facebook">
              <IconButton
                href={
                  facebookProfile.url.startsWith('http')
                    ? facebookProfile.url
                    : `https://${facebookProfile.url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                <FacebookIcon sx={{ color: '#4267B2' }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {/* Right Panel */}
      <CardContent sx={{ flex: 1 }}>
        {/* Summary */}
        {summary && (
          <>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Summary
            </Typography>
            <Typography variant="body2" paragraph>
              {summary}
            </Typography>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Skills
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
              {skills.map((skill, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  sx={{ bgcolor: 'primary.main', borderRadius: 1, px: 1, py: 0.5 }}
                >
                  {skill}
                </Typography>
              ))}
            </Stack>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Education */}
        {education.length > 0 && (
          <>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Education
            </Typography>
            {education.map((edu, idx) => {
              // For flexibility, support degree(s) and major(s) as arrays or strings
              const degree = Array.isArray(edu.degrees) ? edu.degrees.join(', ') : edu.degree || '';
              const major = Array.isArray(edu.majors) ? edu.majors.join(', ') : edu.major || '';
              return (
                <Typography key={idx} variant="body2" gutterBottom>
                  {degree} {major && `- ${major}`} {edu.institution && `(${edu.institution})`}
                </Typography>
              );
            })}
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* CV Buttons */}
        {cvUrl && (
          <Stack direction="row" spacing={1} mt={1}>
            <Button variant="outlined" href={cvUrl} target="_blank" size="small">
              View CV
            </Button>
            <Button variant="contained" href={cvUrl} download size="small">
              Download CV
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
