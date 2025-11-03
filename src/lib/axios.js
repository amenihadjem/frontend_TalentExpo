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
    me: '/auth/me',
    login: '/auth/login',
    logout: '/auth/logout',

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
    search: '/v2/opensearch/search',
    agg: '/v2/opensearch/aggregations',
    one: (id) => `/v2/opensearch/${id}`,

    // list: '/api/candidate/list',
    // details: '/api/candidate/details',
    // search: '/api/candidate/search',
  },
  tabs: {
    save: '/tabs',
    search: '/tabs/search',
    update: (id) => `/tabs/${id}`,
    delete: (id) => `/tabs/${id}`,
  },
  analytics: {
    map: '/v2/opensearch/agg-by-country',
    stats: '/v2/opensearch/stats',
    details: '/v2/opensearch/statsDetailed',

    ////////////////////////////////////////////////////////

    totalCv: '/analytics/cv/total',
    newCv: '/analytics/candidates/count/new',
    cvByLanguage: '/analytics/cv/count/by-language',
    avgSkillsCount: '/analytics/cv/average-skill-count',
    avgExperience: '/analytics/cv/average-experience',
    candidateWithSocialMedia: '/analytics/candidates/count/with-social-media',
    candidateWithPhoneNumber: '/analytics/candidates/percent-with-phone',
    experienceSegments: '/analytics/candidates/experience-segments',
    topSkills: '/analytics/skills/comparison/top',
    topSkillsByTopIndustries: '/analytics/skills/top-skills-by-top-industries',
    cvUploadsDaily: '/analytics/cv/uploaded-cvs/daily',
    cvUploadsWeekly: '/analytics/cv/uploaded-cvs/weekly',
    cvProgress: '/cv-progress',
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
