import { Alert, Button, Paper, Stack, TextField, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../api";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const load = () => {
    setError("");
    setLoading(true);
    api.get("/api/documents", { params: q ? { q } : {} })
      .then(res => setDocuments(res.data))
      .catch(err => setError(getApiErrorMessage(err, "Could not load documents")))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
        <Typography variant="h4" fontWeight={800}>Documents</Typography>
        <Button component={Link} to="/documents/upload" variant="contained">Upload</Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField label="Keyword filter" value={q} onChange={e => setQ(e.target.value)} fullWidth />
          <Button variant="outlined" onClick={load} disabled={loading}>{loading ? "Loading..." : "Search"}</Button>
        </Stack>
      </Paper>
      <Paper>
        <Table>
          <TableHead><TableRow><TableCell>Title</TableCell><TableCell>Category</TableCell><TableCell>Uploaded</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {!documents.length && (
              <TableRow>
                <TableCell colSpan={4}>No documents found.</TableCell>
              </TableRow>
            )}
            {documents.map(doc => (
              <TableRow key={doc.id}>
                <TableCell>{doc.title}</TableCell>
                <TableCell>{doc.categoryName || "Uncategorized"}</TableCell>
                <TableCell>{doc.uploadDate?.slice(0, 10)}</TableCell>
                <TableCell align="right"><Button component={Link} to={`/documents/${doc.id}`}>Open</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
