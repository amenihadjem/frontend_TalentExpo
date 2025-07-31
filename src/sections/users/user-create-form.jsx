import { useState } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { green, grey } from '@mui/material/colors';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Select from '@mui/material/Select'; // New Import
import InputLabel from '@mui/material/InputLabel'; // New Import
import FormControl from '@mui/material/FormControl'; // New Import

import MenuItem from '@mui/material/MenuItem';

export function UserCreateForm({ onAddUser, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const ROLES = ['Admin', 'Recruiter']; // Define roles here as well for the dropdown
  const [role, setRole] = useState('Recruiter'); // New state for role, default to Recruiter
  const [fullName, setFullName] = useState(''); // New state for Full Name
  const [phone, setPhone] = useState(''); // New state for Phone

  // Password validation states
  const isLengthValid = password.length >= 6;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password || !confirmPassword || !phone) {
      // Added phone and fullName to required fields
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format.');
      return;
    }

    // New password validation checks
    if (!isLengthValid || !hasSpecialChar || !hasNumber) {
      setError('Password does not meet the requirements.');
      return;
    }
    // Basic phone validation (optional, could be more robust)
    if (!/^\+?[0-9]{7,15}$/.test(phone)) {
      setError('Invalid phone number format.');
      return;
    }

    console.log('New user data:', { email, password });

    // Simulate successful addition and pass data to parent
    onAddUser({ fullName, email, phone, password, role }); // Default role for new users
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        required
        error={!!error && (password === '' || !isLengthValid || !hasSpecialChar || !hasNumber)}
        helperText={
          !!error && (password === '' || !isLengthValid || !hasSpecialChar || !hasNumber)
            ? error
            : ''
        }
      />
      <List dense sx={{ mt: 1, mb: 2 }}>
        <ListItem disableGutters>
          <ListItemIcon>
            {isLengthValid ? (
              <CheckCircleOutlineIcon sx={{ color: green[500] }} />
            ) : (
              <RadioButtonUncheckedIcon sx={{ color: grey[400] }} />
            )}
          </ListItemIcon>
          <ListItemText primary="At least 6 characters" />
        </ListItem>
        <ListItem disableGutters>
          <ListItemIcon>
            {hasSpecialChar ? (
              <CheckCircleOutlineIcon sx={{ color: green[500] }} />
            ) : (
              <RadioButtonUncheckedIcon sx={{ color: grey[400] }} />
            )}
          </ListItemIcon>
          <ListItemText primary="At least one special character (!@#$%^&*...)" />
        </ListItem>
        <ListItem disableGutters>
          <ListItemIcon>
            {hasNumber ? (
              <CheckCircleOutlineIcon sx={{ color: green[500] }} />
            ) : (
              <RadioButtonUncheckedIcon sx={{ color: grey[400] }} />
            )}
          </ListItemIcon>
          <ListItemText primary="At least one number (0-9)" />
        </ListItem>
      </List>
      <TextField
        fullWidth
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        margin="normal"
        required
        error={!!error && password !== confirmPassword}
        helperText={!!error && password !== confirmPassword ? error : ''}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel id="new-user-role-label">Assign Role</InputLabel>
        <Select
          labelId="new-user-role-label"
          id="new-user-role-select"
          value={role}
          label="Assign Role"
          onChange={(e) => setRole(e.target.value)}
          required
        >
          {ROLES.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {error && password === confirmPassword && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Create User
        </Button>
      </Box>
    </Box>
  );
}
