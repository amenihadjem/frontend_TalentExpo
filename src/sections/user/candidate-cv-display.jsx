import { Box, Grid, Button, Divider, Typography, CircularProgress } from '@mui/material'; // Import CircularProgress
import { useState } from 'react'; // Import useState
import axios, { endpoints } from 'src/lib/axios'; // Import axios and endpoints

import { SocialMediaLinks } from 'src/components/social-media-links';

export function CandidateCVDisplay({ data, onReset }) {
  const [loadingOriginalCV, setLoadingOriginalCV] = useState(false); // New state for loading original CV

  // Helper function to format date string "YYYY-MM-DD" to "MMM YYYY"
  function formatDate(dateStr) {
    if (!dateStr || dateStr === '9999-12-31') return 'Present';
    const options = { year: 'numeric', month: 'short' };
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, options);
  }

  // New handler for opening the original CV
  const handleOpenOriginalCV = async () => {
    const hash = data?.processing_details?.cv_hash;
    if (!hash) {
      console.warn('CV hash not available for this candidate.');
      return;
    }

    setLoadingOriginalCV(true);
    try {
      const res = await axios.get(`${endpoints.cv.open}/${hash}`);
      const cvUrl = res.data?.data?.[0]; // Assuming the first item in data array is the URL
      if (cvUrl) {
        window.open(cvUrl, '_blank');
      } else {
        console.error('Original CV URL not found in response:', res.data);
      }
    } catch (err) {
      console.error('Error fetching original CV link:', err);
    } finally {
      setLoadingOriginalCV(false);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: '900px',
        margin: 'auto',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      {/* Top action bar with back button and new 'Open Original CV' button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Button variant="outlined" onClick={onReset} sx={{ mr: 'auto' }}>
          ← Back to Candidate List
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenOriginalCV}
          disabled={loadingOriginalCV || !data?.processing_details?.cv_hash} // Disable if loading or hash missing
          sx={{ flexShrink: 0 }} // Prevent button from shrinking
        >
          {loadingOriginalCV ? <CircularProgress size={20} color="inherit" /> : 'Open Original CV'}
        </Button>
      </Box>

      {/* Candidate Info Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 48,
            }}
          >
            {data?.candidate?.full_name?.charAt(0)?.toUpperCase()}
          </Box>
        </Grid>

        <Grid item xs={12} sm={8}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {data?.candidate?.full_name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {data?.candidate?.industry}
            </Typography>

            {/* Summary */}
            {data?.cv_metadata?.summary && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                {data.cv_metadata.summary}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Contact Info */}
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Email: </strong>
              {data?.candidate?.email}
            </Typography>
            <Typography variant="body2">
              <strong>Phone: </strong>
              {data?.candidate?.phone}
            </Typography>
            {/* Country */}
            <Typography
              variant="body2"
              sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <strong>Country: </strong>
              {data?.candidate?.country_code && (
                <img
                  src={`https://flagcdn.com/24x18/${data.candidate.country_code.toLowerCase()}.png`}
                  alt={`${data.candidate.country_name} flag`}
                  style={{ width: 24, height: 18, borderRadius: 2 }}
                />
              )}
              <span>{data?.candidate?.country_name}</span>
            </Typography>

            {/* Address */}
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <strong>Address: </strong>
              <span>{data?.candidate?.address}</span>
            </Typography>

            {/* Social Media Links */}
            {data?.social_media?.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Social Media</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <SocialMediaLinks social_media={data.social_media} />
                </Box>
              </>
            )}
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Education and Experience */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Education
          </Typography>
          {data?.education?.map((edu, index) => (
            <Box key={index} sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {edu.degree} in {edu.field_of_study} ({edu.graduation_year})
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {edu.institution}
              </Typography>
            </Box>
          ))}
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Experience
          </Typography>
          {data?.experience?.map((exp, index) => (
            <Box key={index} sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {exp.job_title} ({formatDate(exp.start_date)} - {formatDate(exp.end_date)})
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {exp.company_name}
              </Typography>
              <Typography variant="body2">{exp.description}</Typography>
            </Box>
          ))}
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Skills and Certifications */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Skills
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {data?.skills?.length ? (
            data.skills.map((skill, index) => (
              <Box
                key={index}
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                }}
              >
                {skill.name}
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No skills info
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3 }}>
          Certifications
        </Typography>
        {data?.certifications?.length ? (
          data.certifications.map((cert, index) => (
            <Box key={index} sx={{ mt: 1, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Typography
                variant="body2"
                component="span"
                sx={{ fontWeight: 'bold', lineHeight: 1 }}
              >
                &#8226;
              </Typography>
              <Typography variant="body2" component="span" sx={{ lineHeight: 1 }}>
                {cert.name} by {cert.provider} ({cert.year})
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            No certifications info
          </Typography>
        )}
      </Box>

      {/* Projects */}
      {data?.projects?.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Projects
            </Typography>
            {data.projects.map((project, index) => (
              <Box key={index} sx={{ mt: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {project.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  {project.role} @ {project.client_or_employer}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {project.description}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Technologies:</strong> {project.technologies_used?.join(', ')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Impact:</strong> {project.impact}
                </Typography>
                {project.project_url && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>URL:</strong>{' '}
                    <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                      {project.project_url}
                    </a>
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
