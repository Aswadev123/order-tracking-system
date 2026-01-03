"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Slide,
  Grow,
  Paper,
  Divider,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowBack,
  AdminPanelSettings,
  Business,
  DeliveryDining,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { color } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  const roleIcons: any = {
    ADMIN: <AdminPanelSettings fontSize="large" />,
    MERCHANT: <Business fontSize="large" />,
    DRIVER: <DeliveryDining fontSize="large" />,
  };

  const roleDescriptions: any = {
    ADMIN: "Full system control & analytics",
    MERCHANT: "Sell products & manage stores",
    DRIVER: "Deliver orders seamlessly",
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      if (data.role === "ADMIN") router.push("/dashboard/admin");
      else if (data.role === "MERCHANT") router.push("/dashboard/merchant");
      else if (data.role === "DRIVER") router.push("/dashboard/driver");
      else router.push("/");
    } catch (err: any) {
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200 via-slate-100 to-white p-6"
     sx={{
        background:
          "radial-gradient(1200px 600px at top, #e0e7ff 0%, #f8fafc 45%, #ffffff 100%)",
      }}>
      <Grow in={mounted} timeout={600}>
        <Card
          sx={{
            maxWidth: 500,
            borderRadius: "16px",
            overflow: "hidden",
            backdropFilter: "blur(12px)",
            alignItems: "center",
            background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))",
            boxShadow: "0 20px 60px rgba(2,6,23,0.12)",
            minHeight: "min(450px, 82vh)",
          }}
        >
          <Grid container>
            <Grid item xs={12} md={5} className="hidden md:block">
              <Slide in={mounted} direction="right" timeout={500}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    p: 6,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                    background: "linear-gradient(135deg, #4f46e5, #0ea5e9)",
                  }}
                >
                  <Button
                    startIcon={<ArrowBack />}
                    sx={{ color: "white", mb: 5 }}
                    onClick={() => router.push("/")}
                  >
                    Back to Home
                  </Button>

                  <Typography sx={{ alignItems: "center", pl: 5 }} variant="h4" fontWeight={800} gutterBottom>
                    Welcome Back
                  </Typography>

                  <Typography variant="body1" sx={{ opacity: 0.9, mb: 4 }}>
                    Sign in to manage your orders and deliveries.
                  </Typography>

                  <Divider sx={{ bgcolor: "rgba(255,255,255,0.24)", mb: 4 }} />

                  {Object.keys(roleIcons).map((role) => (
                    <Box
                      key={role}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 3,
                        p: 2,
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.08)",
                      }}
                    >
                      {roleIcons[role]}
                      <Box>
                        <Typography fontWeight={700}>{role}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85 }}>
                          {roleDescriptions[role]}
                        </Typography>
                      </Box>
                    </Box>
                  ))}

                  <Box mt={4} p={2} borderRadius={3} bgcolor="rgba(255,255,255,0.12)">
                    <Typography variant="body2">Need help? Contact support anytime.</Typography>
                  </Box>
                </Paper>
              </Slide>
            </Grid>

            <Grid item xs={12} md={7}>
              <CardContent sx={{ p: { xs: 4, md: 6 } }}>
                <Slide in={mounted} direction="up" timeout={450}>
                  <Box>
                    <Box display="flex" alignItems="center" mb={2}>
                      <IconButton onClick={() => router.push("/")}> <ArrowBack /> </IconButton>
                      <Typography variant="h5" fontSize={35} fontWeight={900} ml={7}>
                        Welcome Back
                      </Typography>
                    </Box>

                    <Typography color="text.secondary" mb={3} ml={10} >
                      Sign in to access your dashboard
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                      sx={{ width: 400 }}
                          size="large"
                          label="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="large"
                           sx={{ width: 400 }}
                          label="Password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)}>
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      {error && (
                        <Grid item xs={12}>
                          <Alert severity="error">{error}</Alert>
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <Button
                          fullWidth
                          size="large"
                          onClick={handleLogin}
                          disabled={loading}
                          sx={{
                            ml: 10,
                            width: 260,
                            py: 1.4,
                            fontWeight: 800,
                            color: "white",
                            borderRadius: 3,
                            background: "linear-gradient(135deg,#6366f1,#0ea5e9)",
                            boxShadow: "0 18px 36px rgba(13,42,148,0.12)",
                              transition: "all .5s",
                        '&:hover': {background: 'linear-gradient(135deg,#6366f1,#0ea5e9) 60% ',
                          transform: 'translateY(2px)',
                        },
                          }}
                        >
                          {loading ? "Signing in..." : "Sign in"}
                        </Button>
                      </Grid>

                      <Grid item xs={12} textAlign="center">
                        <Typography variant="caption" ml={15} color="text.secondary">
                          Don’t have an account?{' '}
                          <span className="text-blue-600 cursor-pointer" color="blue" onClick={() => router.push('/register')}>
                            Register
                          </span>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Slide>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
      </Grow>
    </Box>
  );
}
