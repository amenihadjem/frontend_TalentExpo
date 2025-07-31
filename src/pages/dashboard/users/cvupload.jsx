import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { CVUploadView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

const metadata = { title: `User profile | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CVUploadView />
    </>
  );
}
