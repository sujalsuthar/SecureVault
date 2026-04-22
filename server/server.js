require("dotenv").config();

const cors = require("cors");
const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const apiRoutes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to SecureVault API" });
});

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
