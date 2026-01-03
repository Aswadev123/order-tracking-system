import { connectDB } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];

  let user: any;
  try {
    user = jwt.verify(token!, process.env.JWT_SECRET!) as any;
  } catch (err) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const drivers = await User.find({ role: "DRIVER" }).select("_id name").lean();

  return Response.json(drivers.map((d: any) => ({ _id: d._id, name: d.name })));
}
