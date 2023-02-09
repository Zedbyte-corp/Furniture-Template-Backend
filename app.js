const express = require("express");
const app = express();
const cors = require("cors");
const Config = require("./src/config/server.config");
const mongoose = require("mongoose");

// Configuration
var port = Config.port;
var host = Config.host;
const url = Config.dbUrl;

//Connect to the db
mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;

//checking the db connection
db.on("error", (err) => {
  console.log(err);
});

db.once("open", () => {
  console.log("Db connected......");
});

//Import Routes
const home = require("./src/route/home.route");
const style = require("./src/route/style.route");
const category = require("./src/route/category.route");
const product = require("./src/route/product.route");
const about = require("./src/route/about.route");
const contact = require("./src/route/contact.route");
const branch = require("./src/route/branch.route");
const discount = require("./src/route/discount.route");

// cors options
var corsOptions = {
  origin: "http://43.205.217.105",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

//MiddleWare
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

//ROUTES
app.use("/home", home);
app.use("/style", style);
app.use("/category", category);
app.use("/product", product);
app.use("/about", about);
app.use("/contact", contact);
app.use("/branch", branch);
app.use("/discount", discount);
app.get("/", function (req, res) {
  res.send("<p>TEMPLATE</p>");
});

//Listening to the server
app.listen(port, host, function () {
  console.log(`Server is running on Host: ${host}:${port}`);
});
