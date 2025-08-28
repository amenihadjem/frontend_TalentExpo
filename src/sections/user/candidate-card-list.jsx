import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import {
  MenuItem,
  Select,
  InputLabel,
  Card,
  Stack,
  Skeleton,
  CardContent,
  Divider,
} from '@mui/material';
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
  const [loadingOdoo, setLoadingOdoo] = useState(false);

  // Cache system
  const [cache, setCache] = useState(new Map());
  const [currentCacheKey, setCurrentCacheKey] = useState('');

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

  // Helper function to generate cache key
  const generateCacheKey = (searchTerm, filtersObj, sortByVal, sortOrderVal, pageNum, sizeVal) => {
    const filterStr = JSON.stringify(filtersObj);
    return `${searchTerm}-${filterStr}-${sortByVal}-${sortOrderVal}-${pageNum}-${sizeVal}`;
  };

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

  // Reset page when filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [filters, search, sortBy, sortOrder]);

  const normalize = (val) => (typeof val === 'string' ? val.trim().replace(/\s+/g, '-') : val);

  useEffect(() => {
    const fetchCandidates = async () => {
      const cacheKey = generateCacheKey(search, filters, sortBy, sortOrder, page, size);

      if (cache.has(cacheKey)) {
        const cachedData = cache.get(cacheKey);
        setCandidates(cachedData.candidates);
        setTotalPages(cachedData.totalPages);
        setTotalCount(cachedData.totalCount);
        setCurrentCacheKey(cacheKey);
        console.log('Using cached data for page:', page, 'Cache key:', cacheKey);
        return;
      }

      setLoading(true);
      try {
        // Calculate total pages and adjust size for the last page
        const actualTotalPages = Math.max(1, Math.ceil(totalCount / size));
        const isLastPage = page === actualTotalPages;
        const remainingItems = totalCount - (page - 1) * size;
        const adjustedSize =
          isLastPage && remainingItems > 0 ? Math.min(size, remainingItems) : size;

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
          size: adjustedSize,
          ...(sortBy ? { sortBy } : {}),
          ...(sortOrder ? { sortOrder } : {}),
        };

        console.log('API Request Params:', params);
        const res = await axios.get(endpoints.candidates.search, { params });
        const items = res.data?.data?.items || [];
        const total = res.data?.data?.total?.value || 0;
        console.log(`Page ${page}:`, items, `Total: ${total}, Adjusted Size: ${adjustedSize}`);

        // Recalculate total pages with updated total
        const newTotalPages = Math.max(1, Math.ceil(total / size));

        // If the requested page exceeds the total pages, adjust it
        if (page > newTotalPages && newTotalPages !== 0) {
          console.log(`Adjusting page from ${page} to ${newTotalPages}`);
          setPage(newTotalPages);
          setLoading(false);
          return;
        }

        setCandidates(items);
        setTotalPages(newTotalPages);
        setTotalCount(total);

        const cacheData = {
          candidates: items,
          totalPages: newTotalPages,
          totalCount: total,
          timestamp: Date.now(),
        };

        setCache((prevCache) => {
          const newCache = new Map(prevCache);
          newCache.set(cacheKey, cacheData);
          if (newCache.size > 50) {
            const entries = Array.from(newCache.entries());
            entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
            return new Map(entries.slice(0, 50));
          }
          return newCache;
        });

        setCurrentCacheKey(cacheKey);

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
        setOpenToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [search, filters, page, size, sortBy, sortOrder]);

  const handleSearchInputChange = (value) => setSearchInput(value);

  const handleSearchSubmit = () => {
    const newSearch = searchInput.trim();
    if (newSearch !== search) {
      setCache(new Map());
      setPage(1);
    }
    setSearch(newSearch);
  };

  const handleFilterChange = (key, value) => {
    setCache(new Map());
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSortChange = (newSortBy) => {
    setCache(new Map());
    setSortBy(newSortBy);
  };

  const handleSortOrderChange = (newSortOrder) => {
    setCache(new Map());
    setSortOrder(newSortOrder);
  };

  const handlePageSizeChange = (newSize) => {
    setCache(new Map());
    setSize(newSize);
    setPage(1);
  };

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

  const handleGoToSecondLastPage = () => {
    if (totalPages > 1) {
      setPage(totalPages - 1);
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
    <Box sx={{ width: 900, mx: 'auto', px: 2 }}>
      {!loading && (
        <Box
          sx={{ fontSize: '30px', fontWeight: 'bold', color: 'primary.main', mt: { xs: 1, sm: 0 } }}
        >
          {displayCount} candidate{totalCount !== 1 ? 's' : ''} found
          {cache.size > 0 && (
            <Box component="span" sx={{ fontSize: '0.8em', color: 'text.secondary', ml: 1 }}>
              ({cache.size} pages cached)
            </Box>
          )}
        </Box>
      )}
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
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="experience">Experience</MenuItem>
            <MenuItem value="connections">Connections</MenuItem>
            <MenuItem value="job_start_date">Job Start Date</MenuItem>
          </Select>
          <Select
            value={sortOrder}
            size="small"
            onChange={(e) => handleSortOrderChange(e.target.value)}
          >
            <MenuItem value="asc">Asc</MenuItem>
            <MenuItem value="desc">Desc</MenuItem>
          </Select>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: { xs: 1, sm: 0 } }}>
          <TextField
            type="number"
            label="Page Size"
            value={size}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            size="small"
            sx={{ width: 140 }}
            inputProps={{ min: 1, max: 50 }}
          />{' '}
          <Button variant="contained" size="small" onClick={handleSearchSubmit}>
            Search
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ width: '100%', textAlign: 'center', py: 6 }}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <Card
              sx={{
                height: { xs: 'auto', sm: 320 },
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                p: 2,
                my: 2,
                width: 870,
                gap: 2,
              }}
            >
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
                  <Skeleton variant="circular" width={64} height={64} sx={{ mx: 'auto' }} />
                  <Skeleton variant="text" width={120} sx={{ mx: 'auto' }} />
                  <Skeleton variant="text" width={80} sx={{ mx: 'auto' }} />
                </Box>
              </Stack>
              <CardContent sx={{ flex: 1 }}>
                <Skeleton variant="text" width={200} height={32} />
                <Skeleton variant="text" width={300} height={24} />
                <Skeleton variant="rectangular" width={600} height={80} sx={{ my: 2 }} />
                <Skeleton variant="text" width={180} height={24} />
                <Skeleton variant="rectangular" width={600} height={40} sx={{ my: 2 }} />
              </CardContent>
            </Card>
          ))}
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
              <Box sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
                {totalCount > 0 && page === totalPages
                  ? 'No more candidates available.'
                  : 'No candidates found.'}
              </Box>
            )}
          </Grid>

          {totalPages > 1 && (
            <Box
              sx={{
                mt: 4,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ color: 'text.secondary', fontSize: '0.9em' }}>
                Page {page} of {totalPages}
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={handleGoToSecondLastPage}
                disabled={totalPages <= 1 || page === totalPages - 1}
              >
                Go to Second-to-Last Page
              </Button>
              <Pagination
                page={page}
                count={totalPages}
                shape="circular"
                onChange={(e, newPage) => setPage(newPage)}
                siblingCount={1}
                boundaryCount={1}
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
        <Alert
          severity={candidates.length > 0 || totalCount === 0 ? 'info' : 'error'}
          sx={{ width: '100%' }}
        >
          {totalCount > 0 || candidates.length > 0
            ? `${displayCount} candidate${totalCount !== 1 ? 's' : ''} found`
            : 'Error fetching candidates'}
        </Alert>
      </Snackbar>
    </Box>
  );
}
