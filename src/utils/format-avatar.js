export function stringAvatar(name) {
  const nameParts = name.split(' ');
  const initials = nameParts.length > 1 ? nameParts[0][0] + nameParts[1][0] : nameParts[0][0];

  return {
    children: initials.toUpperCase(),
    sx: {
      bgcolor: '#1976d2', // You can change this color as needed
    },
  };
}
