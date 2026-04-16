const router = require("express").Router();
const Product = require("../models/Product");

router.post("/", async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/", async (req, res) => {
    try {
        let products = await Product.find().populate("components");

        // For combos, the effective stock is the MIN of manual stock AND component stock
        products = products.map(p => {
            if (p.type === "combo" && p.components && p.components.length > 0) {
                const minComponentStock = Math.min(...p.components.map(c => c.stock));
                // If admin set a manual stock (p.stock > 0), use the smaller of the two.
                // If p.stock is 0 or undefined, default to component stock.
                const manualStock = p.stock || 0;
                const finalStock = manualStock > 0 ? Math.min(manualStock, minComponentStock) : minComponentStock;
                return { ...p._doc, stock: finalStock };
            }
            return p;
        });

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json("Deleted");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;