import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getApiErrorMessage } from "../api";

export default function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", categoryId: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    Promise.all([api.get(`/api/documents/${id}`), api.get("/api/categories")])
      .then(([doc, cats]) => {
        setForm({
          title: doc.data.title,
          description: doc.data.description || "",
          categoryId: doc.data.categoryId || ""
        });
        setCategories(cats.data);
      })
      .catch(err => setError(getApiErrorMessage(err, "Could not load document")));
  }, [id]);

  const save = async event => {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy("save");
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      if (form.categoryId) payload.append("categoryId", form.categoryId);
      await api.put(`/api/documents/${id}`, payload);
      setMessage("Document details saved.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save document"));
    } finally {
      setBusy("");
    }
  };

  const download = () => {
    setError("");
    setMessage("");
    setBusy("download");
    api.get(`/api/documents/${id}/download`, { responseType: "blob" }).then(response => {
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = form.title || "document";
      link.click();
      URL.revokeObjectURL(url);
      setMessage("Download started.");
    }).catch(err => setError(getApiErrorMessage(err, "Could not download document")))
      .finally(() => setBusy(""));
  };

  const remove = async () => {
    setError("");
    setMessage("");
    setBusy("delete");
    try {
      await api.delete(`/api/documents/${id}`);
      navigate("/documents");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete document"));
      setBusy("");
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={800}>Document Details</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {message && <Alert severity="success">{message}</Alert>}
      <Paper component="form" onSubmit={save} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} multiline rows={4} />
          <TextField select label="Category" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
            <MenuItem value="">Uncategorized</MenuItem>
            {categories.map(category => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
          </TextField>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button type="submit" variant="contained" disabled={Boolean(busy)}>
              {busy === "save" ? "Saving..." : "Save"}
            </Button>
            <Button variant="outlined" onClick={download} disabled={Boolean(busy)}>
              {busy === "download" ? "Downloading..." : "Download"}
            </Button>
            <Button color="error" onClick={remove} disabled={Boolean(busy)}>
              {busy === "delete" ? "Deleting..." : "Delete"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
