import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import OrderHistory from "@/models/OrderHistory";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];

  let user: any;
  try {
    user = jwt.verify(token!, process.env.JWT_SECRET!) as any;
  } catch (err) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return Response.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { orderId, driverId } = await req.json();

  // Basic validation for driverId
  if (!driverId || typeof driverId !== "string" || !/^[0-9a-fA-F]{24}$/.test(driverId)) {
    return Response.json({ message: "Invalid driverId" }, { status: 400 });
  }

  await connectDB();

  // Ensure driver exists and has DRIVER role
  const driver = await User.findById(driverId);
  if (!driver || driver.role !== "DRIVER") {
    return Response.json({ message: "Driver not found or invalid role" }, { status: 400 });
  }

  const order = await Order.findOne({ orderId });
  if (!order) return Response.json({ message: "Order not found" }, { status: 404 });

  const prevStatus = order.status;
  order.driverId = driverId;
  order.status = "ASSIGNED";
  await order.save();

  // write history entry
  try {
    await OrderHistory.create({
      orderId: order.orderId,
      status: order.status,
      updatedBy: user.id,
      role: user.role,
      metadata: {
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.headers.get("x-client-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || null,
        source: "ADMIN_ASSIGN",
        prevStatus,
        assignedDriver: driverId,
      },
    });
  } catch (err) {
    console.error("Failed to write order history:", err);
  }
  // publish realtime event
  try {
    const realtime = (await import("@/lib/realtime")).default;
    realtime.publish("order.updated", { orderId: order.orderId, status: order.status, assignedDriver: driverId });
  } catch (e) {
    console.error("Realtime publish failed:", e);
  }

  return Response.json({ message: "Driver assigned", orderId: order.orderId });
}
