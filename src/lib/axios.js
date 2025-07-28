import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl, // match your backend
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  // chat: '/api/chat',
  // kanban: '/api/kanban',
  // calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    logout: '/api/auth/logout',

    // signUp: '/api/auth/sign-up',
  },
  chat: {
    conversation: '/api/chat/history',
  },
  cv: {
    open: '/api/candidates/file',
    upload: '/api/v1/files/upload/jwt/single',
    get: '/api/v1/files/job',
  },
  candidates: {
    search: '/api/opensearch/candidates/search',
    aggregations: '/api/opensearch/candidates/aggregations',

    // list: '/api/candidate/list',
    // details: '/api/candidate/details',
    // search: '/api/candidate/search',
  },
  analytics: {
    totalCv: '/api/analytics/cv/total',
    newCv: '/api/analytics/candidates/count/new',
    cvByLanguage: '/api/analytics/cv/count/by-language',
    avgSkillsCount: '/api/analytics/cv/average-skill-count',
    avgExperience: '/api/analytics/cv/average-experience',
    candidateWithSocialMedia: '/api/analytics/candidates/count/with-social-media',
    candidateWithPhoneNumber: '/api/analytics/candidates/percent-with-phone',
    experienceSegments: '/api/analytics/candidates/experience-segments',
    topSkills: '/api/analytics/skills/comparison/top',
    topSkillsByTopIndustries: '/api/analytics/skills/top-skills-by-top-industries',
    cvUploadsDaily: '/api/analytics/cv/uploaded-cvs/daily',
    cvUploadsWeekly: '/api/analytics/cv/uploaded-cvs/weekly',
    cvProgress: '/api/cv-progress',
  },
  // mail: {
  //   list: '/api/mail/list',
  //   details: '/api/mail/details',
  //   labels: '/api/mail/labels',
  // },
  // post: {
  //   list: '/api/post/list',
  //   details: '/api/post/details',
  //   latest: '/api/post/latest',
  //   search: '/api/post/search',
  // },
  // product: {
  //   list: '/api/product/list',
  //   details: '/api/product/details',
  //   search: '/api/product/search',
  // },
};
