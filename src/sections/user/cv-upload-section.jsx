import { useDropzone } from 'react-dropzone';
import React, { useState, useEffect, useRef } from 'react';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Box, Paper, Button, Typography, Snackbar, Alert, CircularProgress } from '@mui/material';

// Import your mock candidates to simulate processed CV data
import { MOCK_CANDIDATES } from 'src/_mock/mockV2';

import CandidateCVDisplay from './candidate-cv-display'; // Adjust path if needed

// Uncomment when ready to use real API
// import axios, { endpoints } from 'src/lib/axios';

export default function CVUploadSection({ onUploaded }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cvData, setCvData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fetchingCvData, setFetchingCvData] = useState(false);
  const [pollingAttempt, setPollingAttempt] = useState(0);

  const pollingIntervalRef = useRef(null);

  // --- API Key & Signature ---
  // const API_KEY = 'ak_d3402d82d86261cc9354069dc1cef2b596fc9b42a95c5ea1';
  // const API_SIGNATURE = 'sk_4272cd8b0d38f2f939084a2022b228457f89ecafd6e4667be875965e71db2ed5';

  // --- Polling Configuration ---
  // const MAX_POLLING_ATTEMPTS = 100;
  // const POLLING_INTERVAL_MS = 30000;

  useEffect(() => {
    // Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  // Simulate CV processing delay and return mock data
  useEffect(() => {
    if (!uploadedFile) return;

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    setCvData(null);
    setFetchingCvData(true);
    setPollingAttempt(0);

    // Simulate processing delay (2 seconds)
    const timer = setTimeout(() => {
      // Random mock candidate data as "processed CV"
      const randomIndex = Math.floor(Math.random() * MOCK_CANDIDATES.length);
      const mockCv = MOCK_CANDIDATES[randomIndex];

      setCvData(mockCv);
      setLoading(false);
      setFetchingCvData(false);
      setSuccessMessage('CV processed successfully (mock data).');
      if (onUploaded) onUploaded(uploadedFile);
    }, 2000);

    return () => clearTimeout(timer);
  }, [uploadedFile, onUploaded]);

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      // Reset states for new upload
      setSuccessMessage('');
      setErrorMessage('');
      setCvData(null);
      setPollingAttempt(0);

      const file = acceptedFiles[0];
      setUploadedFile(file);

      // --- Real API Upload Code (commented for now) ---
      /*
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(endpoints.cv.upload, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': API_KEY,
            'x-api-signature': API_SIGNATURE,
          },
        });

        const uploadedId = response.data?.data?._id;
        if (uploadedId) {
          setPollingAttempt(0);
          pollForCvData(uploadedId);
          setSuccessMessage('CV uploaded successfully! Waiting for processing...');
        } else {
          setErrorMessage('Upload successful, but CV ID missing. Please try again.');
        }
      } catch (error) {
        setErrorMessage(`Upload failed: ${error.response?.data?.error || 'Please try again.'}`);
      } finally {
        setLoading(false);
      }
      */
    },
  });

  // --- Polling function for real API (commented for now) ---
  /*
  const pollForCvData = (id) => {
    setFetchingCvData(true);
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    let attempts = 0;
    pollingIntervalRef.current = setInterval(async () => {
      attempts++;
      setPollingAttempt(attempts);

      if (attempts > MAX_POLLING_ATTEMPTS) {
        clearInterval(pollingIntervalRef.current);
        setFetchingCvData(false);
        setErrorMessage('CV processing failed: Timed out.');
        setSuccessMessage('');
        return;
      }

      try {
        const response = await axios.get(`${endpoints.cv.get}/${id}`, {
          headers: {
            'x-api-key': API_KEY,
            'x-api-signature': API_SIGNATURE,
          },
        });

        const data = response.data.data;

        if (data && (data.status === 'failed' || data.error_message)) {
          clearInterval(pollingIntervalRef.current);
          setFetchingCvData(false);
          setErrorMessage(`CV processing failed: ${data.error_message || 'Unknown error.'}`);
          setSuccessMessage('');
        } else if (data && data.status === 'completed') {
          clearInterval(pollingIntervalRef.current);
          setCvData(data);
          setFetchingCvData(false);
          setSuccessMessage('CV details successfully loaded!');
          setErrorMessage('');
        }
      } catch (error) {
        if (
          error.response?.status === 401 ||
          error.response?.status === 404 ||
          error.response?.status >= 500
        ) {
          clearInterval(pollingIntervalRef.current);
          setFetchingCvData(false);
          setErrorMessage(`CV processing failed: ${error.response?.data?.error || 'Server error.'}`);
          setSuccessMessage('');
        }
      }
    }, POLLING_INTERVAL_MS);
  };
  */

  const handleViewFile = () => {
    if (uploadedFile) {
      const fileURL = URL.createObjectURL(uploadedFile);
      window.open(fileURL, '_blank');
    }
  };

  const handleReset = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setUploadedFile(null);
    setCvData(null);
    setLoading(false);
    setSuccessMessage('');
    setErrorMessage('');
    setFetchingCvData(false);
    setPollingAttempt(0);
    if (onUploaded) onUploaded(null);
  };

  // Rendering logic

  if (loading || fetchingCvData) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Processing CV... {pollingAttempt > 0 && `(Attempt ${pollingAttempt})`}
        </Typography>
      </Box>
    );
  }

  if (errorMessage) {
    return (
      <Box textAlign="center" py={4}>
        <Alert severity="error" sx={{ mb: 2, mx: 'auto', maxWidth: '600px' }}>
          {errorMessage}
        </Alert>
        <Button variant="contained" color="primary" onClick={handleReset}>
          Try Another CV
        </Button>
      </Box>
    );
  }

  if (cvData) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', px: 2 }}>
        <CandidateCVDisplay data={cvData} onReset={handleReset} />
        <Box mt={2} textAlign="center">
          <Button variant="outlined" color="primary" onClick={handleReset}>
            Upload Another CV
          </Button>
        </Box>
      </Box>
    );
  }

  // Default: show upload dropzone
  return (
    <Box textAlign="center" py={4}>
      <Typography variant="h5" gutterBottom>
        Upload your CV
      </Typography>

      <Paper
        {...getRootProps()}
        sx={{
          padding: 4,
          border: '2px dashed #1976d2',
          textAlign: 'center',
          cursor: 'pointer',
          width: '80%',
          maxWidth: '600px',
          height: '200px',
          margin: '20px auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 50, color: '#1976d2' }} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Drag & drop your CV here, or click to select files
        </Typography>
      </Paper>

      {uploadedFile && !loading && (
        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<InsertDriveFileIcon />}
            onClick={handleViewFile}
          >
            View Uploaded File (Local Preview)
          </Button>
        </Box>
      )}

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={!!errorMessage && !cvData && !fetchingCvData}
        autoHideDuration={3000}
        onClose={() => setErrorMessage('')}
      >
        <Alert severity="error" onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
