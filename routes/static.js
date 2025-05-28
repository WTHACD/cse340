const express = require('express')
const path = require('path')
const baseController = require("../controllers/baseController");

module.exports = function(app) {
  app.use(express.static(path.join(__dirname, "../public")))
  app.use("/css", express.static(path.join(__dirname, "../public/css")))
  app.use("/js", express.static(path.join(__dirname, "../public/js")))
  app.use("/images", express.static(path.join(__dirname, "../public/images")))
  // Index route
  app.get("/", baseController. buildHome)
}
