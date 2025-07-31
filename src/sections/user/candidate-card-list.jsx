// src/sections/user/candidate-card-list.tsx
import 'flag-icons/css/flag-icons.min.css';

import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Pagination from '@mui/material/Pagination';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import axios, { endpoints } from 'src/lib/axios';

import { Iconify } from 'src/components/iconify';

import { CandidateCard } from './candidate-card';
import { CandidateCVDisplay } from './candidate-cv-display'; // New component to show detailed CV

const rowsPerPage = 12;

export function CandidateCardList() {
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

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const cacheRef = useRef({});

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
        params: {
          includeIndustries: true,
          includeCountries: true,
          includeExperience: true,
          includeSkills: true,
        }, // includeCountries added
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
    fetchCandidates(1); // explicitly fetch for page 1 after filters change
  }, [searchQuery, selectedDomain, selectedCountry, sortOrder, selectedJobTitle, selectedSkills]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput.trim());
    }
  };

  const totalPages = page + (candidates.length === rowsPerPage ? 1 : 0);

  // --- NEW: If a candidate is selected, show detailed view with Back button ---
  if (selectedCandidate) {
    return (
      <Box>
        <CandidateCVDisplay data={selectedCandidate} onReset={() => setSelectedCandidate(null)} />
      </Box>
    );
  }

  // --- ELSE: Show list and filters as usual ---
  return (
    <>
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
          />

          <TextField
            select
            label="Industry"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
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
            label="Country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
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
            renderInput={(params) => <TextField {...params} label="Job Title" placeholder="All" />}
            isOptionEqualToValue={(option, value) => option === value}
          />
          <Autocomplete
            multiple
            options={skills}
            value={selectedSkills}
            onChange={(e, newValue) => setSelectedSkills(newValue)}
            renderInput={(params) => <TextField {...params} label="Skills" placeholder="All" />}
            isOptionEqualToValue={(option, value) => option === value}
          />
          <TextField
            select
            label="Sort by Experience"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="asc">Low to High</MenuItem>
            <MenuItem value="desc">High to Low</MenuItem>
          </TextField>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              gap: 3,
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
            }}
          >
            {candidates.map((candidateData) => {
              console.log('Candidate CV hash:', candidateData.processing_details?.cv_hash);
              return (
                <CandidateCard
                  key={candidateData.cv_id}
                  candidateData={candidateData}
                  onSelect={() => setSelectedCandidate(candidateData)}
                />
              );
            })}
          </Box>

          <Pagination
            page={page}
            shape="circular"
            count={totalPages}
            onChange={(e, newPage) => {
              if (newPage > totalPages) return;
              setPage(newPage);
            }}
            sx={{ mt: { xs: 5, md: 8 }, mx: 'auto' }}
          />
        </>
      )}
    </>
  );
}
