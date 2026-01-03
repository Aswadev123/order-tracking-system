import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();

    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return Response.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(body.password, 10);

    await User.create({
      name: body.name,
      email: body.email,
      password: hashed,
      role: body.role,
    });

    return Response.json({ message: "User registered successfully" });

  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
