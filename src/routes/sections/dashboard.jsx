import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AccountLayout } from 'src/sections/account/account-layout';

import { AuthGuard } from 'src/auth/guard';
// ----------------------------------------------------------------------

//app
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
// ----------------------------------------------------------------------
// User
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
const CVUploadView = lazy(() => import('src/pages/dashboard/user/cvupload'));
// Users
const UsersProfilePage = lazy(() => import('src/pages/dashboard/users/profile'));
const UsersCardsPage = lazy(() => import('src/pages/dashboard/users/cards'));
const UsersListPage = lazy(() => import('src/pages/dashboard/users/list'));
const UsersCreatePage = lazy(() => import('src/pages/dashboard/users/new'));
const UsersEditPage = lazy(() => import('src/pages/dashboard/users/edit'));
const CVsUploadView = lazy(() => import('src/pages/dashboard/users/cvupload'));
// Account
const AccountGeneralPage = lazy(() => import('src/pages/dashboard/user/account/general'));
const AccountBillingPage = lazy(() => import('src/pages/dashboard/user/account/billing'));
const AccountSocialsPage = lazy(() => import('src/pages/dashboard/user/account/socials'));
const AccountNotificationsPage = lazy(
  () => import('src/pages/dashboard/user/account/notifications')
);
const AccountChangePasswordPage = lazy(
  () => import('src/pages/dashboard/user/account/change-password')
);

// ----------------------------------------------------------------------

const dashboardLayout = () => (
  <DashboardLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);
const accountLayout = () => (
  <AccountLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </AccountLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { path: 'chat', element: <ChatPage /> },
      {
        path: 'user',
        children: [
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'cards', element: <UserCardsPage /> },
          { path: 'list', element: <UserListPage /> },
          { index: true, element: <CVUploadView /> },
          { path: 'new', element: <UserCreatePage /> },
          { path: ':id/edit', element: <UserEditPage /> },

          {
            path: 'account',
            element: accountLayout(),
            children: [
              { index: true, element: <AccountGeneralPage /> },
              { path: 'billing', element: <AccountBillingPage /> },
              { path: 'notifications', element: <AccountNotificationsPage /> },
              { path: 'socials', element: <AccountSocialsPage /> },
              { path: 'change-password', element: <AccountChangePasswordPage /> },
            ],
          },
        ],
      },
      {
        path: 'users',
        children: [
          { path: 'profile', element: <UsersProfilePage /> },
          { path: 'cards', element: <UsersCardsPage /> },
          { index: true, element: <UsersListPage /> },

          { path: 'new', element: <UsersCreatePage /> },
          { path: ':id/edit', element: <UsersEditPage /> },

          {
            path: 'account',
            element: accountLayout(),
            children: [
              { index: true, element: <AccountGeneralPage /> },
              { path: 'billing', element: <AccountBillingPage /> },
              { path: 'notifications', element: <AccountNotificationsPage /> },
              { path: 'socials', element: <AccountSocialsPage /> },
              { path: 'change-password', element: <AccountChangePasswordPage /> },
            ],
          },
        ],
      },
      { element: <OverviewAnalyticsPage />, index: true },
    ],
  },
];
