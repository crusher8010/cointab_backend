const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config({ path: "./config.env" });

const userRoutes = require("./Routes/userRoutes");

const app = express();
app.use(express.json());

app.use(cors({
    origin: "*"
}));

app.use("/", userRoutes);

const DB = process.env.URL.replace('<password>', process.env.password);
mongoose.connect(DB).then(() => console.log("Database Connected")).catch((err) => console.log("Database Not Connected"));

const port = process.env.port;
app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});