import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { UserListTable } from '../candidate-list-table.jsx'; // Updated import

export function UserListView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="User List" // Changed heading
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Users', href: paths.dashboard.users.root }, // Changed link name
          { name: 'List' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <UserListTable /> {/* Updated component */}
    </DashboardContent>
  );
}
