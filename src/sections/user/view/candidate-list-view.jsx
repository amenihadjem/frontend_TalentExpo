// src/pages/dashboard/UserListView.jsx
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import CandidateListTable from '../candidate-list-table.jsx';

export function UserListView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Candidate List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Candidates', href: paths.dashboard.user.root },
          { name: 'List' },
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

      <CandidateListTable />
    </DashboardContent>
  );
}
