const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB Connected");

        // Check if admin already exists
        const existing = await Admin.findOne({ username: "admin" });
        if (existing) {
            console.log("Admin already exists. Use username: admin and your password.");
            process.exit();
        }

        const hashed = await bcrypt.hash("admin123", 10);
        const admin = new Admin({ username: "admin", password: hashed });
        await admin.save();

        console.log("Default Admin Created!");
        console.log("Username: admin");
        console.log("Password: admin123");
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
