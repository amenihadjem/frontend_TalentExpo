import { useState } from 'react';
import { Box, Grid, Button, Divider, Typography, CircularProgress, Chip } from '@mui/material';
import axios, { endpoints } from 'src/lib/axios';
import { SocialMediaLinks } from 'src/components/social-media-links';

export default function CandidateCVDisplay({ data, onReset }) {
  const [loadingOriginalCV, setLoadingOriginalCV] = useState(false);

  function formatDate(dateStr) {
    if (!dateStr || dateStr === '9999-12-31') return 'Present';
    const options = { year: 'numeric', month: 'short' };
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, options);
  }

  const handleOpenOriginalCV = async () => {
    const hash = data?.processing_details?.cv_hash;
    if (!hash) {
      console.warn('CV hash not available.');
      return;
    }
    setLoadingOriginalCV(true);
    try {
      const res = await axios.get(`${endpoints.cv.open}/${hash}`);
      const cvUrl = res.data?.data?.[0];
      if (cvUrl) window.open(cvUrl, '_blank');
      else console.error('Original CV URL not found');
    } catch (err) {
      console.error('Error fetching original CV link:', err);
    } finally {
      setLoadingOriginalCV(false);
    }
  };

  // Map candidate info from OpenSearch data structure
  const candidate = {
    full_name: data.full_name,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.emails?.[0]?.address || data.work_email || '',
    phone: data.phone_numbers?.[0] || '',
    industry: data.industry,
    job_title: data.job_title,
    job_company_name: data.job_company_name,
    job_company_size: data.job_company_size,
    job_company_industry: data.job_company_industry,
    country: data.location_country || data.countries?.[0] || '',
    locality: data.location_locality,
    region: data.location_region,
    address: data.location_street_address || data.street_addresses?.[0]?.street_address || '',
    linkedin_connections: data.linkedin_connections,
    inferred_years_experience: data.inferred_years_experience,
    inferred_salary: data.inferred_salary,
  };

  // Skills mapping
  const skills = Array.isArray(data.skills)
    ? data.skills.map((s) => ({ name: typeof s === 'string' ? s : s.name || s }))
    : (data.interests || []).map((s) => ({ name: typeof s === 'string' ? s : s.name || s }));

  // Education mapping from nested structure
  const education = (data.education || []).map((edu) => ({
    degree: edu.degrees?.join(', ') || '',
    field_of_study: edu.majors?.join(', ') || '',
    minors: edu.minors?.join(', ') || '',
    graduation_start: edu.start_date ? formatDate(edu.start_date) : '',
    graduation_end: edu.end_date ? formatDate(edu.end_date) : '',
    institution: edu.school?.name || '',
    school_type: edu.school?.type || '',
    school_location: edu.school?.location?.name || '',
    summary: edu.summary || '',
  }));

  // Experience mapping from nested structure
  const experience = (data.experience || []).map((exp) => ({
    job_title: exp.title?.name || '',
    title_role: exp.title?.role || '',
    title_levels: exp.title?.levels?.join(', ') || '',
    start_date: exp.start_date || '',
    end_date: exp.end_date || '',
    company_name: exp.company?.name || '',
    company_size: exp.company?.size || '',
    company_industry: exp.company?.industry || '',
    company_location: exp.company?.location?.name || '',
    summary: exp.summary || '',
    is_primary: exp.is_primary || false,
  }));

  // Social media profiles
  const socialMedia = (data.profiles || []).map((sm) => ({
    platform: sm.network,
    url: sm.url,
    username: sm.username,
  }));

  // CV metadata
  const cvMetadata = {
    summary: data.summary || '',
  };

  // Certifications from nested structure
  const certifications = (data.certifications || []).map((cert) => ({
    name: cert.name,
    organization: cert.organization,
    start_date: cert.start_date,
  }));

  // Languages
  const languages = data.languages || [];

  // Format location display
  const formatLocation = () => {
    const parts = [candidate.locality, candidate.region, candidate.country].filter(Boolean);
    return parts.join(', ') || 'Location not specified';
  };

  // Get country code for flag (assuming country field contains country code)
  const getCountryCode = (country) => {
    // If country is already a 2-letter code, use it; otherwise, you might need a mapping
    return country && country.length === 2 ? country : null;
  };

  const countryCode = getCountryCode(candidate.country);

  return (
    <Box
      sx={{
        p: 3,
        mx: 'auto',
        width: { xs: '100%', md: 1000 }, // fixed width on md+ screens
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Button variant="outlined" onClick={onReset} sx={{ mr: 'auto' }}>
          ← Back to Candidate List
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenOriginalCV}
          disabled={loadingOriginalCV || !data?.processing_details?.cv_hash}
          sx={{ flexShrink: 0 }}
        >
          {loadingOriginalCV ? <CircularProgress size={20} color="inherit" /> : 'Open Original CV'}
        </Button>
      </Box>

      {/* Left + Divider + Right */}
      <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 2 }}>
        {/* LEFT: Picture + Contact + Social */}
        <Box
          sx={{
            width: 250,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Avatar */}
          <Box
            sx={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              backgroundColor: 'primary.main',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 48,
            }}
          >
            {candidate.full_name?.charAt(0)?.toUpperCase() || '?'}
          </Box>

          {/* Contact Info */}
          <Box sx={{ mt: 2, width: '100%' }}>
            <Typography variant="body2">
              <strong>Email: </strong> {candidate.email || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Phone: </strong> {candidate.phone || 'N/A'}
            </Typography>

            <Typography
              variant="body2"
              sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <strong>Location: </strong>
              {countryCode && (
                <img
                  src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
                  alt={`${candidate.country} flag`}
                  style={{ width: 24, height: 18, borderRadius: 2 }}
                />
              )}
              <span>{formatLocation()}</span>
            </Typography>

            {candidate.address && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <strong>Address: </strong>
                <span>{candidate.address}</span>
              </Typography>
            )}
          </Box>

          {/* Social Media */}
          {socialMedia.length > 0 && (
            <Box sx={{ mt: 2, width: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Social Media
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                <SocialMediaLinks social_media={socialMedia} />
              </Box>
            </Box>
          )}
        </Box>

        <Divider orientation="vertical" flexItem />
        {/* RIGHT COLUMN: Name + Role + Summary + Professional Info + Company Info */}
        <Grid item xs={12} sm={8}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {candidate.full_name}
          </Typography>

          {candidate.job_title && (
            <Typography variant="h6" color="primary" sx={{ fontWeight: 500 }}>
              {candidate.job_title}
            </Typography>
          )}

          {candidate.job_company_name && (
            <Typography variant="body1" color="textSecondary">
              at {candidate.job_company_name}
            </Typography>
          )}

          {candidate.industry && (
            <Chip
              label={candidate.industry}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
            />
          )}

          {cvMetadata.summary && (
            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', lineHeight: 1.6 }}>
              {cvMetadata.summary}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Professional Info */}
          {(candidate.inferred_years_experience ||
            candidate.linkedin_connections ||
            candidate.inferred_salary) && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              {candidate.inferred_years_experience && (
                <Typography
                  variant="body2"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  💼 <strong>{candidate.inferred_years_experience}+ years experience</strong>
                </Typography>
              )}
              {candidate.linkedin_connections && (
                <Typography
                  variant="body2"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  🔗{' '}
                  <strong>
                    {candidate.linkedin_connections >= 1000
                      ? `${Math.floor(candidate.linkedin_connections / 1000)}K+`
                      : candidate.linkedin_connections}{' '}
                    connections
                  </strong>
                </Typography>
              )}
              {candidate.inferred_salary && (
                <Typography
                  variant="body2"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  💰 <strong>{candidate.inferred_salary}</strong>
                </Typography>
              )}
            </Box>
          )}

          {/* Company Info */}
          {(candidate.job_company_size || candidate.job_company_industry) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Current Role Details
              </Typography>
              {candidate.job_company_size && (
                <Typography variant="body2">
                  <strong>Company Size: </strong> {candidate.job_company_size}
                </Typography>
              )}
              {candidate.job_company_industry && (
                <Typography variant="body2">
                  <strong>Company Industry: </strong> {candidate.job_company_industry}
                </Typography>
              )}
            </>
          )}
        </Grid>
      </Box>
      <Divider sx={{ my: 3 }} />

      {/* Education & Experience with balanced margins */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Education
          </Typography>
          {education.length > 0 ? (
            education.map((edu, index) => (
              <Box
                key={index}
                sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              >
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}
                </Typography>
                {edu.minors && (
                  <Typography variant="body2" color="textSecondary">
                    Minor: {edu.minors}
                  </Typography>
                )}
                <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                  {edu.institution}
                </Typography>
                {edu.school_type && (
                  <Typography variant="body2" color="textSecondary">
                    {edu.school_type}
                  </Typography>
                )}
                {(edu.graduation_start || edu.graduation_end) && (
                  <Typography variant="body2" color="textSecondary">
                    {edu.graduation_start} - {edu.graduation_end || 'Present'}
                  </Typography>
                )}
                {edu.school_location && (
                  <Typography variant="body2" color="textSecondary">
                    📍 {edu.school_location}
                  </Typography>
                )}
                {edu.summary && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    {edu.summary}
                  </Typography>
                )}
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No education information available
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Experience
          </Typography>
          {experience.length > 0 ? (
            experience.map((exp, index) => (
              <Box
                key={index}
                sx={{
                  mt: 2,
                  p: 2,
                  border: '1px solid',
                  borderColor: exp.is_primary ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  bgcolor: 'transparent',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {exp.job_title}
                  </Typography>
                  {exp.is_primary && <Chip label="Current" color="primary" size="small" />}
                </Box>

                {exp.title_role && (
                  <Typography variant="body2" color="textSecondary">
                    Role: {exp.title_role}
                  </Typography>
                )}

                {exp.title_levels && (
                  <Typography variant="body2" color="textSecondary">
                    Level: {exp.title_levels}
                  </Typography>
                )}

                <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                  {exp.company_name}
                </Typography>

                {(exp.company_size || exp.company_industry) && (
                  <Typography variant="body2" color="textSecondary">
                    {exp.company_size && `${exp.company_size} company`}
                    {exp.company_size && exp.company_industry && ' • '}
                    {exp.company_industry}
                  </Typography>
                )}

                <Typography variant="body2" color="textSecondary">
                  {exp.start_date ? formatDate(exp.start_date) : 'N/A'} -{' '}
                  {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                </Typography>

                {exp.company_location && (
                  <Typography variant="body2" color="textSecondary">
                    📍 {exp.company_location}
                  </Typography>
                )}

                {exp.summary && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {exp.summary}
                  </Typography>
                )}
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No experience information available
            </Typography>
          )}
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Skills Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Skills & Expertise
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {skills.length > 0 ? (
            skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill.name}
                variant="outlined"
                color="primary"
                size="small"
              />
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No skills information available
            </Typography>
          )}
        </Box>
      </Box>

      {/* Languages Section */}
      {languages.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Languages
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {languages.map((lang, index) => (
                <Chip
                  key={index}
                  label={lang.proficiency ? `${lang.name} (Level ${lang.proficiency})` : lang.name}
                  variant="outlined"
                  color="secondary"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </>
      )}

      {/* Certifications Section */}
      {certifications.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Certifications
            </Typography>
            {certifications.map((cert, index) => (
              <Box key={index} sx={{ mt: 1, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ fontWeight: 'bold', lineHeight: 1 }}
                >
                  &#8226;
                </Typography>
                <Box>
                  <Typography variant="body2" component="span" sx={{ fontWeight: 500 }}>
                    {cert.name}
                  </Typography>
                  {cert.organization && (
                    <Typography variant="body2" color="textSecondary">
                      by {cert.organization}
                    </Typography>
                  )}
                  {cert.start_date && (
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(cert.start_date)}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
