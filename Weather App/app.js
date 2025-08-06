import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import weatherRoute from "./routes/weather.js";

dotenv.config();

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Set the views directory path to an absolute path
app.set("views", path.join(__dirname, "views"));

// Set static files and view engine
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use("/node_modules", express.static(path.join(__dirname, "node_modules"))); // Serve node_modules

// Mount routes
app.use("/weather", weatherRoute);

app.get("/", (req, res) => {
  res.render("index.ejs", { weatherData: null, error: null });
});

app.get("/weather", (req, res) => {
  res.render("index.ejs", { weatherData: null, error: null });
});

app.listen(port, () => {
  console.log("listening on port " + port);
});
