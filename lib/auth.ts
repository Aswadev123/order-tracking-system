import jwt from "jsonwebtoken";

export const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};
