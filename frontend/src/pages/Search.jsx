import { Alert, Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useState } from "react";
import api, { getApiErrorMessage } from "../api";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const keyword = async () => {
    setError("");
    setLoading("keyword");
    try {
      const { data } = await api.get("/search", { params: { q: query } });
      setResults(data.map(item => ({ ...item, type: "keyword" })));
    } catch (err) {
      setError(getApiErrorMessage(err, "Keyword search failed"));
    } finally {
      setLoading("");
    }
  };

  const semantic = async () => {
    setError("");
    setLoading("semantic");
    try {
      const { data } = await api.post("/search/semantic", { query, limit: 10 });
      setResults(data.map(item => ({ ...item, type: "semantic" })));
    } catch (err) {
      setError(getApiErrorMessage(err, "Semantic search failed"));
    } finally {
      setLoading("");
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={800}>Search</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField label="Search documents" value={query} onChange={e => setQuery(e.target.value)} fullWidth />
          <Button variant="outlined" onClick={keyword} disabled={!query || Boolean(loading)}>
            {loading === "keyword" ? "Searching..." : "Keyword"}
          </Button>
          <Button variant="contained" onClick={semantic} disabled={!query || Boolean(loading)}>
            {loading === "semantic" ? "Searching..." : "Semantic"}
          </Button>
        </Stack>
      </Paper>
      {!results.length && !loading && (
        <Typography color="text.secondary">Search results will appear here after documents are uploaded and indexed.</Typography>
      )}
      {results.map(result => (
        <Paper key={`${result.type}-${result.documentId}`} sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6">{result.title}</Typography>
              <Chip size="small" label={result.type} />
              {result.score !== undefined && <Chip size="small" color="secondary" label={result.score.toFixed(3)} />}
            </Stack>
            <Typography color="text.secondary">{result.description}</Typography>
            <Button component={Link} to={`/documents/${result.documentId}`} sx={{ alignSelf: "flex-start" }}>
              Open document
            </Button>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
