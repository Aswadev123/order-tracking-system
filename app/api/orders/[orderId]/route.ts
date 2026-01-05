import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

export async function GET(req: Request, context: any) {
  const paramsSource = context?.params;
  const params = paramsSource && typeof paramsSource.then === "function" ? await paramsSource : paramsSource;
  const token = req.headers.get("authorization")?.split(" ")[1];

  let user: any;
  try {
    user = jwt.verify(token!, process.env.JWT_SECRET!) as any;
  } catch (err) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const order = await Order.findOne({ orderId: params?.orderId }).lean();
  if (!order) return Response.json({ message: "Order not found" }, { status: 404 });

  // Authorization: admin can view all, merchant can view their own orders, driver can view if assigned
  if (user.role === "ADMIN" || (user.role === "MERCHANT" && String(order.merchantId) === String(user.id)) || (user.role === "DRIVER" && String(order.driverId) === String(user.id))) {
    return Response.json(order);
  }

  return Response.json({ message: "Forbidden" }, { status: 403 });
}
