"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
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
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  TextField,
} from "@mui/material";

interface Order {
  orderId: string;
  status: string;
  driverId?: string;
  customerName?: string;
  address?: string;
  pickAddress?: string;
  phone?: string;
  cost?: number;
  details?: string;
}

interface Driver {
  _id: string;
  name: string;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDriver, setSelectedDriver] = useState("");

  // 🔍 Filters
  const [searchOrder, setSearchOrder] = useState("");
  const [assignmentFilter, setAssignmentFilter] =
    useState<"all" | "assigned" | "unassigned">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "created" | "assigned" | "delivered" | "cancelled"
  >("all");

  const driversMap = useMemo(() => {
    const map: Record<string, string> = {};
    drivers.forEach((d) => (map[d._id] = d.name));
    return map;
  }, [drivers]);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchData = async () => {
    const token = getToken();
    try {
      const [ordersRes, driversRes] = await Promise.all([
        fetch("/api/orders/all", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/drivers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (driversRes.ok) setDrivers(await driversRes.json());
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    }
  };

  useEffect(() => {
    const token = getToken();
    const role = localStorage.getItem("role");
    if (!token || role !== "ADMIN") {
      router.push("/login");
      return;
    }
    fetchData();
  }, [router]);

  // 🔎 Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = o.orderId
        .toLowerCase()
        .includes(searchOrder.toLowerCase());

      const matchesAssignment =
        assignmentFilter === "all"
          ? true
          : assignmentFilter === "assigned"
          ? Boolean(o.driverId)
          : !o.driverId;

      const matchesStatus =
        statusFilter === "all"
          ? true
          : o.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesAssignment && matchesStatus;
    });
  }, [orders, searchOrder, assignmentFilter, statusFilter]);

  const assignDriver = async () => {
    if (!selectedOrder || !selectedDriver) {
      alert("Select a driver");
      return;
    }

    try {
      const res = await fetch("/api/orders/assign-driver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          orderId: selectedOrder.orderId,
          driverId: selectedDriver,
        }),
      });

      if (!res.ok) throw new Error();
      alert("Driver Assigned");
      setSelectedOrder(null);
      setSelectedDriver("");
      fetchData();
    } catch {
      alert("Failed to assign driver");
    }
  };

  const unassignDriver = async () => {
    if (!selectedOrder) return;

    try {
      const res = await fetch("/api/orders/unassign-driver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ orderId: selectedOrder.orderId }),
      });

      if (!res.ok) throw new Error();
      alert("Assignment cancelled");
      setSelectedOrder(null);
      fetchData();
    } catch {
      alert("Failed to cancel assignment");
    }
  };

  const cancelOrder = async () => {
    if (!selectedOrder) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ orderId: selectedOrder.orderId }),
      });

      if (!res.ok) throw new Error();
      alert("Order cancelled");
      setSelectedOrder(null);
      fetchData();
    } catch {
      alert("Failed to cancel order");
    }
  };

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "created":
        return "info";
      case "assigned":
        return "warning";
      case "delivered":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

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
          Admin Dashboard
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
     

      {/* 🔍 Filters */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            sx={{ minWidth: 380 }}
            placeholder="Search by Order ID"
            value={searchOrder}
            onChange={(e) => setSearchOrder(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small" sx={{ minWidth: 380 }}>
            <InputLabel>Assignment</InputLabel>
            <Select
              value={assignmentFilter}
              label="Assignment"
              onChange={(e) =>
                setAssignmentFilter(
                  e.target.value as "all" | "assigned" | "unassigned"
                )
              }
            >
              <MenuItem value="all">All Orders</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="unassigned">Unassigned</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small" sx={{ minWidth: 380 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "all"
                    | "created"
                    | "assigned"
                    | "delivered"
                    | "cancelled"
                )
              }
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="created">Created</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Orders Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f0f2f5" }}>
              <TableCell><b>Order ID</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Driver</b></TableCell>
              <TableCell><b>Customer</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredOrders.map((o) => (
              <TableRow
                key={o.orderId}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  setSelectedOrder(o);
                  setSelectedDriver(o.driverId || "");
                }}
              >
                <TableCell>{o.orderId}</TableCell>
                <TableCell>
                  <Chip label={o.status} color={statusColor(o.status)} size="small" />
                </TableCell>
                <TableCell>
                  {o.driverId ? driversMap[o.driverId] : "Unassigned"}
                </TableCell>
                <TableCell>{o.customerName || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle color="#1e64cdff" fontWeight={700}>Order Details</DialogTitle>

        <DialogContent dividers>
          {selectedOrder && (
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Detail label="Order ID" value={selectedOrder.orderId} />
              <Detail label="Status" value={selectedOrder.status} />
              <Detail
                label="Driver"
                value={
                  selectedOrder.driverId
                    ? driversMap[selectedOrder.driverId]
                    : "Unassigned"
                }
              />
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

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Order Details
                </Typography>
                <Typography fontWeight={500}>
                  {selectedOrder.details || "-"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                  <FormControl fullWidth>
                  <InputLabel>Select Driver</InputLabel>
                  <Select
                    value={selectedDriver}
                    label="Select Driver"
                    disabled={
                      Boolean(selectedOrder?.driverId) ||
                      (selectedOrder?.status || "").toString().toLowerCase() === "cancelled"
                    }
                    onChange={(e) => setSelectedDriver(e.target.value)}
                  >
                    {drivers.map((d) => (
                      <MenuItem key={d._id} value={d._id}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {!selectedOrder?.driverId ? (
            <Button variant="contained" onClick={assignDriver} disabled={(selectedOrder?.status || "").toString().toLowerCase() === "cancelled"}>
              Assign Driver
            </Button>
          ) : (
            <Button color="error" onClick={unassignDriver}>
              Unassign Driver
            </Button>
          )}

          {/* show cancel if not already cancelled or delivered */}
          {selectedOrder && !["delivered", "cancelled"].includes(selectedOrder.status.toLowerCase()) && (
            <Button color="error" onClick={cancelOrder}>
              Cancel Order
            </Button>
          )}

          <Button onClick={() => setSelectedOrder(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function Detail({ label, value }: { label: string; value?: any }) {
  return (
    <Grid item xs={12} md={6}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={600}>{value || "-"}</Typography>
    </Grid>
  );
}
