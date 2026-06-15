import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { PersonAddAlt1 } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api, { getApiErrorMessage } from "../api";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = async event => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/api/auth/register", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create account"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="auth-page">
      <Paper className="auth-card" elevation={0}>
        <Box className="auth-mark">
          <PersonAddAlt1 fontSize="small" />
        </Box>
        <Typography variant="h4" fontWeight={900}>Create Account</Typography>
        <Typography color="text.secondary">New accounts receive the USER role.</Typography>
        <Box component="form" onSubmit={submit}>
          <Stack spacing={2} mt={3}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            <TextField label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <TextField label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {submitting ? "Creating..." : "Register"}
            </Button>
            <Button component={Link} to="/login" disabled={submitting}>Back to login</Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
