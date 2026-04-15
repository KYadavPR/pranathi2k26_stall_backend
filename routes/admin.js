const router = require("express").Router();
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
    const hashed = await bcrypt.hash(req.body.password, 10);
    const admin = new Admin({ username: req.body.username, password: hashed });
    await admin.save();
    res.json("Admin created");
});

router.post("/login", async (req, res) => {
    const admin = await Admin.findOne({ username: req.body.username });
    if (!admin) return res.status(400).send("Not found");

    const valid = await bcrypt.compare(req.body.password, admin.password);
    if (!valid) return res.status(400).send("Wrong password");

    const token = jwt.sign({ id: admin._id }, "secret");
    res.json({ token });
});

module.exports = router;