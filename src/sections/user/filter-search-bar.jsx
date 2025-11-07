import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify'; // adjust or replace if needed
import { Chip, Checkbox, FormControlLabel } from '@mui/material';

export default function FilterSearchBar({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  filtersConfig = [], // [{ key, label, type, options, value, onChange }]
  mainFiltersCount = 3, // how many filters to show inline, rest in popover
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const anchorRef = useRef(null);

  const mainFilters = filtersConfig.slice(0, mainFiltersCount);
  const extraFilters = filtersConfig.slice(mainFiltersCount);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'start', flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, width: '95%' }}>
        {/* Search input */}
        <TextField
          size="small"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ minWidth: 240, flexGrow: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={20} />
              </InputAdornment>
            ),
          }}
        />

        {/* Main Filters inline */}
        {mainFilters.map(({ key, label, type, options, value, onChange }) => {
          if (type === 'select') {
            return (
              <TextField
                key={key}
                select
                label={label}
                size="small"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="">All</MenuItem>
                {options.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            );
          }

          if (type === 'autocomplete') {
            return (
              <Autocomplete
                key={key}
                multiple
                size="small"
                options={options}
                value={value}
                freeSolo={key !== 'countries'} // Disable freeSolo for countries
                onChange={(e, newVal) => onChange(newVal)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={label}
                    placeholder={value.length === 0 ? label : ''}
                    sx={{ minWidth: 300 }}
                  />
                )}
                sx={{
                  minWidth: 400,
                  '& .MuiAutocomplete-inputRoot': {
                    flexWrap: 'wrap',
                    padding: '4px',
                  },
                  '& .MuiAutocomplete-tag': {
                    margin: '2px',
                    height: '24px',
                  },
                  '& .MuiAutocomplete-input': {
                    minWidth: '120px !important', // Ensures typing space
                    flexGrow: 1,
                  },
                }}
                isOptionEqualToValue={(option, val) => option === val}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      key={index}
                      label={option}
                      size="small"
                      sx={{
                        height: '24px',
                        fontSize: '0.75rem',
                        '& .MuiChip-label': {
                          padding: '0 8px',
                        },
                      }}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            );
          }

          if (type === 'checkbox') {
            return (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    size="small"
                  />
                }
                label={label}
                sx={{ minWidth: 140 }}
              />
            );
          }

          // fallback: simple text field
          return (
            <TextField
              key={key}
              label={label}
              size="small"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              sx={{ minWidth: 140 }}
            />
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', width: '5%' }}>
        {/* More filters button */}
        {extraFilters.length > 0 && (
          <>
            <IconButton
              ref={anchorRef}
              onClick={() => setPopoverOpen(true)}
              size="small"
              aria-label="more filters"
            >
              <Iconify icon="ic:outline-filter-list" width={24} height={24} />
            </IconButton>

            <Popover
              open={popoverOpen}
              anchorEl={anchorRef.current}
              onClose={() => setPopoverOpen(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { p: 2, width: 280 } }}
            >
              <Stack spacing={2}>
                {extraFilters.map(({ key, label, type, options, value, onChange }) => {
                  if (type === 'select') {
                    return (
                      <TextField
                        key={key}
                        select
                        label={label}
                        size="small"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        {options.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </TextField>
                    );
                  }

                  if (type === 'autocomplete') {
                    return (
                      <Autocomplete
                        key={key}
                        multiple
                        size="small"
                        options={options}
                        value={value}
                        freeSolo={key !== 'countries'} // Disable freeSolo for countries
                        onChange={(e, newVal) => onChange(newVal)}
                        renderInput={(params) => (
                          <TextField {...params} label={label} placeholder={label} />
                        )}
                        isOptionEqualToValue={(option, val) => option === val}
                      />
                    );
                  }

                  if (type === 'checkbox') {
                    return (
                      <FormControlLabel
                        key={key}
                        control={
                          <Checkbox
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                            size="small"
                          />
                        }
                        label={label}
                      />
                    );
                  }

                  return (
                    <TextField
                      key={key}
                      label={label}
                      size="small"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                    />
                  );
                })}

                <Button variant="contained" onClick={() => setPopoverOpen(false)}>
                  Apply
                </Button>
              </Stack>
            </Popover>
          </>
        )}
      </Box>
    </Box>
  );
}
