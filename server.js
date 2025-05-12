/******************************************
 * Main server file
 *******************************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Static Files
 *************************/
require("./routes/static")(app) // <-- ahora es una función que pasa app

/* ***********************
 * Routes
 *************************/
app.get("/", function(req, res){
  res.render("index", { title: "Home" })
})

/* ***********************
 * Server Listener
 *************************/
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
