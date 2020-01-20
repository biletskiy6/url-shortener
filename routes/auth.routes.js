const { Router } = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

const router = Router();

// api/auth/register
router.post(
  "/register",
  [
    check("email")
      .isEmail()
      .withMessage("invalid email format"),
    check("password")
      .isLength({ min: 5 })
      .withMessage("must be at least 5 chars long")
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const isEmailExist = await User.findOne({ email });
      if (!isEmailExist) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({ email, password: hashedPassword });
        const token = jwt.sign({ userId: user.id }, config.get("jwtSecret"), {
          expiresIn: "1h"
        });
        await user.save();
        res
          .status(201)
          .json({ message: "User was successfully created", token });
      }
      res
        .status(400)
        .json({ message: "User with this email is already exist" });
    } catch (error) {
      res.status(500).json({ message: "smth go wrong!" });
    }
  }
);

// api/auth/login
router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("invalid email format"),
    check("password")
      .isLength({ min: 5 })
      .withMessage("must be at least 5 chars long")
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user)
        return res
          .status(400)
          .json({ message: "User with this email is not exist" });

      const isPasswordMatches = await bcrypt.compareSync(
        password,
        user.password
      );
      if (!isPasswordMatches)
        return res.status(400).json({ message: "Incorrect password" });

      const token = jwt.sign({ userId: user.id }, config.get("jwtSecret"), {
        expiresIn: "1h"
      });

      res.status(200).json({ token, userId: user.id });
    } catch (error) {}
  }
);

module.exports = router;
