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
  Grid,
  Divider,
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
    } catch (err) {
      console.error(err);
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
        alignItems="center"
        justifyContent="space-between"
      >
        <Box >
          <Typography variant="h4" color="#1e64cdff" ml={2} fontWeight={900}>
            Create Order
          </Typography>
          <Typography color="text.secondary" ml={2}>
            Enter order and customer details
          </Typography>
        </Box>

        <Button
          variant="outlined"
          sx={{ borderRadius: 2, width: 100, p: 1, transition: "all .3s", '&:hover': {background: '#1e64cdff',
                          transform: 'translateY(2px)',color: "white" }, }}
          onClick={() => router.push("/dashboard/merchant")}
        >
          Back
        </Button>
      </Box>

      {/* Form Card */}
      <Card
        sx={{
          maxWidth: 760,
          mx: "auto",
          borderRadius: 3,
          boxShadow: "0 20px 50px rgba(2,6,23,0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          {/* Section: Customer */}
          <Typography fontWeight={700} mb={2}>
            Customer Information
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                size="large"
                label="Customer Name"
                fullWidth
                sx={{minWidth:330}}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                size="large"
                label="Phone Number"
                   sx={{minWidth:330}}
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Section: Addresses */}
          <Typography fontWeight={700} mb={2}>
            Address Details
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                size="large"
                label="Pickup Address"
                  sx={{minWidth:330}}
                fullWidth
                value={pickAddress}
                onChange={(e) => setPickAddress(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                size="large"
                label="Delivery Address"
                  sx={{minWidth:330}}
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Section: Order Info */}
          <Typography fontWeight={700} mb={2}>
            Order Information
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <TextField
                size="large"
                  sx={{minWidth:330}}
                label="Cost"
                type="number"
                fullWidth
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                size="large"
                  sx={{minWidth:330}}
                label="Order Details"
                multiline
                rows={1}
                fullWidth
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </Grid>
          </Grid>

          {/* CTA */}
          <Box mt={4}>
            <Button
              fullWidth
              size="large"
              onClick={createOrder}
              sx={{
                py: 1.6,
                fontWeight: 800,
                fontSize: 16,
                color: "white",
                borderRadius: 2.5,
                background: "linear-gradient(135deg,#6366f1,#0ea5e9)",
                boxShadow: "0 18px 36px rgba(13,42,148,0.18)",
                 transition: "all .3s",
                '&:hover': {background: 'linear-gradient(135deg,#6366f1,#0ea5e9) 60% ',
                          transform: 'translateY(2px)', },
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
