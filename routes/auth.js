const bcrypt = require("bcrypt");
const Users = require("../models/User");
var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken")

router.post("/register", async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body

        if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            throw new Error("Password must be at least 8 characters long and include both numbers and alphabets.")
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            throw new Error("Invalid email format.")
        }

        if (firstName.length < 3) {
            throw new Error("First name must be at least 3 characters long.")
        }
        if (lastName.length < 3) {
            throw new Error("Last name must be at least 3 characters long.")
        }

        let user = await Users.findOne({ email })
        if (user) return res.json({ msg: "USER EXISTS" })

        await Users.create({ ...req.body, password: await bcrypt.hash(password, 5) });

        return res.json({ msg: "CREATED" })
    } catch (error) {
        console.error(error)
        return res.status(400).json({ error: error.message })
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await Users.findOne({ email })
        if (!user) return res.json({ msg: "USER NOT FOUND" })

        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) return res.json({ msg: "WRONG PASSWORD" })

        const token = jwt.sign({
            email,
            createdAt: new Date(),
            admin: user.admin,
        }, "MY_SECRET", { expiresIn: "1d" });

        res.json({
            msg: "LOGGED IN", token
        })
    } catch (error) {
        console.error(error)
    }
});

module.exports = router
