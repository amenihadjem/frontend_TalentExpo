import { Box, Grid, Button, Divider, Typography } from '@mui/material';

// Assuming this is where your icon component is
import { SocialMediaLinks } from 'src/components/social-media-links'; // Import the SocialMediaLinks component

export default function CVDisplaySection({ data, onReset }) {
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
            {/* Default or Profile Avatar */}
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
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Address: </strong>
              {data?.candidate?.address}
            </Typography>

            {/* Social Media Links */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Social Media</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <SocialMediaLinks social_media={data?.social_media} />
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Education Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Education
          </Typography>
          {data?.education?.map((edu, index) => (
            <Box key={index} sx={{ mt: 1 }}>
              <Typography variant="body2">
                {edu.degree} in {edu.field_of_study}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {edu.institution} - {edu.graduation_year}
              </Typography>
            </Box>
          ))}
        </Grid>

        {/* Experience Section */}
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Experience
          </Typography>
          {data?.experience?.map((exp, index) => (
            <Box key={index} sx={{ mt: 1 }}>
              <Typography variant="body2">{exp.job_title}</Typography>
              <Typography variant="body2" color="textSecondary">
                {exp.company_name} - {exp.start_date} to Present
              </Typography>
              <Typography variant="body2">{exp.description}</Typography>
            </Box>
          ))}
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Skills & Certifications */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Skills
          </Typography>
          {data?.skills?.map((skill, index) => (
            <Box key={index} sx={{ mt: 1 }}>
              <Typography variant="body2">{skill.name}</Typography>
            </Box>
          ))}
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Certifications
          </Typography>
          {data?.certifications?.map((cert, index) => (
            <Box key={index} sx={{ mt: 1 }}>
              <Typography variant="body2">
                {cert.name} by {cert.provider} ({cert.year})
              </Typography>
            </Box>
          ))}
        </Grid>
      </Grid>

      {/* Upload Another CV Button */}
      <Box textAlign="center" sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={onReset}>
          Upload Another CV
        </Button>
      </Box>
    </Box>
  );
}
