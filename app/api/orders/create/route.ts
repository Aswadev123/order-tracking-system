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

  if (user.role !== "MERCHANT") {
    return Response.json({ message: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  // basic server-side validation
  if (!body.customerName || !body.address || !body.phone) {
    return Response.json({ message: "Missing required fields" }, { status: 400 });
  }

  // simple phone validation (digits, optional +, 7-15 chars)
  if (!/^[+\d]?\d{7,15}$/.test(body.phone)) {
    return Response.json({ message: "Invalid phone number" }, { status: 400 });
  }

  const cost = body.cost !== undefined && body.cost !== null && body.cost !== "" ? Number(body.cost) : undefined;
  if (cost !== undefined && (!Number.isFinite(cost) || cost < 0)) {
    return Response.json({ message: "Invalid cost" }, { status: 400 });
  }

  await connectDB();

  const order = await Order.create({
    orderId: crypto.randomUUID(),
    merchantId: user.id,
    customerName: body.customerName,
    address: body.address,
    pickAddress: body.pickAddress,
    phone: body.phone,
    cost,
    details: body.details,
  });

  // persist history entry
  try {
    await OrderHistory.create({
      orderId: order.orderId,
      status: order.status,
      updatedBy: user.id,
      role: user.role,
      metadata: {
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.headers.get("x-client-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || null,
        source: "MERCHANT_CREATE",
      },
    });
  } catch (err) {
    console.error("Failed to write order history:", err);
  }

  // publish realtime event (in-process). Use a broker like Redis for multi-instance deployments.
  try {
    const realtime = (await import("@/lib/realtime")).default;
    realtime.publish("order.created", { orderId: order.orderId, status: order.status, createdAt: order.createdAt });
  } catch (e) {
    console.error("Realtime publish failed:", e);
  }

  return Response.json({ message: "Order created", orderId: order.orderId });
}
