import { useState, useMemo } from 'react';
import { MOCK_CANDIDATES, MOCK_ROLES } from 'src/_mock/mockV2';

export default function useCandidateFilter(rowsPerPage = 6) {
  // Filter states
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [location, setLocation] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [educationDegree, setEducationDegree] = useState('');
  const [educationMajor, setEducationMajor] = useState('');
  const [experienceSegment, setExperienceSegment] = useState('');
  const [role, setRole] = useState('');

  // Pagination
  const [page, setPage] = useState(1);

  // --- Dynamic options computed from MOCK_CANDIDATES ---

  // Helper to get unique values from array
  const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));

  // All industries
  const industries = useMemo(() => unique(MOCK_CANDIDATES.map((c) => c.industry)), []);

  // All countries
  const countries = useMemo(() => unique(MOCK_CANDIDATES.map((c) => c.country)), []);

  // All locations
  const locations = useMemo(() => unique(MOCK_CANDIDATES.map((c) => c.location)), []);

  // All job titles (from first experience job_title)
  const jobTitles = useMemo(
    () => unique(MOCK_CANDIDATES.map((c) => c.experience?.[0]?.job_title)),
    []
  );

  // All skills (flattened from all candidates)
  const skills = useMemo(() => unique(MOCK_CANDIDATES.flatMap((c) => c.skills)), []);

  // All education degrees (flattened and unique)
  const educationDegrees = useMemo(
    () => unique(MOCK_CANDIDATES.flatMap((c) => c.education?.map((e) => e.degree))),
    []
  );

  // All education majors (flattened and unique)
  const educationMajors = useMemo(
    () => unique(MOCK_CANDIDATES.flatMap((c) => c.education?.map((e) => e.major))),
    []
  );

  // Experience segments - you can define your own ranges
  const experienceSegments = ['0-2', '3-5', '6-10', '10+'];

  // Filter config for FilterSearchBar
  const filtersConfig = [
    {
      key: 'industry',
      label: 'Industry',
      type: 'select',
      options: industries,
      value: industry,
      onChange: setIndustry,
    },
    {
      key: 'country',
      label: 'Country',
      type: 'select',
      options: countries,
      value: country,
      onChange: setCountry,
    },
    {
      key: 'location',
      label: 'Location',
      type: 'select',
      options: locations,
      value: location,
      onChange: setLocation,
    },
    {
      key: 'jobTitle',
      label: 'Job Title',
      type: 'select',
      options: jobTitles,
      value: jobTitle,
      onChange: setJobTitle,
    },
    {
      key: 'skills',
      label: 'Skills',
      type: 'autocomplete',
      options: skills,
      value: selectedSkills,
      onChange: setSelectedSkills,
    },
    {
      key: 'educationDegree',
      label: 'Education Degree',
      type: 'select',
      options: educationDegrees,
      value: educationDegree,
      onChange: setEducationDegree,
    },
    {
      key: 'educationMajor',
      label: 'Education Major',
      type: 'select',
      options: educationMajors,
      value: educationMajor,
      onChange: setEducationMajor,
    },
    {
      key: 'experienceSegment',
      label: 'Experience (Years)',
      type: 'select',
      options: experienceSegments,
      value: experienceSegment,
      onChange: setExperienceSegment,
    },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      options: MOCK_ROLES,
      value: role,
      onChange: setRole,
    },
  ];

  // Filtering logic
  const filteredCandidates = useMemo(() => {
    return MOCK_CANDIDATES.filter((c) => {
      const nameMatch = c.candidate.full_name.toLowerCase().includes(search.toLowerCase());
      const industryMatch = industry ? c.industry === industry : true;
      const countryMatch = country ? c.country === country : true;
      const locationMatch = location ? c.location === location : true;
      const jobTitleMatch = jobTitle ? c.experience[0]?.job_title === jobTitle : true;
      const skillsMatch =
        selectedSkills.length > 0
          ? selectedSkills.every((skill) => c.skills.includes(skill))
          : true;
      const educationDegreeMatch = educationDegree
        ? c.education.some((e) => e.degree === educationDegree)
        : true;
      const educationMajorMatch = educationMajor
        ? c.education.some((e) => e.major === educationMajor)
        : true;
      const roleMatch = role ? c.role === role : true;

      // Experience segment match logic
      const years = c.yearsExperience || 0;
      let experienceSegmentMatch = true;
      if (experienceSegment) {
        switch (experienceSegment) {
          case '0-2':
            experienceSegmentMatch = years >= 0 && years <= 2;
            break;
          case '3-5':
            experienceSegmentMatch = years >= 3 && years <= 5;
            break;
          case '6-10':
            experienceSegmentMatch = years >= 6 && years <= 10;
            break;
          case '10+':
            experienceSegmentMatch = years > 10;
            break;
          default:
            experienceSegmentMatch = true;
        }
      }

      return (
        nameMatch &&
        industryMatch &&
        countryMatch &&
        locationMatch &&
        jobTitleMatch &&
        skillsMatch &&
        educationDegreeMatch &&
        educationMajorMatch &&
        experienceSegmentMatch &&
        roleMatch
      );
    });
  }, [
    search,
    industry,
    country,
    location,
    jobTitle,
    selectedSkills,
    educationDegree,
    educationMajor,
    experienceSegment,
    role,
  ]);

  // Pagination slice
  const totalPages = Math.ceil(filteredCandidates.length / rowsPerPage);
  const candidatesToShow = filteredCandidates.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return {
    search,
    setSearch,
    filtersConfig,
    filteredCandidates,
    page,
    setPage,
    rowsPerPage,
    candidatesToShow,
    totalPages,
  };
}
