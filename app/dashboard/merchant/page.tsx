"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  MenuItem,
} from "@mui/material";

export default function MerchantDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [searchOrder, setSearchOrder] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const orderId = (o.orderId || "").toString().toLowerCase();
    const customer = `${o.customerName || ""} ${o.phone || ""}`.toLowerCase();
    const status = (o.status || "").toString().toLowerCase();

    const matchesOrder = searchOrder ? orderId.includes(searchOrder.toLowerCase()) : true;
    const matchesStatus = searchStatus ? status === searchStatus.toLowerCase() || status.includes(searchStatus.toLowerCase()) : true;
    const matchesCustomer = searchCustomer ? customer.includes(searchCustomer.toLowerCase()) : true;

    return matchesOrder && matchesStatus && matchesCustomer;
  });

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "info";
    }
  };

  return (
    <Box p={4} bgcolor="#f6f7fb" minHeight="100vh">
      {/* Header */}
     <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        {/* Left side title */}
        <Typography variant="h5" ml={2} fontWeight={900} color="#1e64cdff">
          Merchant Dashboard
        </Typography>

        {/* Right side buttons */}
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            sx={{borderRadius: 2, width: 150, transition: "all .3s",  '&:hover': {background: '#1e64cdff',
                          transform: 'translateY(2px)',color: "white" },}}
            onClick={() => router.push("/dashboard/merchant/create-order")}
          >
            Create Order
          </Button>

          <Button
            variant="outlined"
            size="small"
                sx={{ borderRadius: 2, width: 150, p: 1, transition: "all .3s", '&:hover': {background: '#1e64cdff',
                          transform: 'translateY(2px)',color: "white" }, }}
        
            onClick={() => router.push("/login")}
          >
            ← Back to Login
          </Button>
        </Box>
      </Box>


      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid>
              <TextField
                fullWidth
                sx={{ minWidth: 380}}

                size="small"
                placeholder="Search by Order ID"
                value={searchOrder}
                onChange={(e) => setSearchOrder(e.target.value)}
              />
            </Grid>

            <Grid >
              <TextField
                select
                fullWidth
                sx={{maxWidth: 300, minWidth: 380}}
                size="small"
                label="Status"
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="CREATED">Created</MenuItem>
                <MenuItem value="ASSIGNED">Assigned</MenuItem>
                <MenuItem value="PICKED_UP">Picked Up</MenuItem>
                <MenuItem value="IN_TRANSIT">In Transit</MenuItem>
                <MenuItem value="DELIVERED">Delivered</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </TextField>
            </Grid>

            <Grid >
              <TextField
                fullWidth
                size="small"
                sx={{ maxWidth: 300, minWidth: 380 }}

                placeholder="Customer name or phone"
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f0f2f5" }}>
              <TableCell><b>Order</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Customer</b></TableCell>
              <TableCell><b>Phone</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((o) => (
                <TableRow
                  key={o.orderId}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => setSelectedOrder(o)}
                >
                  <TableCell>{o.orderId}</TableCell>

                  <TableCell>
                    <Chip
                      label={o.status}
                      color={statusColor(o.status)}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>{o.customerName || "-"}</TableCell>
                  <TableCell>{o.phone || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Details Dialog */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle  color="#1e64cdff" fontWeight={800}>Order Details</DialogTitle>

        <DialogContent dividers>
          {selectedOrder && (
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Detail label="Order ID" value={selectedOrder.orderId} />
              <Detail label="Status" value={selectedOrder.status} />
              <Detail label="Customer Name" value={selectedOrder.customerName} />
              <Detail label="Phone" value={selectedOrder.phone} />
              <Detail label="Delivery Address" value={selectedOrder.address} />
              <Detail label="Pickup Address" value={selectedOrder.pickAddress} />
              <Detail
                label="Cost"
                value={
                  selectedOrder.cost !== undefined
                    ? `₹${selectedOrder.cost}`
                    : "-"
                }
              />
              <Divider />
              <Detail label="Details" value={selectedOrder.details} />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button sx={{ color:"#fc0000ff"}} onClick={() => setSelectedOrder(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* Small reusable component */
function Detail({ label, value }: { label: string; value: any }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={500}>
        {value || "-"}
      </Typography>
    </Box>
  );
}
