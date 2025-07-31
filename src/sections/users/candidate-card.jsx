// src/sections/user/candidate-card.tsx
import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

import axios, { endpoints } from 'src/lib/axios';
import { AvatarShape } from 'src/assets/illustrations';

import { Image } from 'src/components/image';
import { SocialMediaLinks } from 'src/components/social-media-links';

export function CandidateCard({ candidateData, onSelect, sx, ...other }) {
  const { candidate, cv_metadata, experience, social_media, processing_details } = candidateData;

  const fullName = candidate?.full_name || 'Unknown Candidate';
  const jobTitle = experience?.[0]?.job_title || '—';
  const summary = cv_metadata?.summary || 'No summary available';

  const [downloading, setDownloading] = useState(false);

  const handleDownloadCV = async () => {
    if (!processing_details?.cv_hash) return;

    try {
      setDownloading(true);
      const res = await axios.get(`${endpoints.cv.open}/${processing_details.cv_hash}`);
      const cvUrl = res.data?.data?.[0];
      if (cvUrl) window.open(cvUrl, '_blank');
    } catch (error) {
      console.error('Error fetching CV link:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card sx={[{ textAlign: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
      <Box sx={{ position: 'relative' }}>
        <AvatarShape
          sx={{ left: 0, right: 0, zIndex: 10, mx: 'auto', bottom: -26, position: 'absolute' }}
        />

        <Avatar
          alt={fullName}
          sx={{
            left: 0,
            right: 0,
            width: 64,
            height: 64,
            zIndex: 11,
            mx: 'auto',
            bottom: -32,
            position: 'absolute',
          }}
        />

        <Image src="/assets/images/cover/cover_1.jpg" alt="cover" ratio="16/9" />
      </Box>

      <ListItemText
        sx={{ mt: 7, mb: 1 }}
        primary={fullName}
        secondary={jobTitle}
        primaryTypographyProps={{ typography: 'subtitle1' }}
        secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
      />

      <Typography variant="body2" sx={{ px: 2, mb: 1 }}>
        {summary}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <SocialMediaLinks social_media={social_media} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {/* Changed from linking to opening detailed view on the same page */}
        <Button onClick={onSelect} variant="outlined" sx={{ mb: 2 }}>
          View CV
        </Button>
        <Button
          onClick={handleDownloadCV}
          variant="contained"
          sx={{ mb: 2 }}
          disabled={downloading}
        >
          {downloading ? <CircularProgress size={20} /> : 'Open CV'}
        </Button>
      </Box>
    </Card>
  );
}
