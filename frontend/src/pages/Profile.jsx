import { Paper, Stack, Typography } from "@mui/material";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={800}>Profile</Typography>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={1}>
          <Typography><strong>Username:</strong> {user.username}</Typography>
          <Typography><strong>Email:</strong> {user.email}</Typography>
          <Typography><strong>Role:</strong> {user.role}</Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}
