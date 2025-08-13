// src/sections/user/view/user-cards-view-v2.jsx

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import CandidateCardListV2 from '../candidate-card-list-v2';

export function UserCardsViewV2() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Candidate cards (V2)"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Candidates', href: paths.dashboard.user.root },
          { name: 'Cards V2' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.user.root}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add Candidate
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <CandidateCardListV2 />
    </DashboardContent>
  );
}
