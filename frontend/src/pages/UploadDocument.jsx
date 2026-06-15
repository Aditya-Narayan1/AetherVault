import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../api";

export default function UploadDocument() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", categoryId: "" });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/categories")
      .then(res => setCategories(res.data))
      .catch(err => setError(getApiErrorMessage(err, "Could not load categories")));
  }, []);

  const submit = async event => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      if (form.categoryId) payload.append("categoryId", form.categoryId);
      payload.append("file", file);
      const { data } = await api.post("/api/documents", payload);
      navigate(`/documents/${data.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not upload document"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={800}>Upload Document</Typography>
      <Paper component="form" onSubmit={submit} sx={{ p: 3 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} multiline rows={4} />
          <TextField select label="Category" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
            <MenuItem value="">Uncategorized</MenuItem>
            {categories.map(category => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
          </TextField>
          <Button variant="outlined" component="label">
            {file ? file.name : "Choose file"}
            <input hidden type="file" accept=".pdf,.docx,.txt" onChange={e => setFile(e.target.files[0])} required />
          </Button>
          <Button type="submit" variant="contained" disabled={!file || submitting}>
            {submitting ? "Uploading..." : "Upload"}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
