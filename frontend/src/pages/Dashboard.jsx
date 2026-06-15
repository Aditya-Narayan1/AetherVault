import { Alert, Box, Grid, Paper, Stack, Typography } from "@mui/material";
import { Category, Description, Group } from "@mui/icons-material";
import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../api";

export default function Dashboard() {
  const [counts, setCounts] = useState({ documents: 0, categories: 0, users: 0 });
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    setError("");
    Promise.all([
      api.get("/api/documents"),
      api.get("/api/categories"),
      user.role === "ADMIN" ? api.get("/api/users") : Promise.resolve({ data: [] })
    ]).then(([docs, cats, users]) => {
      setCounts({ documents: docs.data.length, categories: cats.data.length, users: users.data.length });
    }).catch(err => setError(getApiErrorMessage(err, "Could not load dashboard")));
  }, [user.role]);

  return (
    <Box>
      <Box className="page-heading">
        <Typography variant="h4" fontWeight={900}>Dashboard</Typography>
        <Typography color="text.secondary">Monitor documents, categories, and access control from one workspace.</Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        {[
          ["Documents", counts.documents, <Description />],
          ["Categories", counts.categories, <Category />],
          ["Users", user.role === "ADMIN" ? counts.users : "Admin only", <Group />]
        ].map(([label, value, icon]) => (
          <Grid item xs={12} md={4} key={label}>
            <Paper className="metric-card">
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary">{label}</Typography>
                  <Typography variant="h3" fontWeight={900}>{value}</Typography>
                </Box>
                <Box className="metric-icon">{icon}</Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
