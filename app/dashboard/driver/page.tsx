"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
} from "@mui/material";

interface Order {
  orderId: string;
  status: string;
  customerName?: string;
  address?: string;
  pickAddress?: string;
  phone?: string;
  cost?: number;
  details?: string;
}

export default function DriverDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // filters
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const token = getToken();
    const role = localStorage.getItem("role");

    if (!token || role !== "DRIVER") {
      router.push("/login");
      return;
    }

    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/driver-orders", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error("Failed to fetch driver orders", err);
    }
  };

  const updateStatus = async (status: string) => {
    if (!selectedOrder) return;

    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          orderId: selectedOrder.orderId,
          status,
        }),
      });

      if (!res.ok) throw new Error();
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      alert("Failed to update status");
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "warning";
      case "PICKED_UP":
        return "info";
      case "IN_TRANSIT":
        return "primary";
      case "DELIVERED":
        return "success";
      default:
        return "default";
    }
  };

  const hasAction = (status: string) =>
    ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(status);

  /* Filtered Orders */
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (
        searchOrderId &&
        !o.orderId.toLowerCase().includes(searchOrderId.toLowerCase())
      )
        return false;

      if (
        searchCustomer &&
        !o.customerName?.toLowerCase().includes(searchCustomer.toLowerCase())
      )
        return false;

      if (statusFilter && o.status !== statusFilter) return false;

      if (actionFilter === "YES" && !hasAction(o.status)) return false;
      if (actionFilter === "NO" && hasAction(o.status)) return false;

      return true;
    });
  }, [
    orders,
    searchOrderId,
    searchCustomer,
    statusFilter,
    actionFilter,
  ]);

  return (
    <Box p={4} bgcolor="#f6f7fb" minHeight="100vh">
 <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        {/* Left side title */}
        <Typography variant="h5" ml={2} fontWeight={900} color="#1e64cdff">
          Driver Dashboard
        </Typography>

        {/* Right side buttons */}
        <Box display="flex" gap={2}>
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

      {/* Filters */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            sx={{ minWidth:  380  }}
            placeholder="Search Order ID"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            sx={{ minWidth: 380  }}
            placeholder="Search Customer"
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            select
            size="small"
            sx={{ minWidth: 380 }}
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="ASSIGNED">Assigned</MenuItem>
            <MenuItem value="PICKED_UP">Picked Up</MenuItem>
            <MenuItem value="IN_TRANSIT">In Transit</MenuItem>
            <MenuItem value="DELIVERED">Delivered</MenuItem>
          </TextField>
        </Grid>

      </Grid>

      {/* Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f0f2f5" }}>
              <TableCell><b>Order ID</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Customer</b></TableCell>
              <TableCell><b>Phone</b></TableCell>
              <TableCell><b>Cost</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredOrders.map((o) => (
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
                    size="small"
                    color={statusColor(o.status)}
                  />
                </TableCell>
                <TableCell>{o.customerName || "-"}</TableCell>
                <TableCell>{o.phone || "-"}</TableCell>
                <TableCell>
                  {o.cost !== undefined ? `₹${o.cost}` : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Dialog */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle color="#1e64cdff" fontWeight={700}>
          Order Details
        </DialogTitle>

        <DialogContent dividers>
          {selectedOrder && (
            <Grid display="flex" flexDirection="column" gap={1.5}>
              <Detail label="Order ID" value={selectedOrder.orderId} />
              <Detail label="Status" value={selectedOrder.status} />
              <Detail label="Customer" value={selectedOrder.customerName} />
              <Detail label="Phone" value={selectedOrder.phone} />
              <Detail label="Pickup Address" value={selectedOrder.pickAddress} />
              <Detail label="Delivery Address" value={selectedOrder.address} />
              <Detail
                label="Cost"
                value={
                  selectedOrder.cost !== undefined
                    ? `₹${selectedOrder.cost}`
                    : "-"
                }
              />
              <Detail label="Details" value={selectedOrder.details} />
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          {selectedOrder?.status === "ASSIGNED" && (
            <Button onClick={() => updateStatus("PICKED_UP")}>Picked Up</Button>
          )}
          {selectedOrder?.status === "PICKED_UP" && (
            <Button onClick={() => updateStatus("IN_TRANSIT")}>In Transit</Button>
          )}
          {selectedOrder?.status === "IN_TRANSIT" && (
            <Button color="success" onClick={() => updateStatus("DELIVERED")}>
              Delivered
            </Button>
          )}
          <Button sx={{color: "red"}} onClick={() => setSelectedOrder(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* Reusable detail row */
function Detail({ label, value }: { label: string; value?: any }) {
  return (
    <Grid item xs={12}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={600}>{value || "-"}</Typography>
    </Grid>
  );
}
