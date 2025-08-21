import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import { MenuItem, Select, InputLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import FilterSearchBar from './filter-search-bar';
import CandidateCVDisplay from './candidate-cv-display';
import { SocialMediaLinks } from 'src/components/social-media-links';
import axios, { endpoints } from 'src/lib/axios';
import countriesList from 'i18n-iso-countries';
// Fix the jsPDF import
import jsPDF from 'jspdf';

export default function CandidateListTable() {
  const theme = useTheme();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loadingCV, setLoadingCV] = useState(false);
  const [openToast, setOpenToast] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    countries: '',
    industries: '',
    skills: [],
    majors: [],
    degrees: '',
    jobTitleRoles: [],
    minExperience: '',
    maxExperience: '',
    minLinkedinConnections: '',
    maxLinkedinConnections: '',
  });
  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    industries: [],
    skills: [],
    majors: [],
    degrees: [],
    jobTitles: [],
  });
  const [lastTrigger, setLastTrigger] = useState({ search: '', filters: {} });

  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const res = await axios.get(endpoints.candidates.agg, {
          params: {
            includeSkills: true,
            includeLocations: true,
            includeEducation: true,
            includeExperience: true,
            includeCertifications: true,
            includeLanguages: true,
            includeConnections: true,
            includeJobInfo: true,
            includeCompanyInfo: false,
            size: 1000,
          },
        });
        const agg = res.data?.data?.body?.aggregations || {};
        const mapBuckets = (buckets) => (buckets || []).map((b) => b.key);

        const countries = mapBuckets(agg.available_countries?.buckets).map((c) => {
          const name = countriesList.getName(c.toUpperCase(), 'en', { select: 'official' });
          return name || c;
        });

        setFilterOptions({
          countries,
          industries: mapBuckets(agg.available_industries?.buckets),
          skills: mapBuckets(agg.available_skills?.buckets),
          majors: mapBuckets(agg.available_majors?.values?.buckets),
          degrees: mapBuckets(agg.available_degrees?.values?.buckets),
          jobTitles: mapBuckets(agg.available_job_titles?.buckets),
        });
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => setPage(1), [search, filters, size, sortBy, sortOrder]);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const normalize = (val) =>
          typeof val === 'string' ? val.trim().replace(/\s+/g, '-') : val;

        const params = {
          ...(search ? { query: search } : {}),
          ...(filters.countries ? { countries: normalize(filters.countries) } : {}),
          ...(filters.industries ? { industries: normalize(filters.industries) } : {}),
          ...(filters.skills.length ? { skills: filters.skills.map(normalize).join(',') } : {}),
          ...(filters.majors ? { majors: normalize(filters.majors) } : {}),
          ...(filters.degrees ? { degrees: normalize(filters.degrees) } : {}),
          ...(filters.jobTitleRoles.length
            ? { jobTitleRoles: filters.jobTitleRoles.map(normalize).join(',') }
            : {}),
          ...(filters.minExperience ? { minExperience: filters.minExperience } : {}),
          ...(filters.maxExperience ? { maxExperience: filters.maxExperience } : {}),
          ...(filters.minLinkedinConnections
            ? { minLinkedinConnections: filters.minLinkedinConnections }
            : {}),
          ...(filters.maxLinkedinConnections
            ? { maxLinkedinConnections: filters.maxLinkedinConnections }
            : {}),
          page,
          size,
          ...(sortBy ? { sortBy } : {}),
          ...(sortOrder ? { sortOrder } : {}),
        };

        const res = await axios.get(endpoints.candidates.search, { params });
        const allItems = res.data?.data?.items || [];
        const total = res.data?.data?.total?.value || allItems.length;

        setCandidates(allItems);
        setTotalPages(Math.ceil(total / size));
        setTotalCount(total);

        if (
          search !== lastTrigger.search ||
          JSON.stringify(filters) !== JSON.stringify(lastTrigger.filters)
        ) {
          setOpenToast(true);
          setLastTrigger({ search, filters });
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setCandidates([]);
        setTotalPages(1);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [search, filters, page, size, sortBy, sortOrder, lastTrigger]);

  const handleSearchInputChange = (value) => setSearchInput(value);
  const handleSearchSubmit = () => setSearch(searchInput.trim());
  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const handleViewCV = async (candidate) => {
    setLoadingCV(true);
    try {
      const res = await axios.get(`${endpoints.candidates.one(candidate.id)}`);
      setSelectedCandidate(res.data?.data);
    } catch (err) {
      console.error('Error fetching candidate details:', err);
    } finally {
      setLoadingCV(false);
    }
  };

  // Enhanced PDF Download function - same as candidate card
  const handleDownloadCV = (candidate) => {
    try {
      console.log('Starting PDF generation...'); // Debug log

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let y = 25;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      // Two-column layout
      const leftColumnWidth = (contentWidth - 10) / 2; // Left column
      const rightColumnWidth = (contentWidth - 10) / 2; // Right column
      const rightColumnX = margin + leftColumnWidth + 10; // Right column X position

      // Simplified color scheme - mainly black and gray
      const textColor = [0, 0, 0]; // Black
      const grayColor = [100, 100, 100]; // Gray
      const lightGray = [220, 220, 220]; // Light gray for lines

      // Helper function to ensure text is a string
      const safeText = (text) => {
        if (typeof text === 'string') return text;
        if (text === null || text === undefined) return '';
        if (typeof text === 'object') {
          if (text.name) return String(text.name);
          if (text.title) return String(text.title);
          if (text.value) return String(text.value);
          if (text.text) return String(text.text);
          return '';
        }
        return String(text);
      };

      // Extract data from candidate object
      const name = candidate?.full_name || 'Unknown Name';
      const title = candidate?.job_title || '';
      const location = candidate?.location_name || '';
      const country = candidate?.location_country || '';
      const industry = candidate?.industry || '';
      const company = candidate?.job_company_name || '';
      const email = candidate?.emails?.[0]?.address || candidate?.work_email || '';
      const phone = candidate?.phone_numbers?.[0]?.number || '';
      const summary = candidate?.summary || candidate?.bio || '';
      const skills = candidate?.skills || [];
      const experience = candidate?.experience || [];
      const education = candidate?.education || [];

      // Professional profiles
      const profiles = [
        ...(candidate.linkedin_url ? [{ network: 'LinkedIn', url: candidate.linkedin_url }] : []),
        ...(candidate.facebook_url ? [{ network: 'Facebook', url: candidate.facebook_url }] : []),
        ...(candidate.twitter_url ? [{ network: 'Twitter', url: candidate.twitter_url }] : []),
        ...(candidate.github_url ? [{ network: 'GitHub', url: candidate.github_url }] : []),
      ];

      // HEADER - Full width
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(safeText(name).toUpperCase(), margin, y);
      y += 10;

      // Job Title - Full width
      if (title) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(safeText(title), margin, y);
        y += 8;
      }

      // Company - Full width
      if (company) {
        doc.setFontSize(12);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(safeText(company), margin, y);
        y += 15;
      }

      // Contact Information - Right aligned
      const contactStartY = 25;
      let contactY = contactStartY;
      const contactX = pageWidth - margin - 70;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      if (email) {
        doc.text(safeText(`Email: ${email}`), contactX, contactY);
        contactY += 6;
      }
      if (phone) {
        doc.text(safeText(`Phone: ${phone}`), contactX, contactY);
        contactY += 6;
      }
      if (location || country) {
        const locationText =
          `${safeText(location)} ${country ? `, ${safeText(country)}` : ''}`.trim();
        doc.text(safeText(locationText), contactX, contactY);
        contactY += 6;
      }

      // Full width line separator
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 15;

      // Helper function for section headers
      const createSectionHeader = (title, xPos, yPos, width) => {
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(safeText(title), xPos, yPos);

        const textWidth = doc.getTextWidth(safeText(title));
        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.3);
        doc.line(xPos, yPos + 2, xPos + textWidth, yPos + 2);

        return yPos + 12;
      };

      // Start two-column layout
      let leftY = y;
      let rightY = y;

      // LEFT COLUMN

      // PROFESSIONAL SUMMARY - Left column
      if (summary) {
        leftY = createSectionHeader('PROFESSIONAL SUMMARY', margin, leftY, leftColumnWidth);

        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(safeText(summary), leftColumnWidth);
        doc.text(summaryLines, margin, leftY);
        leftY += summaryLines.length * 5 + 15;
      }

      // CORE COMPETENCIES/SKILLS - Left column
      if (skills.length > 0) {
        leftY = createSectionHeader('CORE COMPETENCIES', margin, leftY, leftColumnWidth);

        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const skillsText = skills.map((skill) => safeText(skill)).join(', ');
        const skillsLines = doc.splitTextToSize(skillsText, leftColumnWidth);
        doc.text(skillsLines, margin, leftY);
        leftY += skillsLines.length * 5 + 15;
      }

      // EDUCATION - Left column
      if (education.length > 0) {
        leftY = createSectionHeader('EDUCATION', margin, leftY, leftColumnWidth);

        education.forEach((edu) => {
          const degree = Array.isArray(edu.degrees)
            ? edu.degrees
                .filter((d) => d && safeText(d).trim() !== '')
                .map((d) => safeText(d))
                .join(', ')
            : edu.degree && safeText(edu.degree).trim() !== ''
              ? safeText(edu.degree)
              : '';
          const major = Array.isArray(edu.majors)
            ? edu.majors
                .filter((m) => m && safeText(m).trim() !== '')
                .map((m) => safeText(m))
                .join(', ')
            : edu.major && safeText(edu.major).trim() !== ''
              ? safeText(edu.major)
              : '';
          const institution = safeText(edu.institution || edu.school?.name || '');

          if (degree || major || institution) {
            // Institution name
            if (institution) {
              doc.setFontSize(11);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(textColor[0], textColor[1], textColor[2]);
              const instLines = doc.splitTextToSize(institution, leftColumnWidth);
              doc.text(instLines, margin, leftY);
              leftY += instLines.length * 6 + 1;
            }

            // Degree and major
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const eduText = `${degree}${major ? ` in ${major}` : ''}`;
            if (eduText.trim()) {
              const eduLines = doc.splitTextToSize(safeText(eduText), leftColumnWidth);
              doc.text(eduLines, margin, leftY);
              leftY += eduLines.length * 5 + 1;
            }

            // Dates
            if (edu.dates || (edu.start_date && edu.end_date)) {
              doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
              doc.setFontSize(9);
              const dates = edu.dates || `${safeText(edu.start_date)} - ${safeText(edu.end_date)}`;
              doc.text(safeText(dates), margin, leftY);
              leftY += 6;
              doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            }

            leftY += 8; // Space between education entries
          }
        });
        leftY += 10;
      }

      // RIGHT COLUMN

      // PROFESSIONAL EXPERIENCE - Right column
      if (experience && experience.length > 0) {
        rightY = createSectionHeader(
          'PROFESSIONAL EXPERIENCE',
          rightColumnX,
          rightY,
          rightColumnWidth
        );

        experience.forEach((exp) => {
          // Check if we need more space
          if (rightY > pageHeight - 80) {
            doc.addPage();
            rightY = 30;
            rightY = createSectionHeader(
              'PROFESSIONAL EXPERIENCE (cont.)',
              rightColumnX,
              rightY,
              rightColumnWidth
            );
          }

          // Job Title
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const jobTitle = safeText(
            exp.title || exp.job_title || exp.position || exp.role || 'Position'
          );
          const titleLines = doc.splitTextToSize(jobTitle, rightColumnWidth);
          doc.text(titleLines, rightColumnX, rightY);
          rightY += titleLines.length * 6 + 1;

          // Company
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const companyName = safeText(
            exp.company || exp.company_name || exp.employer || exp.organization || 'Company'
          );
          const companyLines = doc.splitTextToSize(companyName, rightColumnWidth);
          doc.text(companyLines, rightColumnX, rightY);
          rightY += companyLines.length * 5 + 1;

          // Duration
          doc.setFontSize(9);
          doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);

          let startDate = '';
          let endDate = '';

          if (exp.start_date) {
            startDate = safeText(exp.start_date);
          } else if (exp.dates && exp.dates.start) {
            startDate = safeText(exp.dates.start);
          } else if (exp.period && exp.period.start) {
            startDate = safeText(exp.period.start);
          }

          if (exp.end_date) {
            endDate = safeText(exp.end_date);
          } else if (exp.dates && exp.dates.end) {
            endDate = safeText(exp.dates.end);
          } else if (exp.period && exp.period.end) {
            endDate = safeText(exp.period.end);
          } else {
            endDate = 'Present';
          }

          if (startDate) {
            doc.text(`${startDate} - ${endDate}`, rightColumnX, rightY);
            rightY += 6;
          }

          // Description
          const description =
            exp.description || exp.summary || exp.details || exp.responsibilities || '';
          if (description) {
            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            doc.setFontSize(9);
            const descText = safeText(description);
            const descLines = doc.splitTextToSize(descText, rightColumnWidth);
            doc.text(descLines, rightColumnX, rightY);
            rightY += descLines.length * 4 + 5;
          }

          rightY += 10; // Space between experience entries
        });
      }

      // PROFESSIONAL PROFILES - Right column (if space available)
      if (profiles.length > 0) {
        // Add some space
        rightY += 10;

        if (rightY < pageHeight - 60) {
          rightY = createSectionHeader(
            'PROFESSIONAL PROFILES',
            rightColumnX,
            rightY,
            rightColumnWidth
          );

          profiles.forEach((profile) => {
            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            const networkText = safeText(profile.network || 'Unknown');
            const urlText = safeText(profile.url || '');
            const profileText = `${networkText}: ${urlText}`;
            const profileLines = doc.splitTextToSize(profileText, rightColumnWidth);
            doc.text(profileLines, rightColumnX, rightY);
            rightY += profileLines.length * 4 + 3;
          });
        }
      }

      // Footer - Full width
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.setFontSize(8);
      doc.text('Generated by CVFlow', margin, pageHeight - 10);
      doc.text(new Date().toLocaleDateString(), pageWidth - margin - 30, pageHeight - 10);

      console.log('PDF generated successfully'); // Debug log

      // Open PDF in new window
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');

      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 10000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  const filtersConfig = [
    {
      key: 'skills',
      label: 'Skills',
      type: 'autocomplete',
      options: filterOptions.skills,
      value: filters.skills,
      onChange: (val) => handleFilterChange('skills', val),
    },
    {
      key: 'jobTitleRoles',
      label: 'Job Title',
      type: 'autocomplete',
      options: filterOptions.jobTitles,
      value: filters.jobTitleRoles,
      onChange: (val) => handleFilterChange('jobTitleRoles', val),
    },
    {
      key: 'countries',
      label: 'Country',
      type: 'select',
      options: filterOptions.countries,
      value: filters.countries,
      onChange: (val) => handleFilterChange('countries', val),
    },
    {
      key: 'industries',
      label: 'Industry',
      type: 'select',
      options: filterOptions.industries,
      value: filters.industries,
      onChange: (val) => handleFilterChange('industries', val),
    },
    {
      key: 'majors',
      label: 'Education Major',
      type: 'select',
      options: filterOptions.majors,
      value: filters.majors,
      onChange: (val) => handleFilterChange('majors', val),
    },
    {
      key: 'degrees',
      label: 'Education Degree',
      type: 'select',
      options: filterOptions.degrees,
      value: filters.degrees,
      onChange: (val) => handleFilterChange('degrees', val),
    },
    {
      key: 'minExperience',
      label: 'Min Experience (years)',
      type: 'number',
      value: filters.minExperience,
      onChange: (val) => handleFilterChange('minExperience', val),
    },
    {
      key: 'maxExperience',
      label: 'Max Experience (years)',
      type: 'number',
      value: filters.maxExperience,
      onChange: (val) => handleFilterChange('maxExperience', val),
    },
    {
      key: 'minLinkedinConnections',
      label: 'Min LinkedIn Connections',
      type: 'number',
      value: filters.minLinkedinConnections,
      onChange: (val) => handleFilterChange('minLinkedinConnections', val),
    },
    {
      key: 'maxLinkedinConnections',
      label: 'Max LinkedIn Connections',
      type: 'number',
      value: filters.maxLinkedinConnections,
      onChange: (val) => handleFilterChange('maxLinkedinConnections', val),
    },
  ];

  if (selectedCandidate) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', px: 2 }}>
        <CandidateCVDisplay data={selectedCandidate} onReset={() => setSelectedCandidate(null)} />
      </Box>
    );
  }

  const displayCount = totalCount >= 10000 ? '+10k' : totalCount;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
      <Box sx={{ mb: 3 }}>
        <FilterSearchBar
          searchValue={searchInput}
          onSearchChange={handleSearchInputChange}
          onSearchSubmit={handleSearchSubmit}
          filtersConfig={filtersConfig}
          mainFiltersCount={3}
        />
      </Box>

      <Box
        sx={{
          mb: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <InputLabel id="sort-by-label">Sort by:</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortBy}
            size="small"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="experience">Experience</MenuItem>
            <MenuItem value="connections">Connections</MenuItem>
            <MenuItem value="job_start_date">Job Start Date</MenuItem>
          </Select>
          <Select value={sortOrder} size="small" onChange={(e) => setSortOrder(e.target.value)}>
            <MenuItem value="asc">Asc</MenuItem>
            <MenuItem value="desc">Desc</MenuItem>
          </Select>
        </Box>

        {!loading && (
          <Box sx={{ fontWeight: 'bold', color: 'primary.main', mt: { xs: 1, sm: 0 } }}>
            {displayCount} candidate{totalCount !== 1 ? 's' : ''} found
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: { xs: 1, sm: 0 } }}>
          <TextField
            type="number"
            label="Page Size"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            size="small"
            sx={{ width: 140 }}
          />
          <Button variant="contained" size="small" onClick={handleSearchSubmit}>
            Search
          </Button>
        </Box>
      </Box>

      <Paper>
        {loading ? (
          <Box sx={{ width: '100%', textAlign: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Industry / Job Title</TableCell>
                <TableCell>Experience (Years)</TableCell>
                <TableCell>Social Media</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.length > 0 ? (
                candidates.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, bgcolor: theme.palette.primary.main }}>
                          {(c.full_name || 'N/A')[0]}
                        </Avatar>
                        {c.full_name || 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {c.phone_numbers?.map((p) => p.number).join(', ') || 'N/A'}
                    </TableCell>
                    <TableCell>{c.emails?.map((e) => e.address).join(', ') || 'N/A'}</TableCell>
                    <TableCell>{c.industry || c.job_title || 'N/A'}</TableCell>
                    <TableCell>{c.inferred_years_experience ?? 'N/A'}</TableCell>
                    <TableCell>
                      <SocialMediaLinks
                        social_media={[
                          ...(c.linkedin_url
                            ? [{ platform: 'linkedin', url: c.linkedin_url }]
                            : []),
                          ...(c.facebook_url
                            ? [{ platform: 'facebook', url: c.facebook_url }]
                            : []),
                          ...(c.twitter_url ? [{ platform: 'twitter', url: c.twitter_url }] : []),
                          ...(c.instagram_url
                            ? [{ platform: 'instagram', url: c.instagram_url }]
                            : []),
                          ...(c.github_url ? [{ platform: 'github', url: c.github_url }] : []),
                        ]}
                      />
                    </TableCell>
                    <TableCell>{c.location_country || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="primary"
                        sx={{ textTransform: 'none', mr: 1 }}
                        onClick={() => handleViewCV(c)}
                      >
                        View CV
                      </Button>
                      <Button
                        size="small"
                        color="secondary"
                        sx={{ textTransform: 'none' }}
                        onClick={() => handleDownloadCV(c)}
                      >
                        Download_CV
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No candidates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {totalPages > 1 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination page={page} count={totalPages} onChange={(e, val) => setPage(val)} />
        </Box>
      )}

      <Snackbar
        open={openToast}
        autoHideDuration={3000}
        onClose={() => setOpenToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          {displayCount} candidate{totalCount !== 1 ? 's' : ''} found
        </Alert>
      </Snackbar>
    </Box>
  );
}
