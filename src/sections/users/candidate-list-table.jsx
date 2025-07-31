import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { UserCreateForm } from './user-create-form.jsx'; // New import for adding users
import { TextField } from '@mui/material';

const MOCK_USERS = [
  {
    id: '1',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    role: 'Admin',
    avatar: 'https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_1.jpg',
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1987654321',
    role: 'Recruiter',
    avatar: 'https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_2.jpg',
  },
  {
    id: '3',
    fullName: 'Peter Jones',
    email: 'peter.jones@example.com',
    phone: '+1122334455',
    role: 'Recruiter',
    avatar: 'https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_3.jpg',
  },
  {
    id: '4',
    fullName: 'Alice Brown',
    email: 'alice.brown@example.com',
    phone: '+1555123456',
    role: 'Recruiter',
    avatar: 'https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_4.jpg',
  },
  {
    id: '5',
    fullName: 'Bob White',
    email: 'bob.white@example.com',
    phone: '+1777987654',
    role: 'Admin',
    avatar: 'https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_5.jpg',
  },
  {
    id: '6',
    fullName: 'Omar',
    email: 'Omar@gmail.com',
    phone: '+1777987654',
    role: 'Admin',
    avatar: 'https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_5.jpg',
  },
];

const ROLES = ['Admin', 'Rcruiter'];
const rowsPerPage = 5; // Reduced for mock data

export function UserListTable() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [editUser, setEditUser] = useState(null); // State for user being edited
  const [deleteUserId, setDeleteUserId] = useState(null); // State for user being deleted
  const [openAddUserForm, setOpenAddUserForm] = useState(false); // State to control the add user form visibility

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Default to success

  // Simulate API call for fetching users
  const fetchUsers = useCallback(async (pageNum) => {
    setLoading(true);
    // In a real application, you'd fetch from your backend here.
    // For now, we'll slice the mock data.
    const startIndex = (pageNum - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedUsers = MOCK_USERS.slice(startIndex, endIndex);

    setUsers(paginatedUsers);
    setTotalUsers(MOCK_USERS.length); // For pagination count
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleEditClick = (user) => {
    setEditUser({ ...user }); // Create a copy to edit
  };

  const handleEditFieldChange = (event) => {
    const { name, value } = event.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = () => {
    setUsers((prevUsers) => prevUsers.map((user) => (user.id === editUser.id ? editUser : user)));
    setEditUser(null); // Close edit dialog
    setSnackbarMessage(`User ${editUser.fullName}'s details updated successfully.`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleDeleteClick = (userId) => {
    setDeleteUserId(userId);
  };

  const handleConfirmDelete = () => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== deleteUserId));
    setDeleteUserId(null); // Close delete confirmation
    const deletedUser = users.find((user) => user.id === deleteUserId); // Get user info before deletion
    // ... (existing deletion logic)
    const index = MOCK_USERS.findIndex((user) => user.id === deleteUserId);
    if (index > -1) {
      MOCK_USERS.splice(index, 1);
    }
    setSnackbarMessage(`User ${deletedUser ? deletedUser.fullName : ''} deleted successfully.`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    fetchUsers(page);
  };

  const handleAddUser = (newUser) => {
    // In a real app, you'd send this to your backend
    const newUserWithId = { ...newUser, id: (MOCK_USERS.length + 1).toString() }; // Simple ID for mock
    MOCK_USERS.push(newUserWithId); // Add to mock data
    fetchUsers(page); // Refresh the list
    setOpenAddUserForm(false);
    // ... (existing add user logic)
    setSnackbarMessage(`User ${newUser.fullName} added successfully.`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const totalPages = Math.ceil(totalUsers / rowsPerPage);

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setOpenAddUserForm(true)}
        >
          Add New User
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table aria-label="user list table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={user.avatar} sx={{ mr: 1 }} />
                        {user.fullName}
                      </Box>
                    </TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton onClick={() => handleEditClick(user)}>
                        <Iconify icon="eva:edit-fill" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(user.id)}>
                        <Iconify icon="eva:trash-2-outline" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Edit User Details</DialogTitle> {/* Changed title */}
        <DialogContent>
          {editUser && (
            <Box sx={{ pt: 1 }}>
              {' '}
              {/* Added Box for spacing */}
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={editUser.fullName || ''}
                onChange={handleEditFieldChange}
                margin="dense"
                sx={{ mb: 2 }} // Added margin-bottom
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={editUser.email || ''}
                onChange={handleEditFieldChange}
                margin="dense"
                disabled // Email usually not editable directly
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Contact (Phone)"
                name="phone" // New name for phone
                value={editUser.phone || ''}
                onChange={handleEditFieldChange}
                margin="dense"
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role-select"
                  name="role" // Added name for role
                  value={editUser.role}
                  label="Role"
                  onChange={handleEditFieldChange}
                >
                  {ROLES.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={!!deleteUserId} onClose={() => setDeleteUserId(null)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>Are you sure you want to delete this user?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUserId(null)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New User Form Dialog */}
      <Dialog
        open={openAddUserForm}
        onClose={() => setOpenAddUserForm(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <UserCreateForm onAddUser={handleAddUser} onCancel={() => setOpenAddUserForm(false)} />
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // KEY CHANGE HERE
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
