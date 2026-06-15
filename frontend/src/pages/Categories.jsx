import { Alert, Button, Paper, Stack, TextField, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../api";

export default function Categories() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api.get("/api/categories")
      .then(res => setCategories(res.data))
      .catch(err => setError(getApiErrorMessage(err, "Could not load categories")));
  };
  useEffect(() => { load(); }, []);

  const save = async event => {
    event.preventDefault();
    setError("");
    try {
      if (editing) await api.put(`/api/categories/${editing}`, form);
      else await api.post("/api/categories", form);
      setForm({ name: "", description: "" });
      setEditing(null);
      load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save category"));
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={800}>Categories</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {user.role === "ADMIN" && (
        <Paper component="form" onSubmit={save} sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required fullWidth />
            <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth />
            <Button type="submit" variant="contained">{editing ? "Update" : "Create"}</Button>
          </Stack>
        </Paper>
      )}
      <Paper>
        <Table>
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Description</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {categories.map(category => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell align="right">
                  {user.role === "ADMIN" && (
                    <>
                      <Button onClick={() => { setEditing(category.id); setForm(category); }}>Edit</Button>
                      <Button color="error" onClick={async () => {
                        try {
                          await api.delete(`/api/categories/${category.id}`);
                          load();
                        } catch (err) {
                          setError(getApiErrorMessage(err, "Could not delete category"));
                        }
                      }}>Delete</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
