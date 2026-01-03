import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  let user: any;
  try {
    user = jwt.verify(token!, process.env.JWT_SECRET!) as any;
  } catch (err) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const merchantId = url.searchParams.get("merchantId");
  const customer = url.searchParams.get("customer");
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");

  const filter: any = {};
  if (status) filter.status = status;
  if (merchantId) filter.merchantId = merchantId;
  if (customer) {
    filter.$or = [{ customerName: { $regex: customer, $options: "i" } }, { phone: { $regex: customer, $options: "i" } }];
  }
  if (start || end) {
    filter.updatedAt = {};
    if (start) filter.updatedAt.$gte = new Date(start);
    if (end) filter.updatedAt.$lte = new Date(end);
  }

  // Authorization: ADMIN can query any; MERCHANT limited to their merchantId
  if (user.role === "MERCHANT") {
    filter.merchantId = user.id;
  } else if (user.role !== "ADMIN") {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const results = await Order.find(filter).sort({ updatedAt: -1 }).lean();
  return Response.json(results);
}
