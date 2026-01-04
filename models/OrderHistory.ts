import mongoose from "mongoose";

const OrderHistorySchema = new mongoose.Schema({
  orderId: String,
  status: String,
  // sequence number copied from Order.seq at the time of the change
  seq: Number,
  updatedBy: mongoose.Schema.Types.ObjectId,
  role: String,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

export default mongoose.models.OrderHistory ||
  mongoose.model("OrderHistory", OrderHistorySchema);
