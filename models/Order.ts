import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  merchantId: { type: mongoose.Schema.Types.ObjectId, index: true },
  driverId: mongoose.Schema.Types.ObjectId,
  customerName: String,
  address: String,
  pickAddress: String,
  phone: String,
  cost: Number,
  details: String,
  status: {
    type: String,
    enum: ["CREATED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"],
    default: "CREATED",
  },
}, { timestamps: true });

// additional indexes to support queries
OrderSchema.index({ status: 1 });
OrderSchema.index({ customerName: 1 });
OrderSchema.index({ phone: 1 });
OrderSchema.index({ updatedAt: -1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
