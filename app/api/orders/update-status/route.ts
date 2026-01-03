import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import OrderHistory from "@/models/OrderHistory";
import { isValidStatus, canTransition } from "@/lib/orderFlow";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = jwt.verify(token!, process.env.JWT_SECRET!) as any;

  if (user.role !== "DRIVER") {
    return Response.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { orderId, status } = await req.json();
  if (!orderId) return Response.json({ message: "orderId is required" }, { status: 400 });
  if (!isValidStatus(status)) return Response.json({ message: "Invalid status value" }, { status: 400 });

  await connectDB();
  const order = await Order.findOne({ orderId });
  if (!order) return Response.json({ message: "Order not found" }, { status: 404 });

  if (!canTransition(order.status, status)) {
    return Response.json({ message: `Invalid transition from ${order.status} to ${status}` }, { status: 400 });
  }

  // perform update atomically
  const prevStatus = order.status;
  order.status = status;
  await order.save();

  // write history
  try {
    await OrderHistory.create({
      orderId: order.orderId,
      status: order.status,
      updatedBy: user.id,
      role: user.role,
      metadata: {
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.headers.get("x-client-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || null,
        source: "DRIVER_UPDATE",
        prevStatus,
      },
    });
  } catch (err) {
    console.error("Failed to write order history:", err);
  }

  // publish realtime update
  try {
    const realtime = (await import("@/lib/realtime")).default;
    realtime.publish("order.updated", { orderId: order.orderId, status: order.status, updatedAt: new Date() });
  } catch (e) {
    console.error("Realtime publish failed:", e);
  }

  return Response.json({ message: "Status updated", orderId: order.orderId, status: order.status });
}
