/******************************************
 * Main server file
 *******************************************/
const express = require("express")
const app = express()
const expressLayouts = require("express-ejs-layouts")
const inventoryRoute = require("./routes/inventoryRoute");
const env = require("dotenv").config()
const utilities = require("./utilities/");
const baseController = require("./controllers/baseController");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.use(express.static('public'));
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Static Files
 *************************/
require("./routes/static")(app) 

/* ***********************
 * Routes
 *************************/

app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory routes
app.use("/inv", inventoryRoute)

/* ***********************
 * Server Listener
 *************************/
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})
/* ***********************
* Express Error Handler
* Colocar después de TODOS los demás middleware y rutas
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav() // Esto ya debería estar funcionando
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  let message; // Declara la variable message aquí
  if (err.status == 404) { message = err.message } else { message = 'Oh no! There was a crash. Maybe try a different route?' }

  res.render("errors/error", {
    title: err.status || 'Server Error',
    message, // Usa la variable 'message' genérica
    nav
  })
});
