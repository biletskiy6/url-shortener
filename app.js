const express = require("express");
const config = require("config");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();

const authRoute = require("./routes/auth.routes");
const linkRoute = require("./routes/link.routes");
const redirectRoute = require("./routes/redirect.routes");

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
app.use("/api/auth", authRoute);
app.use("/api/link", linkRoute);
app.use("/t", redirectRoute);

const PORT = config.get("port") || 5000;
const DB_URI = config.get("dbUri");

async function start() {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    app.listen(PORT, () => {
      console.log("App has been started...");
    });
  } catch (e) {
    console.log(`Server error ${e.message}`);
    process.exit(1);
  }
}

start();
