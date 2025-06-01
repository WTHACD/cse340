const express = require('express');
const app = express();
const expressLayouts = require("express-ejs-layouts");
const path = require('path'); 
const env = require("dotenv").config(); 
const utilities = require("./utilities/"); 
const baseController = require("./controllers/baseController"); 

const inventoryRoute = require("./routes/inventoryRoute"); 

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs"); 
app.set('views', path.join(__dirname, 'views'));  
app.use(expressLayouts); //
app.set("layout", "layouts/layout"); 

/* ***********************
 * Static Files
 *************************/

app.use(express.static(path.join(__dirname, 'public'))); 

/* ***********************
 * Routes
 *************************/

require("./routes/static")(app); 



// Inventory routes
app.use("/inv", inventoryRoute); 

/* ***********************
 * Server Listener
 *************************/
const port = process.env.PORT || 3000; 
app.listen(port, () => { //
  console.log(`App listening on port ${port}`); 
});

// File Not Found Route - must be last route in list
app.get("/intentional-error", utilities.handleErrors(async (req, res, next) => {
throw new Error("Intentional Server Error (500 Type)");  
}));

app.use(async (req, res, next) => { 
 
  if (req.originalUrl.match(/\.(css|js|jpg|png|gif|ico)$/i)) {
    return res.status(404).send('Static file not found.'); // 404 simple
  }
  next({status: 404, message: `Sorry, we appear to have lost that page: ${req.path}`}); //
});

/* ***********************
* Express Error Handler
*************************/
app.use(async (err, req, res, next) => { 
  let nav = "<nav><ul><li><a href='/'>Home</a></li></ul></nav>"; 
  try {
   
    if (!req.originalUrl.match(/\.(css|js|jpg|png|gif|ico)$/i) || err.status !== 404) {
      nav = await utilities.getNav(); 
    }
  } catch (navError) {
    console.error("Error getting nav in error handler:", navError);
  }
  
  console.error(`Error at: "${req.originalUrl}": ${err.message}`); 

  let message; 
  if (err.status == 404) { 
    message = err.message; 
  } else { 
    message = 'Oh no! There was a crash. Maybe try a different route?'; 
  }

  res.render("errors/error", { 
    title: err.status || 'Server Error', 
    message, 
    nav 
  });
});