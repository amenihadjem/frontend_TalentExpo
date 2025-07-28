import { useState } from 'react';

import { Container } from '@mui/material';

import CVUploadSection from 'src/sections/user/cv-upload-section';

export function CVUploadView() {
  const [uploadedFile, setUploadedFile] = useState(null);

  return (
    <Container>
      <CVUploadSection onUploaded={setUploadedFile} uploadedFile={uploadedFile} />
    </Container>
  );
}
