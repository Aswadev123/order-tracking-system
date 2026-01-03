"use client";

import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Typography, Grid, Stack, Grow } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <Box  bgcolor="#f6f7fb" className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200 via-slate-100 to-white p-6">
      <Grow in={mounted} timeout={600}>
        <Card
          sx={{
            width: "100%",
            maxWidth: 1100,
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(2,6,23,0.12)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.9))",
          }}
        >
          <Grid container>
            <Grid item xs={12} md={6} sx={{ p: { xs: 4, md: 8 }, display: { xs: "block", md: "flex" }, alignItems: "center" }}>
              <CardContent>
                <Typography variant="h3" fontWeight={900} gutterBottom>
                  OrderFlow — Fast, Reliable Deliveries
                </Typography>
                <Typography variant="h6" color="text.secondary" mb={3}>
                  Create orders, assign drivers, and track deliveries in real-time.
                </Typography>

                <Stack spacing={1.2} mb={4}>
                  <Typography>
                    • Real-time updates with SSE
                  </Typography>
                  <Typography>
                    • Full order history and role-based access
                  </Typography>
                  <Typography>
                    • Simple APIs and clean dashboards for merchants, drivers and admins
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Button
                    size="large"
                    onClick={() => router.push('/register')}
                    sx={{
                      py: 1.4,
                      px: 4,
                      fontWeight: 800,
                      borderRadius: 3,
                      background: "linear-gradient(135deg,#10b981,#06b6d4)",
                      color: "white",
                       transition: "all .3s",
                      boxShadow: "0 18px 36px rgba(16,185,129,0.12)",
                      textTransform: "none",
                      '&:hover': {
                          transform: 'translateY(2px)',color: "white" },
                    }}
                  >
                    Create Account
                  </Button>

                  <Button
                    size="large"
                    variant="outlined"
                    onClick={() => router.push('/login')}
                    sx={{
                      py: 1.4,
                      px: 4,
                      fontWeight: 700,
                      transition: "all .3s",
                         '&:hover': { background: '#c9c9c9ff',
                          transform: 'translateY(2px)',color: "white" },
                      borderRadius: 3,
                      textTransform: "none",
                      borderColor: (theme) => theme.palette.grey[300],
                    }}
                  >
                    Sign In
                  </Button>
                </Stack>
              </CardContent>
            </Grid>

          
          </Grid>
        </Card>
      </Grow>
    </Box>
  );
}
