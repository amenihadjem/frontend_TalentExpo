import { CONFIG } from 'src/global-config';
import axios, { endpoints } from 'src/lib/axios';

import { setSession } from './utils';
import { JWT_STORAGE_KEY } from './constant';

/** **************************************
 * Sign in
 *************************************** */

// ----------------------------------------------------------------------

export async function signInWithPassword({ email, password }) {
  try {
    const response = await axios.post(
      endpoints.auth.login,
      { email, password },
      {
        withCredentials: true,
        headers: {
          'Access-Control-Allow-Origin': CONFIG.serverUrl,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Response:', response.status, response.data);
    if (response.status !== 201 && response.status !== 200) {
      throw new Error('Login failed');
    }

    // No need to store token manually, cookie is set by the backend
    return response;
  } catch (error) {
    throw new Error('Login failed: ' + error.message);
  }
}

/** **************************************
 * Sign up
 *************************************** */

// ----------------------------------------------------------------------

export const signUp = async ({ email, password, firstName, lastName }) => {
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */

// ----------------------------------------------------------------------

export const signOut = async () => {
  try {
    const response = await axios.post(
      endpoints.auth.logout,
      {},
      {
        withCredentials: true,
        headers: {
          'Access-Control-Allow-Origin': CONFIG.serverUrl,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Logout response:', response.data);

    if (![200, 201, 204].includes(response.status)) {
      console.error('Unexpected status code:', response.status);
      throw new Error('Logout failed');
    }

    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw new Error('Logout failed: ' + error.message);
  }
};
