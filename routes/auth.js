const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/auth/api/register-newuser", async (req, res) => {
  const { name, email, password } = req.body;
  const tasks = [
    {
      status: "pending",
      taskTitle: "Prepare presentation",
      taskDescription:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, veritatis! Repudiandae a laborum quibusdam mollitia maiores quaerat accusamus deserunt? Perferendis, asperiores. Nihil nulla magnam repudiandae?",
      taskDate: "2025-10-13",
      category: "Presentation",
      notes: [
        "Can I switch my current task to another one? This seems outside my domain",
        "I need an extension for this task. Please approve",
      ],
    },
    {
      status: "pending",
      taskTitle: "Prepare presentation",
      taskDescription:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, veritatis! Repudiandae a laborum quibusdam mollitia maiores quaerat accusamus deserunt? Perferendis, asperiores. Nihil nulla magnam repudiandae?",
      taskDate: "2025-10-13",
      category: "Presentation",
      notes: [
        "Can I switch my current task to another one? This seems outside my domain",
        "I need an extension for this task. Please approve",
      ],
    },
    {
      status: "pending",
      taskTitle: "Prepare presentation",
      taskDescription:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, veritatis! Repudiandae a laborum quibusdam mollitia maiores quaerat accusamus deserunt? Perferendis, asperiores. Nihil nulla magnam repudiandae?",
      taskDate: "2025-10-13",
      category: "Presentation",
      notes: [
        "Can I switch my current task to another one? This seems outside my domain",
        "I need an extension for this task. Please approve",
      ],
    },
  ];
  const taskCounts = {
    active: 0,
    pending: 3,
    completed: 0,
    failed: 0,
  };
  try {
    const existUser = await User.findOne({ email });
    console.log("existUser", existUser);
    if (existUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      taskCounts,
      tasks,
      role: "Frontend Developer",
      joinedDate: new Date().toLocaleDateString(),
    });
    await newUser.save();

    return res
      .status(201)
      .json({ message: "User registered successfully", newUser });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/auth/api/login-user", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(500).json({ message: "User Not Found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const { password: userPassword, ...safeUser } = user._doc;
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res
      .status(200)
      .json({ message: "Login successful", loggedUser: safeUser, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/auth/api/allusers", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/auth/api/updateUser/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.delete("/auth/api/deleteuser/:id", async (req, res) => {
  const { id } = req.params;
 
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }


    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.put("/auth/api/changepassword", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }
    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New password can not be same as before" });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.save();
    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
