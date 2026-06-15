import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api, { getApiErrorMessage } from "../api";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = async event => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/api/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/");
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid username or password"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="auth-page">
      <Paper className="auth-card" elevation={0}>
        <Box className="auth-mark">
          <LockOutlined fontSize="small" />
        </Box>
        <Typography variant="h4" fontWeight={900}>AetherVault</Typography>
        <Typography color="text.secondary">Sign in to your secure document workspace.</Typography>
        <Box component="form" onSubmit={submit}>
          <Stack spacing={2} mt={3}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            <TextField label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {submitting ? "Signing in..." : "Login"}
            </Button>
            <Button component={Link} to="/register" disabled={submitting}>Create account</Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
