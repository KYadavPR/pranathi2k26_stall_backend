const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    items: Array,
    total: Number,
    profit: { type: Number, default: 0 },
    tokenNumber: { type: Number },
    status: { type: String, default: "pending" },
    paymentMode: { type: String, default: "cash" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);