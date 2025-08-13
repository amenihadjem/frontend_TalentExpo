// src/pages/dashboard/user/cards-v2.jsx

import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { UserCardsViewV2 } from 'src/sections/users/view';

// ----------------------------------------------------------------------

const metadata = { title: `User cards V2 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <UserCardsViewV2 />
    </>
  );
}
