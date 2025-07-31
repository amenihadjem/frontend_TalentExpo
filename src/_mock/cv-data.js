export const mockCvData = {
  valid: true,
  validation_message: '',
  cv_id: '45552b2c-4f3e-8a1d-0f5b6c7e8a9d',
  candidate_id: '885f2b2c-4f3e-8a1d-0f5b6c7e8a9d',
  cv_metadata: {
    cv_text: 'Full text extracted from the CV',
    cv_language: 'en',
    summary: 'Brief professional summary (max 200 characters)',
  },
  candidate: {
    full_name: 'John Doe',
    first_name: 'John',
    last_name: 'Doe',
    email: 'johndoe@example.com',
    phone: '+14155552671',
    birth_date: '1990-05-15',
    address: '1234 Elm Street, City, State, ZIP',
    country_code: 'US',
    country_name: 'United States',
    industry: 'Software Development',
    experience_years: 5,
  },
  social_media: [
    {
      platform: 'LinkedIn',
      url: 'https://www.linkedin.com/in/johndoe',
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      degree_Level: 'ISCED 6',
      degree_type: 'Bachelor',
      field_of_study: 'Computer Science',
      institution: 'MIT',
      institution_type: 'University',
      country: 'US',
      education_framework: 'ISCED',
      graduation_year: '2012',
    },
  ],
  experience: [
    {
      company_name: 'TechCorp Inc.',
      industry: 'Software Development',
      country: 'US',
      job_title: 'Software Engineer',
      start_date: '2018-06-01',
      end_date: '9999-12-31',
      description: 'Developed scalable web applications and maintained cloud infrastructure.',
    },
  ],
  skills: [
    {
      name: 'JavaScript',
      category: 'Software Development',
    },
    {
      name: 'Python',
      category: 'Software Development',
    },
  ],
  keywords: [
    {
      keyword: 'Machine Learning',
      relevance_score: 0.9,
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Developer',
      provider: 'Amazon Web Services',
      year: '2020',
    },
  ],
  projects: [
    {
      title: 'AI Chatbot',
      description: 'Developed an AI-powered chatbot for customer support.',
      role: 'Lead Developer',
      technologies_used: ['Python', 'TensorFlow', 'Flask'],
      start_date: '2023-01-01',
      end_date: '9999-12-31',
      project_url: 'https://github.com/johndoe/ai-chatbot',
      impact: 'Reduced customer support response time by 50%.',
      client_or_employer: 'Acme Corp',
    },
  ],
  processing_details: {
    processing_time_sec: 0.0,
    source_file: 'example.pdf',
    source_format: 'application/pdf',
    upload_datetime: '2025-03-13T12:00:00Z',
    cv_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
};
