// src/sections/user/candidate-list-table.jsx
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

import FilterSearchBar from './filter-search-bar';
import CandidateCVDisplay from './candidate-cv-display';
import { SocialMediaLinks } from 'src/components/social-media-links';
import axios, { endpoints } from 'src/lib/axios';
import countriesList from 'i18n-iso-countries';
import { useTheme } from '@mui/material/styles'; // add this at the top

export default function CandidateListTable() {
  const size = 10; // rows per page

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const theme = useTheme(); // access theme

  const [filters, setFilters] = useState({
    countries: '',
    industries: '',
    skills: [],
    majors: [],
    degrees: '',
  });

  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    industries: [],
    skills: [],
    majors: [],
    degrees: [],
  });

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loadingCV, setLoadingCV] = useState(false);

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

  // Reset page on search/filter change
  useEffect(() => setPage(1), [search, filters]);

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
        const totalCount = res.data?.data?.total?.value || items.length;

        console.log('Fetched candidates:', items);
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
                      {c.phone_numbers?.map((p) => p.number || '').join(', ') || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {c.emails?.map((e) => e.address || '').join(', ') || 'N/A'}
                    </TableCell>
                    <TableCell>{c.industry || c.job_title || 'N/A'}</TableCell>
                    <TableCell>{c.inferred_years_experience ?? 'N/A'}</TableCell>
                    <TableCell>
                      <SocialMediaLinks
                        social_media={[c.linkedin_url, c.facebook_url].filter(Boolean)}
                      />
                    </TableCell>
                    <TableCell>{c.location_country || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="primary"
                        sx={{ textTransform: 'none' }} // optional: prevent uppercase
                        onClick={() => handleViewCV(c)}
                      >
                        View CV
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
    </Box>
  );
}
