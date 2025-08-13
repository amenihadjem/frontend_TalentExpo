// src/_mock/mockV2.js

export const MOCK_CANDIDATES = [
  {
    cv_id: '1',
    candidate: {
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
    },
    cv_metadata: { summary: 'Experienced full-stack developer specializing in React and Node.js.' },
    experience: [{ job_title: 'Software Engineer' }],
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    education: [
      { degree: 'BSc', major: 'Computer Science', institution: 'MIT' },
      { degree: 'MSc', major: 'Software Engineering', institution: 'Stanford University' },
    ],
    social_media: [
      { network: 'LinkedIn', url: 'https://linkedin.com/in/johndoe' },
      { network: 'Facebook', url: 'https://facebook.com/johndoe' },
    ],
    cvUrl: 'https://example.com/johndoe-cv.pdf',
    location: 'New York',
    country: 'US',
    industry: 'IT',
    yearsExperience: 5,
  },
  {
    cv_id: '2',
    candidate: {
      full_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-987-6543',
    },
    cv_metadata: {
      summary: 'Marketing professional with 7 years of experience in digital campaigns.',
    },
    experience: [{ job_title: 'Marketing Manager' }],
    skills: ['SEO', 'Content Marketing', 'Google Analytics'],
    education: [{ degree: 'BA', major: 'Marketing', institution: 'University of California' }],
    social_media: [{ network: 'LinkedIn', url: 'https://linkedin.com/in/janesmith' }],
    cvUrl: 'https://example.com/janesmith-cv.pdf',
    location: 'San Francisco',
    country: 'US',
    industry: 'Marketing',
    yearsExperience: 7,
  },
  {
    cv_id: '3',
    candidate: {
      full_name: 'Ahmed Al-Farsi',
      email: 'ahmed.alfarsi@example.com',
      phone: '+966-555-123-7890',
    },
    cv_metadata: {
      summary: 'Civil engineer with expertise in large-scale infrastructure projects.',
    },
    experience: [{ job_title: 'Civil Engineer' }],
    skills: ['AutoCAD', 'Project Management', 'Structural Analysis'],
    education: [
      { degree: 'BEng', major: 'Civil Engineering', institution: 'King Fahd University' },
    ],
    social_media: [],
    cvUrl: 'https://example.com/ahmed-cv.pdf',
    location: 'Riyadh',
    country: 'Saudi Arabia',
    industry: 'Construction',
    yearsExperience: 8,
  },
  // Add more mock candidates as needed
];

export const MOCK_INDUSTRIES = ['IT', 'Marketing', 'Construction'];
export const MOCK_COUNTRIES = ['US', 'Saudi Arabia', 'UK', 'CA'];
export const MOCK_JOB_TITLES = ['Software Engineer', 'Marketing Manager', 'Civil Engineer'];
export const MOCK_SKILLS = ['JavaScript', 'React', 'SEO', 'AutoCAD', 'Google Analytics'];

// Added Roles list for user role options (example)
export const MOCK_ROLES = ['Admin', 'Recruiter'];
export const MOCK_LOCATIONS = ['New York', 'San Francisco', 'Riyadh', 'London', 'Toronto'];
