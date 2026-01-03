import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) {
    return Response.json({ message: "User not found" }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return Response.json({ message: "Invalid password" }, { status: 401 });
  }

  const token = generateToken(user);

  return Response.json({
    token,
    role: user.role,
    name: user.name,
  });
}
