const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend")));

mongoose.connect("mongodb://127.0.0.1:27017/appointments")
.then(() => console.log("MongoDB Connected"));

const Booking = mongoose.model("Booking", {
    name: String,
    email: String,
    date: String,
    time: String,
    payment: String
});

app.post("/book", async (req, res) => {
    const { name, email, date, time, payment } = req.body;

    if (!name || !email || !date || !time || !payment) {
        return res.status(400).send("All fields required");
    }

    const existing = await Booking.findOne({ date, time });

    if (existing) {
        return res.status(400).send("Slot already booked");
    }

    await Booking.create({ name, email, date, time, payment });

    res.send("Booking Confirmed ✅");
});

app.get("/bookings", async (req, res) => {
    const data = await Booking.find();
    res.json(data);
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));