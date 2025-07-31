import 'flag-icons/css/flag-icons.min.css';

import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { useEffect, useCallback, useState, useRef } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Pagination from '@mui/material/Pagination';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import axios, { endpoints } from 'src/lib/axios';

import { Iconify } from 'src/components/iconify';
import { SocialMediaLinks } from 'src/components/social-media-links';

import { CandidateCVDisplay } from './candidate-cv-display'; // Import your detailed CV component

const rowsPerPage = 10;

export function CandidateListTable() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [availableCountries, setAvailableCountries] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [jobTitles, setJobTitles] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loadingCV, setLoadingCV] = useState(false);

  const [selectedCandidate, setSelectedCandidate] = useState(null); // <-- New state for selected candidate

  const cacheRef = useRef({});

  countries.registerLocale(enLocale);

  const getCountryName = (code) => countries.getName(code, 'en') || code;

  const getCacheKey = (pageNum) =>
    JSON.stringify({
      page: pageNum,
      searchQuery,
      selectedDomain,
      sortOrder,
      selectedCountry,
      selectedJobTitle,
      selectedSkills,
    });

  const fetchIndustries = useCallback(async () => {
    try {
      const response = await axios.get(endpoints.candidates.aggregations, {
        params: { includeIndustries: true, includeCountries: true, includeExperience: true }, // includeCountries added
      });

      const bucketsIndustries =
        response.data?.data?.body?.aggregations?.available_industries?.buckets || [];
      const bucketsCountries =
        response.data?.data?.body?.aggregations?.available_countries?.buckets || [];
      const bucketsJobTitles =
        response.data?.data?.body?.aggregations?.available_job_titles?.values?.buckets || [];
      const bucketsSkills =
        response.data?.data?.body?.aggregations?.available_skills?.values?.buckets || [];
      setDomains(bucketsIndustries.map((b) => b.key));
      setAvailableCountries(bucketsCountries.map((b) => b.key));
      setJobTitles(bucketsJobTitles.map((b) => b.key));
      setSkills(bucketsSkills.map((b) => b.key));
    } catch (error) {
      console.error('Failed to fetch industries and countries:', error);
    }
  }, []);

  const fetchCandidates = useCallback(
    async (pageNum) => {
      const cacheKey = getCacheKey(pageNum);

      if (cacheRef.current[cacheKey]) {
        setCandidates(cacheRef.current[cacheKey]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(endpoints.candidates.search, {
          params: {
            query: searchQuery || undefined,
            industries: selectedDomain ? [selectedDomain] : undefined,
            sortBy: sortOrder ? 'candidate.experience_years' : undefined,
            countries: selectedCountry ? [selectedCountry] : undefined,
            jobTitles: selectedJobTitle ? [selectedJobTitle] : undefined,
            skills: selectedSkills.length > 0 ? selectedSkills : undefined,
            sortOrder: sortOrder || undefined,
            page: pageNum,
            size: rowsPerPage,
          },
        });

        const fetchedCandidates = response.data.data.items || [];
        cacheRef.current[cacheKey] = fetchedCandidates;
        setCandidates(fetchedCandidates);
      } catch (err) {
        console.error('Error fetching candidates:', err);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, selectedDomain, selectedCountry, sortOrder, selectedJobTitle, selectedSkills]
  );

  useEffect(() => {
    fetchIndustries();
  }, [fetchIndustries]);

  useEffect(() => {
    fetchCandidates(page);
  }, [page, fetchCandidates]);

  useEffect(() => {
    cacheRef.current = {};
    setPage(1);
  }, [searchQuery, selectedDomain, selectedCountry, sortOrder, selectedJobTitle, selectedSkills]);

  const handleDomainChange = (e) => {
    setSelectedDomain(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput.trim());
    }
  };

  const totalPages = page + (candidates.length === rowsPerPage ? 1 : 0);

  // -- Show detailed CV view if selectedCandidate is set --
  if (selectedCandidate) {
    return (
      <Box>
        <CandidateCVDisplay data={selectedCandidate} onReset={() => setSelectedCandidate(null)} />
      </Box>
    );
  }

  // -- Else show the normal table list --
  return (
    <>
      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr',
              lg: 'repeat(3, 1fr)',
            },
          }}
        >
          <TextField
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search by name, email, phone, industry, or position"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: { xs: '100%', md: 200 } }}
          />

          <TextField
            select
            label="Filter by Industry"
            value={selectedDomain}
            onChange={handleDomainChange}
            sx={{ flex: 1, minWidth: { xs: '100%', md: 200 } }}
          >
            <MenuItem value="">All</MenuItem>
            {domains.map((domain) => (
              <MenuItem key={domain} value={domain}>
                {domain}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Filter by Country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            sx={{ flex: 1, minWidth: { xs: '100%', md: 200 } }}
          >
            <MenuItem value="">All</MenuItem>
            {availableCountries.map((countryCode) => (
              <MenuItem key={countryCode} value={countryCode}>
                <span
                  className={`fi fi-${countryCode.toLowerCase()}`}
                  style={{ marginRight: '8px', width: '20px', display: 'inline-block' }}
                />
                {getCountryName(countryCode)}
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            options={jobTitles}
            value={selectedJobTitle || null}
            onChange={(e, newValue) => setSelectedJobTitle(newValue || '')}
            renderInput={(params) => (
              <TextField {...params} label="Filter by Job Title" placeholder="All" />
            )}
            sx={{ flex: 1, minWidth: { xs: '100%', md: 200 } }}
            isOptionEqualToValue={(option, value) => option === value}
          />
          <Autocomplete
            options={skills}
            multiple
            value={selectedSkills}
            onChange={(e, newValue) => setSelectedSkills(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Filter by Skills" placeholder="All" />
            )}
            sx={{ flex: 1, minWidth: { xs: '100%', md: 200 } }}
            isOptionEqualToValue={(option, value) => option === value}
          />
          <TextField
            select
            label="Sort by Experience"
            value={sortOrder}
            onChange={handleSortChange}
            sx={{ flex: 1, minWidth: { xs: '100%', md: 200 } }}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="asc">Low to High</MenuItem>
            <MenuItem value="desc">High to Low</MenuItem>
          </TextField>
        </Box>
      </Box>

      {/* Loader */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table aria-label="candidate list table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Industry</TableCell>
                  <TableCell>Experience (Years)</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>Social Media</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>View CV</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.map((candidateData) => {
                  const fullName = candidateData?.candidate?.full_name || 'Unknown';
                  const email = candidateData?.candidate?.email || 'N/A';
                  const phone = candidateData?.candidate?.phone || 'N/A';
                  const industry = candidateData?.candidate?.industry || 'N/A';
                  const experienceYears = candidateData?.candidate?.experience_years || 'N/A';

                  return (
                    <TableRow key={candidateData.cv_id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 1 }} />
                          {fullName}
                        </Box>
                      </TableCell>
                      <TableCell>{phone}</TableCell>
                      <TableCell>{email}</TableCell>
                      <TableCell>{industry}</TableCell>
                      <TableCell>{experienceYears}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <SocialMediaLinks social_media={candidateData?.social_media} />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            alignItems: 'center',
                          }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setSelectedCandidate(candidateData)}
                          >
                            View
                          </Button>

                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            disabled={loadingCV === candidateData.processing_details?.cv_hash}
                            onClick={async () => {
                              const hash = candidateData.processing_details?.cv_hash;
                              if (!hash) return;

                              setLoadingCV(hash);
                              try {
                                const res = await axios.get(`${endpoints.cv.open}/${hash}`);
                                const cvUrl = res.data?.data?.[0];
                                if (cvUrl) window.open(cvUrl, '_blank');
                              } catch (err) {
                                console.error('Error fetching CV link:', err);
                              } finally {
                                setLoadingCV(null);
                              }
                            }}
                          >
                            {loadingCV === candidateData.processing_details?.cv_hash ? (
                              <CircularProgress size={20} />
                            ) : (
                              'Original'
                            )}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, newPage) => {
                if (newPage > totalPages) return;
                setPage(newPage);
              }}
              color="primary"
            />
          </Box>
        </>
      )}
    </>
  );
}
