const router = require("express").Router();
const Product = require("../models/Product");

router.post("/", async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
});

router.get("/", async (req, res) => {
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
});

router.put("/:id", async (req, res) => {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});

router.delete("/:id", async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json("Deleted");
});

module.exports = router;