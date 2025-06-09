const utilities = require("../utilities/"); 
const invModel = require("../models/inventory-model"); 
const baseController = {};

baseController.buildHome = async function(req, res, next){
  let nav = await utilities.getNav();
  //req.flash("notice", "This is a flash message.")
  // https://byui-cse.github.io/cse340-ww-content/views/session-message.html
  res.render("index", {title: "Home", nav});
}

module.exports = baseController;