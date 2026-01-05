"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  Grid
} from "@mui/material";

export default function CreateOrderPage() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [pickAddress, setPickAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [cost, setCost] = useState("");
  const [details, setDetails] = useState("");

  const createOrder = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "MERCHANT") {
      router.push("/login");
      return;
    }

    if (!customerName || !address || !phone) {
      alert("Please fill customer name, delivery address and phone number");
      return;
    }

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName,
          address,
          pickAddress,
          phone,
          cost,
          details,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to create order");
        return;
      }

      alert("Order Created Successfully");
      router.push("/dashboard/merchant");
    } catch {
      alert("Network error");
    }
  };

  return (
    <Box bgcolor="#f4f6fa" minHeight="100vh" px={{ xs: 2, md: 4 }} py={4}>
      {/* Header */}
      <Box
        maxWidth={760}
        mx="auto"
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography variant="h4" fontWeight={900} color="#1e64cd">
            Create Order
          </Typography>
          <Typography color="text.secondary">
            Enter order and customer details
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() => router.push("/dashboard/merchant")}
          sx={{
            borderRadius: 2,
            "&:hover": {
              background: "#1e64cd",
              color: "#fff",
            },
          }}
        >
          Back
        </Button>
      </Box>

      {/* Form */}
      <Card
        sx={{
          maxWidth: 760,
          mx: "auto",
          borderRadius: 3,
          boxShadow: "0 20px 50px rgba(2,6,23,0.08)",
        }}
      >
        <CardContent>
          <Typography fontWeight={700} mb={2}>
            Customer Information
          </Typography>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography fontWeight={700} mb={2}>
            Address Details
          </Typography>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Pickup Address"
                value={pickAddress}
                onChange={(e) => setPickAddress(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Delivery Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography fontWeight={700} mb={2}>
            Order Information
          </Typography>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Cost"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} >
              <TextField
                fullWidth
                multiline
                
                rows={1}
                label="Order Details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </Grid>
          </Grid>

          <Box mt={4}>
            <Button
              fullWidth
              size="large"
              onClick={createOrder}
              sx={{
                py: 1.6,
                fontWeight: 800,
                color: "white",
                borderRadius: 2.5,
                background: "linear-gradient(135deg,#6366f1,#0ea5e9)",
                   transition: "all .3s",
                        '&:hover': {background: 'linear-gradient(135deg,#6366f1,#0ea5e9) 60% ',
                          transform: 'translateY(2px)',
                        },
              }}
            >
              Create Order
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
