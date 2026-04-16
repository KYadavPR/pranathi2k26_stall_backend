const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const Counter = require("../models/Counter");

// Helper function to update product stock using atomic operations
async function adjustStock(items, multiplyBy = 1) {
    for (const item of items) {
        // Ensure we have a valid ID. Sometimes _id might be a string or ObjectId depending on source.
        const productId = item._id;
        if (!productId) continue;

        const qty = (item.quantity || 1) * multiplyBy;
        // decrement = qty. If multiplyBy is 1 (deduct), decrement is +qty. 
        // If multiplyBy is -1 (restore), decrement is -qty (which means increment by qty).
        const decrement = qty;

        const product = await Product.findById(productId);
        if (!product) continue;

        if (product.type === "combo") {
            // Deduct from ALL components. 
            // Note: We don't use Math.max(0) here with $inc easily without pre-check or sessions,
            // but the UI prevents ordering more than stock anyway.
            await Product.updateMany(
                { _id: { $in: product.components } },
                { $inc: { stock: -decrement } }
            );
        } else {
            // Individual product
            await Product.findByIdAndUpdate(productId, { $inc: { stock: -decrement } });
        }
    }
}

router.post("/", async (req, res) => {
    try {
        const { items } = req.body;
        let totalProfit = 0;
        let totalPrice = 0;

        // Perform stock deduction
        await adjustStock(items, 1);

        // Calculate totals based on current product prices (safer than trusting client total)
        for (const item of items) {
            const product = await Product.findById(item._id);
            if (!product) continue;
            const qty = item.quantity || 1;
            totalPrice += product.price * qty;
            totalProfit += (product.price - (product.cost || 0)) * qty;
        }

        // Auto-increment tokenNumber starting from 100
        let counter = await Counter.findOneAndUpdate(
            { id: "orderToken" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // If it was just created, it might be 100 or 101 depending on how mongo handles default vs inc.
        // To be safe and strict starting from 100:
        if (counter.seq < 100) {
            counter = await Counter.findOneAndUpdate(
                { id: "orderToken" },
                { $set: { seq: 100 } },
                { new: true }
            );
        }

        const tokenNumber = counter.seq;

        const order = new Order({
            items,
            total: totalPrice,
            profit: totalProfit,
            tokenNumber,
            status: req.body.status || "pending"
        });

        await order.save();
        res.json(order);
    } catch (error) {
        console.error("Order error:", error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/user", async (req, res) => {
    try {
        const ids = JSON.parse(req.query.ids || "[]");
        const orders = await Order.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const oldOrder = await Order.findById(req.params.id);
        if (!oldOrder) return res.status(404).send("Order not found");

        // Admin marking as completed (paid)
        if (req.body.status === "completed" && oldOrder.status === "pending") {
            const updated = await Order.findByIdAndUpdate(req.params.id, { status: "completed" }, { new: true });
            return res.json(updated);
        }

        // Customer editing items (only if pending)
        if (oldOrder.status === "pending" && req.body.items) {
            // 1. Restore stock to inventory from the OLD version of the order
            await adjustStock(oldOrder.items, -1);

            // 2. Deduct stock for the NEW version of the order
            await adjustStock(req.body.items, 1);

            // 3. Recalculate totals
            let totalProfit = 0;
            let totalPrice = 0;
            for (const item of req.body.items) {
                const product = await Product.findById(item._id);
                if (!product) continue;
                const qty = item.quantity || 1;
                totalPrice += product.price * qty;
                totalProfit += (product.price - (product.cost || 0)) * qty;
            }
            req.body.total = totalPrice;
            req.body.profit = totalProfit;
        }

        const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        console.error("Update order error:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;