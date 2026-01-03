import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = jwt.verify(token!, process.env.JWT_SECRET!) as any;

  await connectDB();
  const orders = await Order.find({ merchantId: user.id });

  return Response.json(orders);
}
