import React, { useState, useEffect, useRef, useCallback } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Skeleton from '@mui/material/Skeleton';
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
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import {
  MenuItem,
  Select,
  InputLabel,
  Badge,
  Checkbox,
  IconButton,
  DialogActions,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add,
  Close,
  Star,
  StarBorder,
  Update,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

import countriesList from 'i18n-iso-countries';
import jsPDF from 'jspdf';

import axios, { endpoints } from 'src/lib/axios';
import { SocialMediaLinks } from 'src/components/social-media-links';
import GeoCircleSelector from 'src/components/map/GeoCircleSelector';

import FilterSearchBar from './filter-search-bar';
import CandidateCVDisplay from './candidate-cv-display';

export default function CandidateListTable() {
  // Fetch saved tabs from API and fetch candidates for each tab

  const [size, setSize] = useState(10);
  // Refs to prevent unnecessary re-fetches
  const isMountedRef = useRef(false);
  const hasInitialSearched = useRef(false);
  const fetchSavedTabsAndCandidates = async (companyId) => {
    try {
      // Fetch tabs from the API with filter parameter
      const tabsRes = await axios.get(endpoints.tabs.search, {
        params: {
          filter: 'type:eq:filter',
        },
      });
      const response = tabsRes.data.data;
      // Handle the new API response format
      const savedTabs = response.items || [];

      if (Array.isArray(savedTabs) && savedTabs.length > 0) {
        // No need to filter since API already returns only filter type tabs

        // Convert API response to tab format
        const formattedTabs = savedTabs.map((savedTab) => ({
          id: savedTab._id,
          name: savedTab.content?.name || 'Saved Tab',
          search: savedTab.content?.search || '',
          filters: savedTab.content?.filters || {},
          params: savedTab.content?.params || {},
          saved: true,
        }));

        // Add a default search tab if no unsaved tabs exist
        const hasUnsavedTab = formattedTabs.some((tab) => !tab.saved);
        if (!hasUnsavedTab) {
          formattedTabs.push({
            name: 'New Search',
            search: '',
            filters: {},
            params: {},
            saved: false,
          });
        }

        setSearchTabs(formattedTabs);

        // Just set up the tabs, don't automatically search
        // Initialize size from the first tab if it has saved params
        if (formattedTabs.length > 0 && formattedTabs[0].params?.size) {
          setSize(formattedTabs[0].params.size);
        }
      } else {
        // Set default tabs if no saved tabs found
        setSearchTabs([
          {
            name: 'Default Search',
            search: '',
            filters: {},
            saved: false,
          },
        ]);
      }
    } catch (err) {
      setSearchTabs([
        {
          id: 1,
          name: 'Default Search',
          search: '',
          filters: {},
          saved: false,
        },
      ]);
      console.error('Error fetching saved tabs:', err);
    }
  };
  // Tab state
  const [searchTabs, setSearchTabs] = useState([
    {
      name: 'Default Search',
      search: '',
      filters: {
        countries: [],
        industries: [],
        skills: [],
        majors: [],
        degrees: [],
        jobTitleRoles: [],
        languages: [],
        minExperience: '',
        maxExperience: '',
        minLinkedinConnections: '',
        maxLinkedinConnections: '',
      },
      saved: false,
    },
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [tabToClose, setTabToClose] = useState(null);
  const theme = useTheme();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loadingCV, setLoadingCV] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Per-tab results cache
  const [tabResults, setTabResults] = useState({});

  const handleSelectRow = (id) => {
    setSelectedRows((prev) => {
      const newSelected = prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id];
      console.log('Selected users:', newSelected);
      return newSelected;
    });
  };
  const [geoLocationStatus, setGeoLocationStatuse] = useState(false);
  const [geoRange, setGeoRange] = useState(null);
  const [loadingOdoo, setLoadingOdoo] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  // Remove global filters state, use per-tab filters
  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    industries: [],
    skills: [],
    majors: [],
    degrees: [],
    jobTitles: [],
    languages: [],
  });
  const [lastTrigger, setLastTrigger] = useState({ search: '', filters: {} });

  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('desc');

  // Define sortable columns
  const tableColumns = [
    { id: 'full_name', label: 'Name', sortable: true },
    { id: 'phone', label: 'Phone', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'industry', label: 'Industry / Job Title', sortable: true },
    { id: 'experience', label: 'Experience (Years)', sortable: true },
    { id: 'social_media', label: 'Social Media', sortable: true },
    { id: 'location_country', label: 'Country', sortable: true },
    { id: 'actions', label: 'Actions', sortable: false },
  ];

  // Local sorting function
  const sortCandidatesLocally = (candidateList, sortField, sortDirection) => {
    const sorted = [...candidateList].sort((a, b) => {
      let aVal, bVal;

      // Handle different field types
      switch (sortField) {
        case 'full_name':
          aVal = (a.full_name || '').toLowerCase();
          bVal = (b.full_name || '').toLowerCase();
          break;
        case 'phone':
          aVal = (a.phone_numbers?.[0]?.number || '').toLowerCase();
          bVal = (b.phone_numbers?.[0]?.number || '').toLowerCase();
          break;
        case 'email':
          aVal = (a.emails?.[0]?.address || '').toLowerCase();
          bVal = (b.emails?.[0]?.address || '').toLowerCase();
          break;
        case 'industry':
          aVal = (a.industry || a.job_title || '').toLowerCase();
          bVal = (b.industry || b.job_title || '').toLowerCase();
          break;
        case 'experience':
          aVal = Number(a.inferred_years_experience) || 0;
          bVal = Number(b.inferred_years_experience) || 0;
          break;
        case 'social_media': {
          // Count social media links for sorting
          const aSocialCount = [
            a.linkedin_url,
            a.facebook_url,
            a.twitter_url,
            a.instagram_url,
            a.github_url,
          ].filter(Boolean).length;
          const bSocialCount = [
            b.linkedin_url,
            b.facebook_url,
            b.twitter_url,
            b.instagram_url,
            b.github_url,
          ].filter(Boolean).length;
          aVal = aSocialCount;
          bVal = bSocialCount;
          break;
        }
        case 'location_country':
          aVal = (a.location_country || '').toLowerCase();
          bVal = (b.location_country || '').toLowerCase();
          break;
        default:
          return 0;
      }

      // Compare values
      if (typeof aVal === 'string') {
        if (sortDirection === 'asc') {
          return aVal.localeCompare(bVal);
        } else {
          return bVal.localeCompare(aVal);
        }
      } else {
        if (sortDirection === 'asc') {
          return aVal - bVal;
        } else {
          return bVal - aVal;
        }
      }
    });
    return sorted;
  };

  // Handle column sorting (local sorting without API calls)
  const handleSort = (columnId) => {
    let newSortOrder;

    if (sortBy === columnId) {
      // Toggle sort order if same column
      newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new column and default to desc
      newSortOrder = 'desc';
    }

    // Update sort state
    setSortOrder(newSortOrder);

    // Update the current tab's params
    setSearchTabs((prev) =>
      prev.map((tab, idx) =>
        idx === activeTab
          ? { ...tab, params: { ...tab.params, sortBy: columnId, sortOrder: newSortOrder } }
          : tab
      )
    );

    // Sort candidates locally without API calls
    const sortedCandidates = sortCandidatesLocally(candidates, columnId, newSortOrder);
    setCandidates(sortedCandidates);

    // Update cached results with sorted data
    const tabKey = `tab-${activeTab}`;
    setTabResults((prev) => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        candidates: sortedCandidates,
        timestamp: Date.now(),
      },
    }));
  };

  // Sortable header component
  const SortableHeaderCell = ({ column, children }) => {
    if (!column.sortable) {
      return <TableCell>{children}</TableCell>;
    }

    const isActive = sortBy === column.id;
    const isAsc = isActive && sortOrder === 'asc';

    return (
      <TableCell
        width={200}
        sx={{
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          fontWeight: isActive ? 600 : 400,
        }}
        onClick={() => handleSort(column.id)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {children}
          {isActive ? (
            isAsc ? (
              <ArrowUpward fontSize="small" color="primary" />
            ) : (
              <ArrowDownward fontSize="small" color="primary" />
            )
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                opacity: 0.3,
                '&:hover': { opacity: 0.7 },
              }}
            >
              <ArrowUpward sx={{ fontSize: 12, lineHeight: 0.5 }} />
              <ArrowDownward sx={{ fontSize: 12, lineHeight: 0.5, mt: -0.5 }} />
            </Box>
          )}
        </Box>
      </TableCell>
    );
  };

  const fetchData = useCallback(async () => {
    // Just fetch saved tabs, don't automatically search
    await fetchSavedTabsAndCandidates('YOUR_COMPANY_ID');
  }, []);

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
          size: false,
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
        languages: mapBuckets(agg.available_languages?.buckets),
        experienceCountries: countries,
      });
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  // OPTIMIZED: Initial data fetch only once
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      fetchFilterOptions();
      fetchData();
    }
  }, []);

  // Initial search on first page load for saved tabs
  useEffect(() => {
    if (searchTabs.length > 0) {
      // Search on the first saved tab if it exists and has search content
      if (searchTabs[activeTab]?.saved && searchTabs[activeTab]?.search) {
        fetchCandidates();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTabs]);

  const fetchCandidates = async () => {
    try {
      const normalize = (val) => (typeof val === 'string' ? val.trim().replace(/\s+/g, '-') : val);

      // Calculate total pages and adjust size for the last page
      const actualTotalPages = Math.max(1, Math.ceil(totalCount / size));
      const isLastPage = page === actualTotalPages;
      const remainingItems = totalCount - (page - 1) * size;
      const adjustedSize = isLastPage && remainingItems > 0 ? Math.min(size, remainingItems) : size;

      const tabFilters = searchTabs[activeTab]?.filters || {};
      const tabSearch = searchTabs[activeTab]?.search?.trim() || '';
      const params = {
        ...(tabSearch ? { query: tabSearch } : {}),
        ...(tabFilters.countries?.length
          ? { countries: tabFilters.countries.map(normalize).join(',') }
          : {}),
        ...(tabFilters.industries?.length
          ? { industries: tabFilters.industries.map(normalize).join(',') }
          : {}),
        ...(tabFilters.skills?.length
          ? { skills: tabFilters.skills.map(normalize).join(',') }
          : {}),
        ...(tabFilters.majors?.length
          ? { majors: tabFilters.majors.map(normalize).join(',') }
          : {}),
        ...(tabFilters.degrees?.length
          ? { degrees: tabFilters.degrees.map(normalize).join(',') }
          : {}),
        ...(tabFilters.jobTitleRoles?.length
          ? { jobTitleRoles: tabFilters.jobTitleRoles.map(normalize).join(',') }
          : {}),
        ...(tabFilters.languages?.length
          ? { languages: tabFilters.languages.map(normalize).join(',') }
          : {}),
        ...(tabFilters.minExperience ? { minExperience: tabFilters.minExperience } : {}),
        ...(tabFilters.maxExperience ? { maxExperience: tabFilters.maxExperience } : {}),
        ...(tabFilters.minLinkedinConnections
          ? { minLinkedinConnections: tabFilters.minLinkedinConnections }
          : {}),
        ...(tabFilters.maxLinkedinConnections
          ? { maxLinkedinConnections: tabFilters.maxLinkedinConnections }
          : {}),
        ...(tabFilters.experienceCountries?.length
          ? { experienceCountries: tabFilters.experienceCountries.map(normalize).join(',') }
          : {}),
        page,
        size: searchTabs[activeTab]?.params?.size || adjustedSize,
        ...(sortBy ? { sortBy } : {}),
        ...(sortOrder ? { sortOrder } : {}),

        lat: tabFilters.countries?.length ? null : geoRange?.lat,
        lon: tabFilters.countries?.length ? null : geoRange?.lng,
        distance: tabFilters.countries?.length
          ? null
          : geoRange?.distance
            ? geoRange?.distance + 'km'
            : null,
      };

      console.log('API Request Params:', params);
      setLoading(true);
      const res = await axios.get(endpoints.candidates.search, { params });
      const allItems = res.data?.data?.items || [];
      const total = res.data?.data?.total || allItems.length;
      console.log(`Page ${page}:`, allItems, `Total: ${total}, Adjusted Size: ${adjustedSize}`);

      // Recalculate total pages with updated total
      const newTotalPages = Math.max(1, Math.ceil(total / size));
      // Recalculate total pages with updated total

      // If the requested page exceeds the total pages, adjust it
      if (page > newTotalPages && newTotalPages !== 0) {
        console.log(`Adjusting page from ${page} to ${newTotalPages}`);
        setPage(newTotalPages);
        setLoading(false);
        return;
      }
      // If the requested page exceeds the total pages, adjust it
      if (page > newTotalPages && newTotalPages !== 0) {
        console.log(`Adjusting page from ${page} to ${newTotalPages}`);
        setPage(newTotalPages);
        setLoading(false);
        return;
      }

      setCandidates(allItems);
      setTotalPages(newTotalPages);
      setTotalCount(total);

      // Cache the results for the current tab
      const tabKey = `tab-${activeTab}`;
      setTabResults((prev) => ({
        ...prev,
        [tabKey]: {
          candidates: allItems,
          totalPages: newTotalPages,
          totalCount: total,
          timestamp: Date.now(),
        },
      }));

      if (
        search !== lastTrigger.search ||
        JSON.stringify(searchTabs[activeTab]?.filters || {}) !== JSON.stringify(lastTrigger.filters)
      ) {
        setOpenToast(true);
        setLastTrigger({ search, filters: searchTabs[activeTab]?.filters || {} });
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setCandidates([]);
      setTotalPages(1);
      setTotalCount(0);
      setOpenToast(true);
    } finally {
      setLoading(false);
      if (searchTabs[activeTab]?.filters?.countries?.length) setGeoLocationStatuse(false);
    }
  };

  // Removed automatic search - only manual search button triggers search

  // Tab logic
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);

    // Update size from the tab's saved parameters
    const selectedTab = searchTabs[newValue];
    if (selectedTab?.params?.size) {
      setSize(selectedTab.params.size);
    }

    // Update sort parameters from the tab's saved parameters
    if (selectedTab?.params?.sortBy) {
      setSortBy(selectedTab.params.sortBy);
    }
    if (selectedTab?.params?.sortOrder) {
      setSortOrder(selectedTab.params.sortOrder);
    }
    if (selectedTab?.params?.page) {
      setPage(selectedTab.params.page);
    }

    // No automatic search - only manual search button
    // Restore cached results for the selected tab if they exist
    const tabKey = `tab-${newValue}`;
    if (tabResults[tabKey]) {
      setCandidates(tabResults[tabKey].candidates);
      setTotalPages(tabResults[tabKey].totalPages);
      setTotalCount(tabResults[tabKey].totalCount);
    } else {
      // Clear candidates only if no cached results exist
      setCandidates([]);
      setTotalPages(1);
      setTotalCount(0);
    }
  };
  const handleNewTab = () => {
    setSearchTabs((prev) => [
      ...prev,
      { name: `Search ${prev.length + 1}`, search: '', filters: {}, saved: false },
    ]);
    setActiveTab(searchTabs.length);
  };
  const handleSaveTab = async () => {
    try {
      // Get current tab data
      const tab = searchTabs[activeTab];

      // Prepare API payload
      const payload = {
        type: 'filter',
        title: tab.name, // Add current tab name as title
        content: {
          name: saveName,
          search: tab.search,
          filters: tab.filters,
          params: {
            page,
            size,
            sortBy,
            sortOrder,
          },
        },
      };

      console.log('Saving tab with payload:', payload);

      // Save to API
      const response = await axios.post(endpoints.tabs.save, payload);

      if (response.data) {
        console.log('Tab saved successfully:', response.data);

        // Update local state
        setSearchTabs((prev) =>
          prev.map((savedTab, idx) =>
            idx === activeTab
              ? {
                  ...savedTab,
                  name: saveName,
                  saved: true,
                  id: response.data._id || response.data.id,
                  params: {
                    page,
                    size,
                    sortBy,
                    sortOrder,
                  },
                }
              : savedTab
          )
        );

        setSaveDialogOpen(false);
        setSaveName('');

        // Show success message
        setOpenToast(true);
      }
    } catch (error) {
      console.error('Error saving tab:', error);
      // You could show an error message to the user here
    }
  };

  const handleUpdateTab = async (tabIndex = activeTab) => {
    try {
      // Get current tab data
      const tab = searchTabs[tabIndex];

      if (!tab.saved || !tab.id) {
        console.error('Cannot update unsaved tab');
        return;
      }

      // Prepare API payload for update (same format as save)
      const payload = {
        type: 'filter',
        title: tab.name,
        content: {
          name: tab.name,
          search: tab.search,
          filters: tab.filters,
          params: {
            page,
            size,
            sortBy,
            sortOrder,
          },
        },
        _id: tab.id, // Include the ID to indicate this is an update
      };

      console.log('Updating tab with payload:', payload);

      // Use the same save endpoint for update
      const response = await axios.put(endpoints.tabs.update(tab.id), payload);

      if (response.data) {
        console.log('Tab updated successfully:', response.data);

        // Show success message
        setOpenToast(true);
      }
    } catch (error) {
      console.error('Error updating tab:', error);
      alert('Error updating tab: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteTab = async (tabIndex) => {
    try {
      const tabToDelete = searchTabs[tabIndex];

      // If the tab is saved (has an ID), call the delete API
      if (tabToDelete.saved && tabToDelete.id) {
        console.log('Deleting saved tab with ID:', tabToDelete.id);
        await axios.delete(endpoints.tabs.delete(tabToDelete.id));
        console.log('Tab deleted successfully from server');
      }

      // Remove tab from local state
      setSearchTabs((prev) => prev.filter((_, i) => i !== tabIndex));

      // Adjust active tab if necessary
      setActiveTab((prev) => {
        if (prev > tabIndex) {
          return prev - 1;
        } else if (prev === tabIndex && searchTabs.length > 1) {
          return Math.max(0, prev - 1);
        }
        return Math.max(0, prev);
      });

      // Only close dialog and reset state if it was a saved tab
      if (tabToDelete.saved) {
        setCloseDialogOpen(false);
        setTabToClose(null);
      }

      // Show success message only for saved tabs
      if (tabToDelete.saved) {
        setOpenToast(true);
      }
    } catch (error) {
      console.error('Error deleting tab:', error);
      // Only show error alert for saved tabs (API errors)
      if (searchTabs[tabIndex]?.saved) {
        alert('Error deleting tab: ' + (error.response?.data?.message || error.message));
      }
    }
  };
  // Use tab's search/filters for searching
  const handleSearchInputChange = (value) => {
    // setSearchInput(value);
    setSearchTabs((prev) =>
      prev.map((tab, idx) => (idx === activeTab ? { ...tab, search: value } : tab))
    );
  };
  const handleSearchSubmit = () => {
    setSearch(searchTabs[activeTab].search.trim());

    // Clear cache for current tab since we're doing a new search
    const tabKey = `tab-${activeTab}`;
    setTabResults((prev) => {
      const newResults = { ...prev };
      delete newResults[tabKey];
      return newResults;
    });

    fetchCandidates();
  };
  // Removed unused global filter setter
  const handleTabFilterChange = (key, value) => {
    setSearchTabs((prevTabs) =>
      prevTabs.map((tab, idx) =>
        idx === activeTab ? { ...tab, filters: { ...tab.filters, [key]: value } } : tab
      )
    );

    // Clear cache for current tab since filters changed
    const tabKey = `tab-${activeTab}`;
    setTabResults((prev) => {
      const newResults = { ...prev };
      delete newResults[tabKey];
      return newResults;
    });
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
  const sendToOdoo = async () => {
    setLoadingOdoo(true);
    try {
      // Log selected users' info
      const selectedUsers = candidates.filter((c) => selectedRows.includes(c.id));
      console.log('Selected users for Odoo:', selectedUsers);
      // Placeholder for sending candidates to Odoo
      // add the filters used
      console.log('Sending candidates to Odoo with filters:', searchTabs[activeTab]?.filters || {});
      // await axios.post('/your-odoo-endpoint', { filters, users: selectedUsers });
    } catch (error) {
      console.error('Error sending to Odoo:', error);
    } finally {
      setTimeout(() => {
        setLoadingOdoo(false);
      }, 1000);
    }
  };
  const handleGoToSecondLastPage = () => {
    if (totalPages > 1) {
      setPage(totalPages - 1);
    }
  };

  const handleDownloadCV = (candidate) => {
    try {
      console.log('Starting PDF generation...');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let y = 25;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      const leftColumnWidth = (contentWidth - 10) / 2;
      const rightColumnWidth = (contentWidth - 10) / 2;
      const rightColumnX = margin + leftColumnWidth + 10;

      const textColor = [0, 0, 0];
      const grayColor = [100, 100, 100];
      const lightGray = [220, 220, 220];

      const safeText = (text) => {
        if (typeof text === 'string') return text;
        if (text === null || text === undefined) return '';
        if (typeof text === 'object') {
          if (text.name) return String(text.name);
          if (text.title) return String(text.title);
          if (text.value) return String(text.value);
          if (text.text) return String(text.text);
          return '';
        }
        return String(text);
      };

      const name = candidate?.full_name || 'Unknown Name';
      const title = candidate?.job_title || '';
      const location = candidate?.location_name || '';
      const country = candidate?.location_country || '';
      const industry = candidate?.industry || '';
      const company = candidate?.job_company_name || '';
      const email = candidate?.emails?.[0]?.address || candidate?.work_email || '';
      const phone = candidate?.phone_numbers?.[0]?.number || '';
      const summary = candidate?.summary || candidate?.bio || '';
      const skills = candidate?.skills || [];
      const experience = candidate?.experience || [];
      const education = candidate?.education || [];

      const profiles = [
        ...(candidate.linkedin_url ? [{ network: 'LinkedIn', url: candidate.linkedin_url }] : []),
        ...(candidate.facebook_url ? [{ network: 'Facebook', url: candidate.facebook_url }] : []),
        ...(candidate.twitter_url ? [{ network: 'Twitter', url: candidate.twitter_url }] : []),
        ...(candidate.github_url ? [{ network: 'GitHub', url: candidate.github_url }] : []),
      ];

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(safeText(name).toUpperCase(), margin, y);
      y += 10;

      if (title) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(safeText(title), margin, y);
        y += 8;
      }

      if (company) {
        doc.setFontSize(12);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(safeText(company), margin, y);
        y += 15;
      }

      const contactStartY = 25;
      let contactY = contactStartY;
      const contactX = pageWidth - margin - 70;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      if (email) {
        doc.text(safeText(`Email: ${email}`), contactX, contactY);
        contactY += 6;
      }
      if (phone) {
        doc.text(safeText(`Phone: ${phone}`), contactX, contactY);
        contactY += 6;
      }
      if (location || country) {
        const locationText =
          `${safeText(location)} ${country ? `, ${safeText(country)}` : ''}`.trim();
        doc.text(safeText(locationText), contactX, contactY);
        contactY += 6;
      }

      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 15;

      const createSectionHeader = (title, xPos, yPos, width) => {
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(safeText(title), xPos, yPos);

        const textWidth = doc.getTextWidth(safeText(title));
        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.3);
        doc.line(xPos, yPos + 2, xPos + textWidth, yPos + 2);

        return yPos + 12;
      };

      let leftY = y;
      let rightY = y;

      if (summary) {
        leftY = createSectionHeader('PROFESSIONAL SUMMARY', margin, leftY, leftColumnWidth);

        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(safeText(summary), leftColumnWidth);
        doc.text(summaryLines, margin, leftY);
        leftY += summaryLines.length * 5 + 15;
      }

      if (skills.length > 0) {
        leftY = createSectionHeader('CORE COMPETENCIES', margin, leftY, leftColumnWidth);

        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const skillsText = skills.map((skill) => safeText(skill)).join(', ');
        const skillsLines = doc.splitTextToSize(skillsText, leftColumnWidth);
        doc.text(skillsLines, margin, leftY);
        leftY += skillsLines.length * 5 + 15;
      }

      if (education.length > 0) {
        leftY = createSectionHeader('EDUCATION', margin, leftY, leftColumnWidth);

        education.forEach((edu) => {
          const degree = Array.isArray(edu.degrees)
            ? edu.degrees
                .filter((d) => d && safeText(d).trim() !== '')
                .map((d) => safeText(d))
                .join(', ')
            : edu.degree && safeText(edu.degree).trim() !== ''
              ? safeText(edu.degree)
              : '';
          const major = Array.isArray(edu.majors)
            ? edu.majors
                .filter((m) => m && safeText(m).trim() !== '')
                .map((m) => safeText(m))
                .join(', ')
            : edu.major && safeText(edu.major).trim() !== ''
              ? safeText(edu.major)
              : '';
          const institution = safeText(edu.institution || edu.school?.name || '');

          if (degree || major || institution) {
            if (institution) {
              doc.setFontSize(11);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(textColor[0], textColor[1], textColor[2]);
              const instLines = doc.splitTextToSize(institution, leftColumnWidth);
              doc.text(instLines, margin, leftY);
              leftY += instLines.length * 6 + 1;
            }

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const eduText = `${degree}${major ? ` in ${major}` : ''}`;
            if (eduText.trim()) {
              const eduLines = doc.splitTextToSize(safeText(eduText), leftColumnWidth);
              doc.text(eduLines, margin, leftY);
              leftY += eduLines.length * 5 + 1;
            }

            if (edu.dates || (edu.start_date && edu.end_date)) {
              doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
              doc.setFontSize(9);
              const dates = edu.dates || `${safeText(edu.start_date)} - ${safeText(edu.end_date)}`;
              doc.text(safeText(dates), margin, leftY);
              leftY += 6;
              doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            }

            leftY += 8;
          }
        });
        leftY += 10;
      }

      if (experience && experience.length > 0) {
        rightY = createSectionHeader(
          'PROFESSIONAL EXPERIENCE',
          rightColumnX,
          rightY,
          rightColumnWidth
        );

        experience.forEach((exp) => {
          if (rightY > pageHeight - 80) {
            doc.addPage();
            rightY = 30;
            rightY = createSectionHeader(
              'PROFESSIONAL EXPERIENCE (cont.)',
              rightColumnX,
              rightY,
              rightColumnWidth
            );
          }

          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const jobTitle = safeText(
            exp.title || exp.job_title || exp.position || exp.role || 'Position'
          );
          const titleLines = doc.splitTextToSize(jobTitle, rightColumnWidth);
          doc.text(titleLines, rightColumnX, rightY);
          rightY += titleLines.length * 6 + 1;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const companyName = safeText(
            exp.company || exp.company_name || exp.employer || exp.organization || 'Company'
          );
          const companyLines = doc.splitTextToSize(companyName, rightColumnWidth);
          doc.text(companyLines, rightColumnX, rightY);
          rightY += companyLines.length * 5 + 1;

          doc.setFontSize(9);
          doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);

          let startDate = '';
          let endDate = '';

          if (exp.start_date) {
            startDate = safeText(exp.start_date);
          } else if (exp.dates && exp.dates.start) {
            startDate = safeText(exp.dates.start);
          } else if (exp.period && exp.period.start) {
            startDate = safeText(exp.period.start);
          }

          if (exp.end_date) {
            endDate = safeText(exp.end_date);
          } else if (exp.dates && exp.dates.end) {
            endDate = safeText(exp.dates.end);
          } else if (exp.period && exp.period.end) {
            endDate = safeText(exp.period.end);
          } else {
            endDate = 'Present';
          }

          if (startDate) {
            doc.text(`${startDate} - ${endDate}`, rightColumnX, rightY);
            rightY += 6;
          }

          const description =
            exp.description || exp.summary || exp.details || exp.responsibilities || '';
          if (description) {
            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            doc.setFontSize(9);
            const descText = safeText(description);
            const descLines = doc.splitTextToSize(descText, rightColumnWidth);
            doc.text(descLines, rightColumnX, rightY);
            rightY += descLines.length * 4 + 5;
          }

          rightY += 10;
        });
      }

      if (profiles.length > 0) {
        rightY += 10;

        if (rightY < pageHeight - 60) {
          rightY = createSectionHeader(
            'PROFESSIONAL PROFILES',
            rightColumnX,
            rightY,
            rightColumnWidth
          );

          profiles.forEach((profile) => {
            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            const networkText = safeText(profile.network || 'Unknown');
            const urlText = safeText(profile.url || '');
            const profileText = `${networkText}: ${urlText}`;
            const profileLines = doc.splitTextToSize(profileText, rightColumnWidth);
            doc.text(profileLines, rightColumnX, rightY);
            rightY += profileLines.length * 4 + 3;
          });
        }
      }

      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.setFontSize(8);
      doc.text('Generated by CVFlow', margin, pageHeight - 10);
      doc.text(new Date().toLocaleDateString(), pageWidth - margin - 30, pageHeight - 10);

      console.log('PDF generated successfully');
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 10000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  const filtersConfig = [
    {
      key: 'skills',
      label: 'Skills',
      type: 'autocomplete',
      options: [],

      value: searchTabs[activeTab]?.filters?.skills || [],
      onChange: (val) => handleTabFilterChange('skills', val),
    },

    {
      key: 'countries',
      label: 'Country',
      type: 'autocomplete',
      options: filterOptions.countries,
      value: searchTabs[activeTab]?.filters?.countries || [],
      onChange: (val) => handleTabFilterChange('countries', val),
    },
    {
      key: 'industries',
      label: 'Industry',
      type: 'autocomplete',
      options: filterOptions.industries,
      value: searchTabs[activeTab]?.filters?.industries || [],
      onChange: (val) => handleTabFilterChange('industries', val),
    },

    {
      key: 'languages',
      label: 'Languages',
      type: 'autocomplete',
      options: filterOptions.languages,
      value: searchTabs[activeTab]?.filters?.languages || [],
      onChange: (val) => handleTabFilterChange('languages', val),
    },
    {
      key: 'experienceCountries',
      label: 'Experience Countries',
      type: 'autocomplete',
      options: filterOptions.countries,
      value: searchTabs[activeTab]?.filters?.experienceCountries || [],
      onChange: (val) => handleTabFilterChange('experienceCountries', val),
    },
    {
      key: 'majors',
      label: 'Education Major',
      type: 'autocomplete',
      options: filterOptions.majors,
      value: searchTabs[activeTab]?.filters?.majors || [],
      onChange: (val) => handleTabFilterChange('majors', val),
    },
    {
      key: 'degrees',
      label: 'Education Degree',
      type: 'autocomplete',
      options: filterOptions.degrees,
      value: searchTabs[activeTab]?.filters?.degrees || [],
      onChange: (val) => handleTabFilterChange('degrees', val),
    },
    {
      key: 'minExperience',
      label: 'Min Experience (years)',
      type: 'number',
      value: searchTabs[activeTab]?.filters?.minExperience || '',
      onChange: (val) => handleTabFilterChange('minExperience', val),
    },
    {
      key: 'maxExperience',
      label: 'Max Experience (years)',
      type: 'number',
      value: searchTabs[activeTab]?.filters?.maxExperience || '',
      onChange: (val) => handleTabFilterChange('maxExperience', val),
    },
    {
      key: 'minLinkedinConnections',
      label: 'Min LinkedIn Connections',
      type: 'number',
      value: searchTabs[activeTab]?.filters?.minLinkedinConnections || '',
      onChange: (val) => handleTabFilterChange('minLinkedinConnections', val),
    },
    {
      key: 'maxLinkedinConnections',
      label: 'Max LinkedIn Connections',
      type: 'number',
      value: searchTabs[activeTab]?.filters?.maxLinkedinConnections || '',
      onChange: (val) => handleTabFilterChange('maxLinkedinConnections', val),
    },
  ];

  if (selectedCandidate) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        <CandidateCVDisplay data={selectedCandidate} onReset={() => setSelectedCandidate(null)} />
      </Box>
    );
  }
  console.log({ geoRange });

  const displayCount =
    totalCount >= 10000 && totalCount < 100000
      ? '+10k'
      : totalCount >= 100000 && totalCount < 1000000
        ? '+100k'
        : totalCount > 1000000
          ? '+1M'
          : totalCount;
  return (
    <Box sx={{ width: '100%', mx: 'auto', px: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            overflowX: 'auto',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                borderRadius: '8px 8px 0 0',
                position: 'relative',
                '&:not(.Mui-selected)': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  color: 'text.secondary',
                },
                '&.Mui-selected': {
                  backgroundColor: 'background.paper',
                  color: 'primary.main',
                  fontWeight: 600,
                },
              },
            }}
          >
            {searchTabs.map((tab, idx) => (
              <Tab
                key={idx}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Box
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {tab.name}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        sx={{
                          p: 0.3,
                          color: tab.saved ? 'warning.main' : 'action.disabled',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 193, 7, 0.1)',
                            color: 'warning.main',
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!tab.saved) {
                            setSaveDialogOpen(true);
                            setActiveTab(idx); // Set active tab to the one being saved
                          }
                        }}
                        title={tab.saved ? 'Already saved' : 'Save tab'}
                      >
                        {tab.saved ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                      </IconButton>
                      {tab.saved && (
                        <IconButton
                          size="small"
                          sx={{
                            p: 0.3,
                            color: 'info.main',
                            '&:hover': {
                              backgroundColor: 'rgba(33, 150, 243, 0.1)',
                              color: 'info.dark',
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateTab(idx);
                          }}
                          title="Update saved filters"
                        >
                          <Update fontSize="small" />
                        </IconButton>
                      )}
                      {searchTabs.length > 1 && (
                        <IconButton
                          size="small"
                          sx={{
                            p: 0.3,
                            color: 'action.disabled',
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                              color: 'error.main',
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // If tab is not saved, delete immediately without confirmation
                            if (!searchTabs[idx].saved) {
                              handleDeleteTab(idx);
                            } else {
                              setTabToClose(idx);
                              setCloseDialogOpen(true);
                            }
                          }}
                          title="Close tab"
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                }
                value={idx}
                sx={{
                  minWidth: 160,
                  maxWidth: 280,
                  px: 2,
                  position: 'relative',
                }}
                onClick={() => setActiveTab(idx)}
              />
            ))}
          </Tabs>

          {/* Add Tab Button */}
          <IconButton
            onClick={handleNewTab}
            sx={{
              ml: 1,
              p: 1,
              backgroundColor: 'action.hover',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
              },
            }}
            title="Add new tab"
          >
            <Add />
          </IconButton>

          <Dialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)}>
            <DialogTitle>Confirm Delete Saved Tab</DialogTitle>
            <DialogContent>
              <Box sx={{ py: 2 }}>
                Are you sure you want to delete this saved tab? This will permanently remove it from
                the server.
              </Box>
            </DialogContent>
            <DialogActions>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={() => setCloseDialogOpen(false)}>Cancel</Button>
                <Button
                  color="error"
                  variant="contained"
                  onClick={() => handleDeleteTab(tabToClose)}
                >
                  Delete
                </Button>
              </Box>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
      <Dialog
        sx={{
          width: '100%',
        }}
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
      >
        <DialogTitle>Save Search Tab</DialogTitle>
        <DialogContent
          sx={{
            width: '400px',
          }}
        >
          <TextField
            label="Tab Name"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleSaveTab}
            disabled={!saveName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!loading && (
          <Box
            sx={{
              fontSize: '30px',
              fontWeight: 'bold',
              color: 'primary.main',
              mt: { xs: 1, sm: 0 },
            }}
          >
            {totalCount.toLocaleString()} candidate{totalCount !== 1 ? 's' : ''} found
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <FilterSearchBar
          searchValue={searchTabs[activeTab]?.search || ''}
          onSearchChange={handleSearchInputChange}
          onSearchSubmit={handleSearchSubmit}
          filtersConfig={filtersConfig}
          mainFiltersCount={5}
        />{' '}
        <Button variant="contained" size="medium" onClick={handleSearchSubmit}>
          Search
        </Button>{' '}
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
            onChange={(e) => {
              const newSortBy = e.target.value;
              setSortBy(newSortBy);
              // Update the current tab's params
              setSearchTabs((prev) =>
                prev.map((tab, idx) =>
                  idx === activeTab ? { ...tab, params: { ...tab.params, sortBy: newSortBy } } : tab
                )
              );
            }}
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="experience">Experience</MenuItem>
            <MenuItem value="connections">Connections</MenuItem>
            <MenuItem value="job_start_date">Job Start Date</MenuItem>
          </Select>
          <Select
            value={sortOrder}
            size="small"
            onChange={(e) => {
              const newSortOrder = e.target.value;
              setSortOrder(newSortOrder);
              // Update the current tab's params
              setSearchTabs((prev) =>
                prev.map((tab, idx) =>
                  idx === activeTab
                    ? { ...tab, params: { ...tab.params, sortOrder: newSortOrder } }
                    : tab
                )
              );
            }}
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
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setSize(newSize);
              // Update the current tab's params
              setSearchTabs((prev) =>
                prev.map((tab, idx) =>
                  idx === activeTab ? { ...tab, params: { ...tab.params, size: newSize } } : tab
                )
              );
            }}
            size="small"
            sx={{ width: 140 }}
            inputProps={{ min: 1, max: 50 }}
          />
          <Badge
            color="error"
            variant="dot"
            invisible={!searchTabs[activeTab]?.filters?.countries?.length}
          >
            <GeoCircleSelector
              handleGeorange={(range) => {
                setGeoRange(range);
                setGeoLocationStatuse(true);
                setSearchTabs((prevTabs) =>
                  prevTabs.map((tab, idx) =>
                    idx === activeTab ? { ...tab, filters: { ...tab.filters, countries: [] } } : tab
                  )
                );
              }}
            />
          </Badge>{' '}
          {/* <Button
            variant="contained"
            color="info"
            size="small"
            onClick={sendToOdoo}
            disabled={loadingOdoo || selectedRows.length === 0}
          >
            {loadingOdoo ? <CircularProgress size={20} /> : 'Send To Odoo'}
          </Button> */}
        </Box>
      </Box>

      <Paper>
        {loading ? (
          <Table>
            <TableHead>
              <TableRow>
                {tableColumns.map((column) => (
                  <SortableHeaderCell key={column.id} column={column}>
                    {column.label}
                  </SortableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(size)].map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton variant="text" width={120} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={80} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={140} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={160} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={60} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rectangular" width={100} height={32} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={80} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rectangular" width={90} height={32} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                {/* <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedRows.length > 0 && selectedRows.length < candidates.length
                    }
                    checked={candidates.length > 0 && selectedRows.length === candidates.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(candidates.map((c) => c.id));
                        console.log(
                          'Selected users:',
                          candidates.map((c) => c.id)
                        );
                      } else {
                        setSelectedRows([]);
                        console.log('Selected users:', []);
                      }
                    }}
                    color="primary"
                  />
                </TableCell> */}
                {tableColumns.map((column) => (
                  <SortableHeaderCell key={column.id} column={column}>
                    {column.label}
                  </SortableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.length > 0 ? (
                candidates.map((c) => (
                  <TableRow key={c.id} hover>
                    {/* <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.includes(c.id)}
                        onChange={() => handleSelectRow(c.id)}
                        color="primary"
                      />
                    </TableCell> */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, bgcolor: theme.palette.primary.main }}>
                          {(c.full_name || 'N/A')[0]}
                        </Avatar>
                        {c.full_name || 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {c.phone_numbers?.map((p) => p.number).join(', ') || 'N/A'}
                    </TableCell>
                    <TableCell>{c.emails?.map((e) => e.address).join(', ') || 'N/A'}</TableCell>
                    <TableCell>{c.industry || c.job_title || 'N/A'}</TableCell>
                    <TableCell>{c.inferred_years_experience ?? 'N/A'}</TableCell>
                    <TableCell>
                      <SocialMediaLinks
                        social_media={[
                          ...(c.linkedin_url
                            ? [{ platform: 'linkedin', url: c.linkedin_url }]
                            : []),
                          ...(c.facebook_url
                            ? [{ platform: 'facebook', url: c.facebook_url }]
                            : []),
                          ...(c.twitter_url ? [{ platform: 'twitter', url: c.twitter_url }] : []),
                          ...(c.instagram_url
                            ? [{ platform: 'instagram', url: c.instagram_url }]
                            : []),
                          ...(c.github_url ? [{ platform: 'github', url: c.github_url }] : []),
                        ]}
                      />
                    </TableCell>
                    <TableCell>{c.location_country || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="primary"
                        sx={{ textTransform: 'none', mr: 1 }}
                        onClick={() => handleViewCV(c)}
                      >
                        View CV
                      </Button>
                      <Button
                        size="small"
                        color="secondary"
                        sx={{ textTransform: 'none' }}
                        onClick={() => handleDownloadCV(c)}
                      >
                        Download CV
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {totalCount > 0 && page === totalPages
                      ? 'No more candidates available.'
                      : 'No candidates found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {totalPages > 1 && (
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box
            sx={{
              color: 'text.secondary',
              fontSize: '0.9em',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box>
              Page {page} of {totalPages}
            </Box>
            <Box>
              • Showing {(page - 1) * size + 1}-{Math.min(page * size, totalCount)} of{' '}
              {totalCount.toLocaleString()} candidates
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {totalPages > 10 && (
              <TextField
                size="small"
                label="Go to page"
                type="number"
                sx={{ width: 100 }}
                inputProps={{ min: 1, max: totalPages }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const newPage = parseInt(e.target.value);
                    if (newPage >= 1 && newPage <= totalPages) {
                      setPage(newPage);
                    }
                    e.target.blur();
                  }
                }}
              />
            )}
            <Pagination
              page={page}
              count={totalPages}
              onChange={(e, val) => {
                setPage(val);
                fetchCandidates();
              }}
              showFirstButton
              showLastButton
              size="medium"
              variant="outlined"
              shape="rounded"
              siblingCount={1}
              boundaryCount={1}
            />
          </Box>
        </Box>
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
