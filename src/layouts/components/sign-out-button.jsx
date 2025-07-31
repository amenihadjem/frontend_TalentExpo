import { useCallback } from 'react';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axios, { endpoints } from 'src/lib/axios';

import { useAuthContext } from 'src/auth/hooks';
import { signOut } from 'src/auth/context/jwt/action';

// ----------------------------------------------------------------------

export function SignOutButton({ onClose, sx, ...other }) {
  const router = useRouter();
  const { checkUserSession } = useAuthContext();

  const handleLogout = useCallback(async () => {
    try {
      const res = await axios.post(endpoints.auth.logout, {}, { withCredentials: true });
      if (res.data.success) {
        // After clearing session, update auth context
        await checkUserSession?.();

        onClose?.();

        // Redirect using router to avoid full reload
        router.replace(paths.auth.jwt.signIn);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [checkUserSession, onClose, router]);

  return (
    <Button
      fullWidth
      variant="soft"
      size="large"
      color="error"
      onClick={handleLogout}
      sx={sx}
      {...other}
    >
      Logout
    </Button>
  );
}
