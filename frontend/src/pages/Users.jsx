import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "USER" });
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api.get("/api/users")
      .then(res => setUsers(res.data))
      .catch(err => setError(getApiErrorMessage(err, "Could not load users")));
  };
  useEffect(() => { load(); }, []);

  const save = async event => {
    event.preventDefault();
    setError("");
    try {
      if (editing) await api.put(`/api/users/${editing}`, form);
      else await api.post("/api/users", form);
      setEditing(null);
      setForm({ username: "", email: "", password: "", role: "USER" });
      load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save user"));
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={800}>Users</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Paper component="form" onSubmit={save} sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
          <TextField label="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required fullWidth />
          <TextField label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required fullWidth />
          <TextField label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editing} fullWidth />
          <TextField select label="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} fullWidth>
            <MenuItem value="USER">USER</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
          </TextField>
          <Button type="submit" variant="contained">{editing ? "Update" : "Create"}</Button>
        </Stack>
      </Paper>
      <Paper>
        <Table>
          <TableHead><TableRow><TableCell>Username</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell align="right">
                  <Button onClick={() => {
                    setEditing(user.id);
                    setForm({ username: user.username, email: user.email, password: "", role: user.role || "USER" });
                  }}>Edit</Button>
                  <Button color="error" onClick={async () => {
                    try {
                      await api.delete(`/api/users/${user.id}`);
                      load();
                    } catch (err) {
                      setError(getApiErrorMessage(err, "Could not delete user"));
                    }
                  }}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
