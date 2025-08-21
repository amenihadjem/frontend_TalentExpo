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
  Box,
} from '@mui/material';

export default function CandidateCard({ candidateData, onSelect, loadingCV }) {
  const name = candidateData?.full_name || 'Unknown Name';

  const titleRaw =
    candidateData?.job_title ||
    candidateData?.title ||
    candidateData?.experience?.[0]?.title?.name ||
    '';
  const title = titleRaw?.trim();

  const locationRaw = candidateData?.location_name || candidateData?.location || '';
  const location = locationRaw?.trim();

  const countryRaw = candidateData?.location_country || '';
  const country = countryRaw?.trim();

  const industryRaw = candidateData?.industry || '';
  const industry = industryRaw?.trim();

  const yearsExperience =
    candidateData?.yearsExperience ?? candidateData?.inferred_years_experience;

  const skillsRaw = Array.isArray(candidateData?.skills) ? candidateData.skills : [];
  const skills = skillsRaw.filter((s) => typeof s === 'string' && s.trim() !== '');

  const summaryRaw = candidateData?.cv_metadata?.summary || candidateData?.summary || '';
  const summary = summaryRaw?.trim();

  const educationRaw = Array.isArray(candidateData?.education) ? candidateData.education : [];
  const education = educationRaw.filter((edu) => {
    const degree = Array.isArray(edu.degrees) ? edu.degrees.join(', ') : edu.degree || '';
    const major = Array.isArray(edu.majors) ? edu.majors.join(', ') : edu.major || '';
    const institution = edu.institution || '';
    return degree.trim() !== '' || major.trim() !== '' || institution.trim() !== '';
  });

  const profiles = candidateData?.social_media || candidateData?.profiles || [];
  const cvUrl = candidateData?.cvUrl || '';

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '';

  const linkedinProfile = profiles.find((p) => p.network?.toLowerCase() === 'linkedin');
  const facebookProfile = profiles.find((p) => p.network?.toLowerCase() === 'facebook');

  const maxSkills = 7;
  const displayedSkills = skills.slice(0, maxSkills);
  const remainingSkillsCount = skills.length - maxSkills;

  return (
    <Card
      sx={{
        height: { xs: 'auto', sm: 320 },
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
        sx={{
          width: { xs: '100%', sm: 220 },
          flexShrink: 0,
          pr: { sm: 2 },
          borderRight: { sm: '1px solid #eee' },
          height: { xs: 'auto', sm: '100%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mx: 'auto' }}>
            {initials}
          </Avatar>
          <Typography variant="h6">{name}</Typography>

          {title && (
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          )}

          {(location || country) && (
            <Typography variant="body2" color="text.secondary">
              {location} {country && `(${country})`}
            </Typography>
          )}

          {industry && (
            <Typography variant="body2" color="text.secondary">
              {industry}
            </Typography>
          )}

          {typeof yearsExperience === 'number' && (
            <Typography variant="body2" color="text.secondary">
              {yearsExperience} years experience
            </Typography>
          )}
        </Box>

        {/* Social icons */}
        <Stack direction="row" spacing={1}>
          {linkedinProfile?.url && (
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
          {facebookProfile?.url && (
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
      <CardContent
        sx={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: { xs: 'auto', sm: '100%' },
          position: 'relative',
        }}
      >
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

        {skills.length > 0 && (
          <>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Skills
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
              {displayedSkills.map((skill, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  sx={{ bgcolor: 'primary.main', borderRadius: 1, px: 1, py: 0.5 }}
                >
                  {skill}
                </Typography>
              ))}
              {remainingSkillsCount > 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    bgcolor: 'grey.500',
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    color: 'white',
                  }}
                >
                  +{remainingSkillsCount}
                </Typography>
              )}
            </Stack>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {education.length > 0 && (
          <>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Education
            </Typography>
            {education.map((edu, idx) => {
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

        {/* Buttons */}
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              gap: 1,
              p: '4px 6px',
              borderRadius: '8px',
              bgcolor: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(3px)',
            }}
          >
            <Button variant="outlined" href={cvUrl} target="_blank" size="small" onClick={onSelect}>
              View CV
            </Button>
            <Button variant="contained" href={cvUrl} download size="small">
              Download CV
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
