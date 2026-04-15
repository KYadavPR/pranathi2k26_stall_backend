const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    cost: Number,
    stock: Number,
    type: { type: String, enum: ["individual", "combo"], default: "individual" },
    components: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    image: { type: String, default: "" },
    description: { type: String, default: "" }
});

module.exports = mongoose.model("Product", ProductSchema);