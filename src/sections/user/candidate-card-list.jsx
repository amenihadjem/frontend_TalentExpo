import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

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
  });

  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const size = 6;
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
  });

  // Track last search/filters to control toast
  const [lastTrigger, setLastTrigger] = useState({ search: '', filters: {} });

  // Fetch filter options
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
        console.log('Aggregations:', agg);

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
        });
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Reset page when filters or search change
  useEffect(() => setPage(1), [filters, search]);

  // Fetch candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const normalize = (val) => (typeof val === 'string' ? val.replace(/\s+/g, '-') : val);

        const params = {
          ...(search ? { query: search } : {}),
          ...(filters.countries ? { countries: normalize(filters.countries) } : {}),
          ...(filters.industries ? { industries: normalize(filters.industries) } : {}),
          ...(filters.skills.length ? { skills: filters.skills.map(normalize).join(',') } : {}),
          ...(filters.majors ? { majors: normalize(filters.majors) } : {}),
          ...(filters.degrees ? { degrees: normalize(filters.degrees) } : {}),
          page,
          size,
        };

        const res = await axios.get(endpoints.candidates.search, { params });
        const items = res.data?.data?.items || [];
        const total = res.data?.data?.total?.value || items.length;

        setCandidates(items);
        setTotalPages(Math.ceil(total / size));
        setTotalCount(total);

        // Show toast only if search or filters changed
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
  }, [search, filters, page, lastTrigger]);

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

      {!loading && (
        <Box sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
          {displayCount} candidate{totalCount !== 1 ? 's' : ''} found
        </Box>
      )}

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
