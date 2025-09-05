import React, { useState, useEffect } from 'react';
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

import FilterSearchBar from './filter-search-bar';
import CandidateCVDisplay from './candidate-cv-display';
import { SocialMediaLinks } from 'src/components/social-media-links';
import axios, { endpoints } from 'src/lib/axios';
import countriesList from 'i18n-iso-countries';
import jsPDF from 'jspdf';
import GeoCircleSelector from 'src/components/map/GeoCircleSelector';
import { Add, Close } from '@mui/icons-material';

export default function CandidateListTable() {
  // Fetch saved tabs from API and fetch candidates for each tab
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
            saved: false,
          });
        }

        setSearchTabs(formattedTabs);

        // For each saved tab, you can fetch candidates using its params if needed
        for (const tab of formattedTabs) {
          if (tab.saved && tab.search) {
            try {
              const params = {
                ...(tab.search ? { query: tab.search } : {}),
                ...tab.filters,
                page: tab.params?.page || 1,
                size: tab.params?.size || 10,
                ...(tab.params?.sortBy ? { sortBy: tab.params.sortBy } : {}),
                ...(tab.params?.sortOrder ? { sortOrder: tab.params.sortOrder } : {}),
              };
              const candidatesRes = await axios.get(endpoints.candidates.search, { params });
              const candidates = candidatesRes.data?.data?.items || [];
            } catch (err) {
              console.error(`Error fetching candidates for tab '${tab.name}':`, err);
            }
          }
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
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loadingCV, setLoadingCV] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

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
  });
  const [lastTrigger, setLastTrigger] = useState({ search: '', filters: {} });

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

  useEffect(() => setPage(1), [search, size, sortBy, sortOrder, activeTab, searchTabs]);

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
        ...(tabFilters.countries ? { countries: normalize(tabFilters.countries) } : {}),
        ...(tabFilters.industries ? { industries: normalize(tabFilters.industries) } : {}),
        ...(tabFilters.skills?.length
          ? { skills: tabFilters.skills.map(normalize).join(',') }
          : {}),
        ...(tabFilters.majors ? { majors: normalize(tabFilters.majors) } : {}),
        ...(tabFilters.degrees ? { degrees: normalize(tabFilters.degrees) } : {}),
        ...(tabFilters.jobTitleRoles?.length
          ? { jobTitleRoles: tabFilters.jobTitleRoles.map(normalize).join(',') }
          : {}),
        ...(tabFilters.minExperience ? { minExperience: tabFilters.minExperience } : {}),
        ...(tabFilters.maxExperience ? { maxExperience: tabFilters.maxExperience } : {}),
        ...(tabFilters.minLinkedinConnections
          ? { minLinkedinConnections: tabFilters.minLinkedinConnections }
          : {}),
        ...(tabFilters.maxLinkedinConnections
          ? { maxLinkedinConnections: tabFilters.maxLinkedinConnections }
          : {}),
        page,
        size: adjustedSize,
        ...(sortBy ? { sortBy } : {}),
        ...(sortOrder ? { sortOrder } : {}),

        lat: tabFilters.countries ? null : geoRange?.lat,
        lon: tabFilters.countries ? null : geoRange?.lng,
        distance: tabFilters.countries
          ? null
          : geoRange?.distance
            ? geoRange?.distance + 'km'
            : null,
      };

      console.log('API Request Params:', params);
      setLoading(true);
      const res = await axios.get(endpoints.candidates.search, { params });
      const allItems = res.data?.data?.items || [];
      const total = res.data?.data?.total?.value || allItems.length;
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
      setCandidates(allItems);
      setTotalPages(newTotalPages);
      setTotalCount(total);

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
      if (searchTabs[activeTab]?.filters?.countries) setGeoLocationStatuse(false);
    }
  };
  const fetchData = async () => {
    // Example: fetch saved tabs and candidates before fetching candidates normally
    await fetchSavedTabsAndCandidates('YOUR_COMPANY_ID');
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  useEffect(
    () => {
      fetchData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    fetchCandidates();
  }, [geoRange, activeTab]);

  // Tab logic
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
      const params = { search: tab.search, filters: tab.filters, page, size, sortBy, sortOrder };

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
          prev.map((tab, idx) =>
            idx === activeTab ? { ...tab, name: saveName, saved: true } : tab
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
    fetchCandidates();
  };
  // Removed unused global filter setter
  const handleTabFilterChange = (key, value) => {
    setSearchTabs((prevTabs) =>
      prevTabs.map((tab, idx) =>
        idx === activeTab ? { ...tab, filters: { ...tab.filters, [key]: value } } : tab
      )
    );
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
      options: filterOptions.skills,
      value: searchTabs[activeTab]?.filters?.skills || [],
      onChange: (val) => handleTabFilterChange('skills', val),
    },
    {
      key: 'jobTitleRoles',
      label: 'Job Title',
      type: 'autocomplete',
      options: filterOptions.jobTitles,
      value: searchTabs[activeTab]?.filters?.jobTitleRoles || [],
      onChange: (val) => handleTabFilterChange('jobTitleRoles', val),
    },
    {
      key: 'countries',
      label: 'Country',
      type: 'select',
      options: filterOptions.countries,
      value: searchTabs[activeTab]?.filters?.countries || '',
      onChange: (val) => handleTabFilterChange('countries', val),
    },
    {
      key: 'industries',
      label: 'Industry',
      type: 'select',
      options: filterOptions.industries,
      value: searchTabs[activeTab]?.filters?.industries || '',
      onChange: (val) => handleTabFilterChange('industries', val),
    },
    {
      key: 'majors',
      label: 'Education Major',
      type: 'select',
      options: filterOptions.majors,
      value: searchTabs[activeTab]?.filters?.majors || '',
      onChange: (val) => handleTabFilterChange('majors', val),
    },
    {
      key: 'degrees',
      label: 'Education Degree',
      type: 'select',
      options: filterOptions.degrees,
      value: searchTabs[activeTab]?.filters?.degrees || '',
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

  const displayCount = totalCount >= 10000 ? '+10k' : totalCount;
  return (
    <Box sx={{ width: '100%', mx: 'auto', px: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {searchTabs.map((tab, idx) => (
            <Tab
              key={idx}
              label={tab.name + (tab.saved ? ' (saved)' : '')}
              value={idx}
              wrapped
              sx={{ minWidth: 120, maxWidth: 200 }}
              onClick={() => setActiveTab(idx)}
              icon={
                searchTabs.length > 1 ? (
                  <IconButton
                    size="small"
                    sx={{ ml: 0.5 }}
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
                  >
                    <Close fontSize="small" />
                  </IconButton>
                ) : null
              }
              iconPosition="end"
            />
          ))}
          <Button
            variant="outlined"
            size="small"
            sx={{ ml: 2, borderRadius: '50%', width: 32, height: 32, minWidth: 'unset' }}
            onClick={handleNewTab}
          >
            <Add />
          </Button>
        </Tabs>
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
              <Button color="error" variant="contained" onClick={() => handleDeleteTab(tabToClose)}>
                Delete
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
        <Button
          variant="contained"
          size="small"
          color="success"
          sx={{ my: 1, width: '100px', fontSize: '18px' }}
          onClick={() => setSaveDialogOpen(true)}
        >
          Save Tab
        </Button>
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
            {displayCount} candidate{totalCount !== 1 ? 's' : ''} found
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <FilterSearchBar
          searchValue={searchTabs[activeTab]?.search || ''}
          onSearchChange={handleSearchInputChange}
          onSearchSubmit={handleSearchSubmit}
          filtersConfig={filtersConfig}
          mainFiltersCount={3}
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: { xs: 1, sm: 0 } }}>
          <TextField
            type="number"
            label="Page Size"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            size="small"
            sx={{ width: 140 }}
            inputProps={{ min: 1, max: 50 }}
          />
          <Badge color="error" variant="dot" invisible={searchTabs[activeTab]?.filters?.countries}>
            <GeoCircleSelector
              handleGeorange={(range) => {
                setGeoRange(range);
                setGeoLocationStatuse(true);
                setSearchTabs((prevTabs) =>
                  prevTabs.map((tab, idx) =>
                    idx === activeTab ? { ...tab, filters: { ...tab.filters, countries: '' } } : tab
                  )
                );
              }}
            />
          </Badge>{' '}
          <Button
            variant="contained"
            color="info"
            size="small"
            onClick={sendToOdoo}
            disabled={loadingOdoo || selectedRows.length === 0}
          >
            {loadingOdoo ? <CircularProgress size={20} /> : 'Send To Odoo'}
          </Button>
        </Box>
      </Box>

      <Paper>
        {loading ? (
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
                <TableCell padding="checkbox">
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
                </TableCell>
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
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.includes(c.id)}
                        onChange={() => handleSelectRow(c.id)}
                        color="primary"
                      />
                    </TableCell>
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
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ color: 'text.secondary', fontSize: '0.9em' }}>
            Page {page} of {totalPages}
          </Box>

          <Pagination page={page} count={totalPages} onChange={(e, val) => setPage(val)} />
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
