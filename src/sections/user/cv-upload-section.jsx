import React from 'react';
import { useDropzone } from 'react-dropzone';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Box, Paper, Button, Typography, Snackbar, Alert, CircularProgress } from '@mui/material';

import axios, { endpoints } from 'src/lib/axios';

import { CandidateCVDisplay } from './candidate-cv-display'; // Adjust path if needed

export default function CVUploadSection({ onUploaded, uploadedFile }) {
  const [successMessage, setSuccessMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [cvId, setCvId] = React.useState(null);
  const [cvData, setCvData] = React.useState(null);
  const [fetchingCvData, setFetchingCvData] = React.useState(false);
  const [pollingAttempt, setPollingAttempt] = React.useState(0);

  // --- API Key & Signature ---
  const API_KEY = 'ak_d3402d82d86261cc9354069dc1cef2b596fc9b42a95c5ea1';
  const API_SIGNATURE = 'sk_4272cd8b0d38f2f939084a2022b228457f89ecafd6e4667be875965e71db2ed5';

  // --- Polling Configuration ---
  // Increased MAX_POLLING_ATTEMPTS and POLLING_INTERVAL_MS based on your provided code
  const MAX_POLLING_ATTEMPTS = 100;
  const POLLING_INTERVAL_MS = 30000;

  const pollingIntervalRef = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      // Reset all states for a new upload attempt
      setLoading(true);
      setSuccessMessage('');
      setErrorMessage('');
      setCvId(null);
      setCvData(null);
      setPollingAttempt(0);
      onUploaded(null); // Clear local preview of previous file

      const file = acceptedFiles[0];
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

        console.log('CV upload response:', response.data);

        const uploadedId = response.data?.data?._id;
        if (uploadedId) {
          console.log('Uploaded CV ID:', uploadedId);
          setCvId(uploadedId);
          onUploaded(file); // Store file locally for preview
          setSuccessMessage('CV uploaded successfully! Waiting for processing...');
          // Start polling for CV data after successful upload
          pollForCvData(uploadedId);
        } else {
          console.warn('CV uploaded successfully, but _id was not found in the response.');
          onUploaded(file);
          setErrorMessage(
            'Upload successful, but could not retrieve CV ID for processing. Please try again.'
          );
        }
      } catch (error) {
        console.error('Upload failed:', error.response ? error.response.data : error.message);
        setErrorMessage(`Upload failed: ${error.response?.data?.error || 'Please try again.'}`);
      } finally {
        setLoading(false);
      }
    },
  });

  // Function to poll for CV data until it's processed or times out/fails
  const pollForCvData = async (id) => {
    setFetchingCvData(true);
    setPollingAttempt(0); // Ensure polling attempt starts from 0 for new polls

    // Clear any existing interval before starting a new one
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    let attempts = 0;
    pollingIntervalRef.current = setInterval(async () => {
      attempts++;
      setPollingAttempt(attempts); // Update attempt count for display

      if (attempts > MAX_POLLING_ATTEMPTS) {
        clearInterval(pollingIntervalRef.current);
        setFetchingCvData(false);
        setErrorMessage('CV processing **failed**: Timed out waiting for data. Please try again.');
        setSuccessMessage(''); // Clear success message if it failed
        console.error('Polling for CV data exceeded max attempts. Processing failed.');
        return;
      }

      try {
        const response = await axios.get(`${endpoints.cv.get}/${id}`, {
          headers: {
            'x-api-key': API_KEY,
            'x-api-signature': API_SIGNATURE,
            // 'x-api-timestamp': new Date().toISOString(), // Uncomment if your API requires it for signature verification
          },
        });

        console.log(`Polling attempt ${attempts}:`, response.data.data);

        const data = response.data.data; // This 'data' variable holds the nested CV details

        // Check for explicit backend failure statuses or error messages
        if (data && (data.status === 'failed' || data.error_message)) {
          clearInterval(pollingIntervalRef.current);
          setFetchingCvData(false);
          const backendError = data.error_message || 'An unknown processing error occurred.';
          setErrorMessage(`CV processing **failed**: ${backendError}`);
          setSuccessMessage('');
          console.error('Backend reported CV processing failure:', data.error_message);
        } else if (data && data.status === 'completed') {
          // Success condition: status is 'completed'
          clearInterval(pollingIntervalRef.current); // Stop polling
          setCvData(data); // Set the received data (the nested 'data' object)
          setFetchingCvData(false);
          setSuccessMessage('CV details successfully loaded!');
          setErrorMessage(''); // Clear any previous error messages
        }
        // If status is 'pending' or 'in_progress' and no error_message, continue polling
      } catch (error) {
        console.error(
          'Error fetching CV data during polling:',
          error.response ? error.response.data : error.message
        );
        // If it's a critical error (like 401/404) or consistently failing, stop polling
        if (
          error.response?.status === 401 ||
          error.response?.status === 404 ||
          error.response?.status >= 500
        ) {
          clearInterval(pollingIntervalRef.current);
          setFetchingCvData(false);
          setErrorMessage(
            `CV processing **failed**: ${error.response?.data?.error || 'Server error occurred.'}`
          );
          setSuccessMessage('');
        }
        // For other transient errors, continue polling until max attempts
      }
    }, POLLING_INTERVAL_MS);
  };

  const handleViewFile = () => {
    if (uploadedFile) {
      const fileURL = URL.createObjectURL(uploadedFile);
      window.open(fileURL, '_blank');
    }
  };

  const handleReset = () => {
    // Clear any active polling interval on reset
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setCvId(null);
    setCvData(null);
    onUploaded(null); // Clear the locally stored file preview
    setSuccessMessage('');
    setErrorMessage('');
    setPollingAttempt(0);
  };

  // --- Conditional Rendering Logic ---

  // 1. Show loading state while fetching/polling for CV data
  if (fetchingCvData) {
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
          Processing CV... (Attempt {pollingAttempt} of {MAX_POLLING_ATTEMPTS})
        </Typography>
        <Typography variant="body2" color="textSecondary">
          This might take a moment.
        </Typography>
      </Box>
    );
  }

  // 2. Show error message and retry button if processing failed
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

  // 3. Show parsed CV data if available (implies success)
  if (cvData) {
    // Console log cvData right before rendering CandidateCVDisplay
    console.log('cvData passed to CandidateCVDisplay:', cvData);
    return <CandidateCVDisplay data={cvData.data} onReset={handleReset} />;
  }

  // 4. Default: Show the CV upload section
  return (
    <Box textAlign="center" py={4}>
      <Typography variant="h5" gutterBottom>
        Upload your CV
      </Typography>

      <Paper
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
          opacity: loading ? 0.6 : 1, // Visual feedback for initial upload loading
        }}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 50, color: '#1976d2' }} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Drag & drop your CV here, or click to select files
        </Typography>
      </Paper>

      {/* Show local file preview if a file was selected but not yet processed/failed */}
      {uploadedFile && !loading && !fetchingCvData && !cvData && !errorMessage && (
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

      {/* Snackbar for success messages */}
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

      {/* Snackbar for general error messages (appears briefly, main error block takes precedence) */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={!!errorMessage && !cvData && !fetchingCvData} // Only show if an error is present and we're not loading or showing main CV data
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
