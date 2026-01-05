"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
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

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

const roleIcons: Record<string, React.ReactNode> = {
    ADMIN: <AdminPanelSettings fontSize="large" />,
    MERCHANT: <Business fontSize="large" />,
    DRIVER: <DeliveryDining fontSize="large" />,
  };

  const roleDescriptions: Record<string, string> = {
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
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      sx={{
        background:
          "radial-gradient(1200px 600px at top, #e0e7ff 0%, #f8fafc 45%, #ffffff 100%)",
      }}
    >
      <Grow in={mounted} timeout={600}>
        <Card
          sx={{
            maxWidth: 500,
            width: "100%",
            borderRadius: 4,
            overflow: "hidden",
            backdropFilter: "blur(12px)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))",
            boxShadow: "0 20px 60px rgba(2,6,23,0.12)",
          }}
        >
          <Box display="flex">
            {/* LEFT PANEL (hidden on small screens) */}
          

            {/* RIGHT PANEL */}
            <Box width={{ xs: "100%", md: "100%" }}>
              <CardContent sx={{ p: 5 }}>
                <Slide in={mounted} direction="up" timeout={450}>
                  <Box>
                    <Box display="flex" alignItems="center" mb={2}>
                      <IconButton onClick={() => router.push("/")}>
                        <ArrowBack />
                      </IconButton>
                      <Typography variant="h5" fontWeight={900} ml={15}>
                        Sign In
                      </Typography>
                    </Box>

                    <Typography color="text.secondary" mb={3} ml={15}>
                      Access your dashboard
                    </Typography>

                    <Box display="flex" flexDirection="column" gap={2}>
                      <TextField
                        fullWidth
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

                      <TextField
                        fullWidth
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

                      {error && <Alert severity="error">{error}</Alert>}

                      <Button
                        size="large"
                        onClick={handleLogin}
                        disabled={loading}
                        sx={{
                          py: 1.4,
                          fontWeight: 800,
                          color: "white",
                          borderRadius: 3,
                          background: "linear-gradient(135deg,#6366f1,#0ea5e9)",
                          boxShadow: "0 18px 36px rgba(13,42,148,0.12)",
                             transition: "all .3s",
                        '&:hover': {background: 'linear-gradient(135deg,#6366f1,#0ea5e9) 60% ',
                          transform: 'translateY(2px)',
                        },
                        }}
                      >
                        {loading ? "Signing in..." : "Sign in"}
                      </Button>

                      <Typography variant="caption" textAlign="center">
                        Don’t have an account?{" "}
                        <span
                          style={{ color: "#2563eb", cursor: "pointer" }}
                          onClick={() => router.push("/register")}
                        >
                          Register
                        </span>
                      </Typography>
                    </Box>
                  </Box>
                </Slide>
              </CardContent>
            </Box>
          </Box>
        </Card>
      </Grow>
    </Box>
  );
}
