const { Router } = require("express");
const Link = require("../models/Link");
const auth = require("../middleware/auth.middleware");
const shortid = require("shortid");
const config = require("config");

const router = Router();

router.get("/:code", async (req, res) => {
  try {
    const link = await Link.findOne({ code: req.params.code });

    if (!link) res.status(500).json({ message: "Error" });

    link.clicks++;
    await link.save();
    res.redirect(link.from);
  } catch (error) {
    res.status(500).json({ message: "smth go wrong!" });
  }
});

module.exports = router;
