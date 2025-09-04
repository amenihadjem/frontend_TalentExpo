import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import EventListTable from '../simulate.jsx';

export function EventListView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Simulate Events Attendency"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Simulate' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <EventListTable />
    </DashboardContent>
  );
}
