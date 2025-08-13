import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';

import CandidateCard from './candidate-card';
import FilterSearchBar from './filter-search-bar';
import CandidateCVDisplay from './candidate-cv-display';
import axios, { endpoints } from 'src/lib/axios';
import countriesList from 'i18n-iso-countries';

export default function CandidateCardList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [filters, setFilters] = useState({
    // jobTitleRoles: '',
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
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCV, setLoadingCV] = useState(false);

  const [filterOptions, setFilterOptions] = useState({
    // jobTitles: [],
    countries: [],
    industries: [],
    skills: [],
    majors: [],
    degrees: [],
  });

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
          // jobTitles: mapBuckets(agg.available_job_titles?.buckets),
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

  useEffect(() => setPage(1), [filters, search]);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const normalize = (val) => (typeof val === 'string' ? val.replace(/\s+/g, '-') : val);

        const params = {
          ...(search ? { query: search } : {}),
          // ...(filters.jobTitleRoles ? { jobTitleRoles: normalize(filters.jobTitleRoles) } : {}),
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
        const totalCount = res.data?.data?.total?.value || items.length;

        setCandidates(items);
        setTotalPages(Math.ceil(totalCount / size));
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setCandidates([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [search, filters, page]);

  const handleSearchInputChange = (value) => setSearchInput(value);
  const handleSearchSubmit = () => setSearch(searchInput.trim());
  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const handleViewCV = async (candidate) => {
    setLoadingCV(true);
    try {
      const res = await axios.get(`${endpoints.candidates.one(candidate.id)}`);
      const fullData = res.data?.data;
      setSelectedCandidate(fullData);
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
    // {
    //   key: 'jobTitleRoles',
    //   label: 'Job Title',
    //   type: 'select',
    //   options: filterOptions.jobTitles,
    //   value: filters.jobTitleRoles,
    //   onChange: (val) => handleFilterChange('jobTitleRoles', val),
    // },
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
    </Box>
  );
}
