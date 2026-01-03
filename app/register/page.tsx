"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Fade,
  FormControl,
  Grid,
  Grow,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Slide,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Business,
  DeliveryDining,
  AdminPanelSettings,
  WidthFull,
} from "@mui/icons-material";

export default function RegisterPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "MERCHANT",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => setMounted(true), []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setSuccess("Account created successfully. Redirecting...");
      setTimeout(() => router.push("/login"), 1800);
    } catch (err: any) {
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return (score / 4) * 100;
  };

  const roleIcons: any = {
    ADMIN: <AdminPanelSettings />,
    MERCHANT: <Business />,
    DRIVER: <DeliveryDining />,
  };

  return (
    <Box
      className="min-h-screen flex items-center justify-center p-6"
      sx={{
        background:
          "radial-gradient(1200px 600px at top, #e0e7ff 0%, #f8fafc 45%, #ffffff 100%)",
      }}
    >
      <Grow in={mounted} timeout={600}>
        <Card
          sx={{
            width: "100%",
            maxWidth: 660,
            Height: 700,
            borderRadius: 4,
            backdropFilter: "blur(16px)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))",
            boxShadow: "0 40px 90px rgba(15,23,42,0.15)",
         
          }}
        >
          <CardContent sx={{ p: { xs: 4, md: 6 } }}>
            <Slide in={mounted} direction="up" timeout={500}>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  textAlign="center"
                  sx={{
                    background:
                      "linear-gradient(135deg,#4f46e5 0%,#06b6d4 50%,#22d3ee 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Create Account
                </Typography>

                <Typography
                  textAlign="center"
                  color="text.secondary"
                  mt={1}
                  mb={5}
                >
                  A secure, future-ready onboarding experience
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                    sx={{ width: 260 }}
                      label="Full Name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                       sx={{ width: 260 }}
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}            >
                    <TextField
                      fullWidth
                      label="Password"
                       sx={{ width: 260, borderRadius: 3 }}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
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

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                       sx={{ width: 260, borderRadius: 2 }}
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      error={!!form.confirmPassword && form.password !== form.confirmPassword}
                      helperText={
                        form.confirmPassword && form.password !== form.confirmPassword
                          ? "Passwords do not match"
                          : ""
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Account Type</InputLabel>
                      <Select
                        name="role"
                        value={form.role}
                         sx={{ width: 260, borderRadius: 3 }}
                        label="Account Type"
                        onChange={handleChange}
                        startAdornment={
                          <InputAdornment position="start">
                            {roleIcons[form.role]}
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="ADMIN">Admin</MenuItem>
                        <MenuItem value="MERCHANT">Merchant</MenuItem>
                        <MenuItem value="DRIVER">Driver</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

              

                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      size="large"
                      disabled={loading}
                      
                      onClick={handleRegister}
                      sx={{
                        width: 260,
                        py: 1.9,
                        fontWeight: 900,
                        borderRadius: 2,
                         background: "linear-gradient(135deg,#6366f1,#0ea5e9)",
                        color: "white",
                       
                        transition: "all .3s",
                        '&:hover': {background: 'linear-gradient(135deg,#6366f1,#0ea5e9) 60% ',
                          transform: 'translateY(2px)',
                        },
                      }}
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </Grid>
                   <Grid item xs={12} textAlign="center">
                                          <Typography variant="caption" ml={23} color="text.secondary">
                                            Already have an account?{' '}
                                            <span className="text-blue-600 cursor-pointer" color="blue" onClick={() => router.push('/login')}>
                                             login
                                            </span>
                                          </Typography>
                                        </Grid>

                  <Grid item xs={12} textAlign="center">
                      <Grid item xs={12} sx={{ }}>
                    <Fade in={!!error} >
                      <Alert severity="error">{error}</Alert>
                    </Fade>
                    <Fade in={!!success}>
                      <Alert severity="success">{success}</Alert>
                    </Fade>
                  </Grid>
                  </Grid>

                </Grid>
              </Box>
            </Slide>
          </CardContent>
        </Card>
      </Grow>
    </Box>
  );
}
