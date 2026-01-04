import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import OrderHistory from "@/models/OrderHistory";
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

  const { orderId, expectedSeq } = await req.json();
  if (!orderId) return Response.json({ message: "orderId required" }, { status: 400 });
  if (expectedSeq === undefined || typeof expectedSeq !== 'number') {
    return Response.json({ message: "expectedSeq (number) is required for concurrency control" }, { status: 400 });
  }

  await connectDB();

  const existing = await Order.findOne({ orderId });
  if (!existing) return Response.json({ message: "Order not found" }, { status: 404 });

  const updated = await Order.findOneAndUpdate(
    { orderId, seq: expectedSeq },
    { $set: { driverId: null, status: "CREATED" }, $inc: { seq: 1 } },
    { new: true }
  );

  if (!updated) {
    const current = await Order.findOne({ orderId }).lean();
    return Response.json({ message: "Sequence conflict or duplicate update", currentSeq: current?.seq, currentStatus: current?.status }, { status: 409 });
  }

  const prevStatus = existing.status;

  try {
    await OrderHistory.create({
      orderId: updated.orderId,
      status: updated.status,
      seq: updated.seq,
      updatedBy: user.id,
      role: user.role,
      metadata: {
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.headers.get("x-client-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || null,
        source: "ADMIN_UNASSIGN",
        prevStatus,
      },
    });
  } catch (err) {
    console.error("Failed to write order history:", err);
  }

  // publish realtime event
  try {
    const realtime = (await import("@/lib/realtime")).default;
    realtime.publish("order.updated", { orderId: updated.orderId, status: updated.status, seq: updated.seq });
  } catch (e) {
    console.error("Realtime publish failed:", e);
  }

  return Response.json({ message: "Driver unassigned", orderId: updated.orderId, seq: updated.seq });
}
