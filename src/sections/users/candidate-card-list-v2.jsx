// CandidateCardListV2.jsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Pagination from '@mui/material/Pagination';

import CandidateCardV2 from './candidate-card-v2';
import CandidateCVDisplay from './candidate-cv-display';
import FilterSearchBar from './filter-search-bar';

import useCandidateFilter from './use-candidate-filter'; // your custom hook

export default function CandidateCardListV2() {
  const {
    search,
    setSearch,
    filtersConfig,
    candidatesToShow,
    page,
    setPage,
    totalPages,
    rowsPerPage,
  } = useCandidateFilter(6);

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleSearchSubmit = () => {
    setPage(1); // reset to first page on new search
  };

  if (selectedCandidate) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', px: 2 }}>
        <CandidateCVDisplay data={selectedCandidate} onReset={() => setSelectedCandidate(null)} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 2 }}>
      {/* Filter & Search Bar */}
      <Box sx={{ mb: 3 }}>
        <FilterSearchBar
          searchValue={search}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearchSubmit}
          filtersConfig={filtersConfig}
          mainFiltersCount={3} // show first 3 filters inline, rest in popover
        />
      </Box>

      {/* Candidate Cards Grid */}
      <Grid container spacing={3}>
        {candidatesToShow.length > 0 ? (
          candidatesToShow.map((candidate) => (
            <Grid xs={12} md={6} key={candidate.cv_id}>
              <CandidateCardV2
                candidateData={candidate}
                onSelect={() => setSelectedCandidate(candidate)}
              />
            </Grid>
          ))
        ) : (
          <Box sx={{ width: '100%', textAlign: 'center', mt: 4 }}>No candidates found.</Box>
        )}
      </Grid>

      {/* Pagination */}
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
    </Box>
  );
}
