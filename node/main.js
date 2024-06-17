const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();


//Middleware
app.use(morgan("dev"));
app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-with, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});


// Routes handling Requests
app.get("/api/npcs", (req, res) => {
  const json = require('./jsons/npcs');
  const npcs = json.map(npc => {
    return {
      name: npc.name,
      id: npc.id
    }
  }).sort((a, b) => a.name.localeCompare(b.name));
  res.status(200).json(npcs)
});


app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
