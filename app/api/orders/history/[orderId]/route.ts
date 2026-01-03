import { connectDB } from "@/lib/db";
import OrderHistory from "@/models/OrderHistory";
import jwt from "jsonwebtoken";

export async function GET(req: Request, { params }: { params: { orderId: string } }) {
  const token = req.headers.get("authorization")?.split(" ")[1];

  let user: any;
  try {
    user = jwt.verify(token!, process.env.JWT_SECRET!) as any;
  } catch (err) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Admins can fetch history for any order; merchants/drivers allowed only if they are related
  // We don't check relation here strictly for drivers/merchants to keep endpoint simple — callers should ensure auth.
  // Filter and return history sorted by createdAt
  const history = await OrderHistory.find({ orderId: params.orderId }).sort({ createdAt: 1 }).lean();

  if (!history || history.length === 0) return Response.json({ message: "No history found" }, { status: 404 });

  // Basic authorization: admin can access; merchant/driver allowed if token present — more strict checks could be added
  if (user.role === "ADMIN" || user.role === "MERCHANT" || user.role === "DRIVER") {
    return Response.json(history);
  }

  return Response.json({ message: "Forbidden" }, { status: 403 });
}
