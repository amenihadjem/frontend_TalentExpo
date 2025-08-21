import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import { MenuItem, Select, InputLabel } from '@mui/material';
import Button from '@mui/material/Button';

import CandidateCard from './candidate-card';
import FilterSearchBar from './filter-search-bar';
import CandidateCVDisplay from './candidate-cv-display';
import axios, { endpoints } from 'src/lib/axios';
import countriesList from 'i18n-iso-countries';

export default function CandidateCardList() {
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

  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCV, setLoadingCV] = useState(false);
  const [openToast, setOpenToast] = useState(false);

  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    industries: [],
    skills: [],
    majors: [],
    degrees: [],
    jobTitles: [],
  });

  const [lastTrigger, setLastTrigger] = useState({ search: '', filters: {} });

  // Sorting
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

  useEffect(() => setPage(1), [filters, search, size, sortBy, sortOrder]);

  const normalize = (val) => (typeof val === 'string' ? val.trim().replace(/\s+/g, '-') : val);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
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
          size: size * 3,
          ...(sortBy ? { sortBy } : {}),
          ...(sortOrder ? { sortOrder } : {}),
        };

        const res = await axios.get(endpoints.candidates.search, { params });
        const allItems = res.data?.data?.items || [];
        const total = res.data?.data?.total?.value || allItems.length;

        const validCandidates = allItems.filter(
          (c) =>
            (c.cv_metadata?.summary || c.summary || '').trim() !== '' ||
            (Array.isArray(c.skills) && c.skills.length > 0) ||
            (Array.isArray(c.education) && c.education.length > 0)
        );

        const pageCandidates = validCandidates.slice(0, size);

        setCandidates(pageCandidates);
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
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 2 }}>
      <Box sx={{ mb: 3 }}>
        <FilterSearchBar
          searchValue={searchInput}
          onSearchChange={handleSearchInputChange}
          onSearchSubmit={handleSearchSubmit}
          filtersConfig={filtersConfig}
          mainFiltersCount={3}
        />
      </Box>

      {/* Sort, Page Size, Results Count, Search Button */}
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

      {loading ? (
        <Box sx={{ width: '100%', textAlign: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {candidates.length > 0 ? (
              candidates.map((candidate) => (
                <Grid xs={12} md={6} key={candidate.id}>
                  <CandidateCard
                    candidateData={candidate}
                    onSelect={() => handleViewCV(candidate)}
                    loadingCV={loadingCV}
                  />
                </Grid>
              ))
            ) : (
              <Box sx={{ width: '100%', textAlign: 'center', mt: 4 }}>No candidates found.</Box>
            )}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                page={page}
                count={totalPages}
                shape="circular"
                onChange={(e, newPage) => setPage(newPage)}
              />
            </Box>
          )}
        </>
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
