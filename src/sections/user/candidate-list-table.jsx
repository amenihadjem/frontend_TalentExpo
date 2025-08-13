// src/sections/user/candidate-list-table.jsx
import React, { useState } from 'react';
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

import FilterSearchBar from './filter-search-bar'; // your filter component
import CandidateCVDisplay from './candidate-cv-display'; // CV detailed view
import { SocialMediaLinks } from 'src/components/social-media-links'; // social media icons component

import useCandidateFilter from './use-candidate-filter'; // your hook

export default function CandidateListTable() {
  // Use your custom hook (pass rowsPerPage if you want)
  const { search, setSearch, filtersConfig, candidatesToShow, page, setPage, totalPages } =
    useCandidateFilter(10);

  // Local state for showing candidate detail CV
  const [selectedCandidate, setSelectedCandidate] = useState(null);

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
          searchValue={search}
          onSearchChange={setSearch}
          onSearchSubmit={() => setPage(1)} // reset page on new search
          filtersConfig={filtersConfig}
          mainFiltersCount={3} // how many filters show inline
        />
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell>Experience (Years)</TableCell>
              <TableCell>Social Media</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidatesToShow.map((c) => (
              <TableRow key={c.cv_id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 1 }}>{c.candidate.full_name[0]}</Avatar>
                    {c.candidate.full_name}
                  </Box>
                </TableCell>
                <TableCell>{c.candidate.phone || 'N/A'}</TableCell>
                <TableCell>{c.candidate.email || 'N/A'}</TableCell>
                <TableCell>{c.industry}</TableCell>
                <TableCell>{c.yearsExperience}</TableCell>
                <TableCell>
                  <SocialMediaLinks social_media={c.social_media} />
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => setSelectedCandidate(c)}>
                    View CV
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {candidatesToShow.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No candidates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {totalPages > 1 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination page={page} count={totalPages} onChange={(e, val) => setPage(val)} />
        </Box>
      )}
    </Box>
  );
}
