import React from 'react';
import { useDropzone } from 'react-dropzone';

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'; // add this at the top

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Paper, Button, Typography, Snackbar, Alert } from '@mui/material';

import axios, { endpoints } from 'src/lib/axios';

export default function CVUploadSection({ onUploaded, uploadedFile }) {
  const [successMessage, setSuccessMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setLoading(true);
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(endpoints.cv.upload, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const uploadedId = response.data?.data?._id;
        if (uploadedId) {
          onUploaded(file); // store file locally for preview
          setSuccessMessage('CV uploaded successfully!');
        }
      } catch (error) {
        console.error('Upload failed:', error);
        setErrorMessage('Upload failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleViewFile = () => {
    if (uploadedFile) {
      const fileURL = URL.createObjectURL(uploadedFile);
      window.open(fileURL, '_blank');
    }
  };

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
          opacity: loading ? 0.6 : 1,
        }}
        {...getRootProps()}
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
            View Uploaded File
          </Button>
        </Box>
      )}

      {/* Success Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage('')}
      >
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
    </Box>
  );
}
