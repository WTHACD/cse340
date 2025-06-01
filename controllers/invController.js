const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 * Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 * Build vehicle detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const invId = parseInt(req.params.invId);
  console.log("Controller: Attempting to get vehicle data for invId:", invId); // LOG ADDED
  const vehicleData = await invModel.getVehicleById(invId);
  console.log("Controller: Vehicle data received:", vehicleData); // LOG ADDED

  if (vehicleData) {
      const vehicleDetailHtml = utilities.buildVehicleDetailHtml(vehicleData);
      let nav = await utilities.getNav();
      res.render('inventory/vehicle-detail', {
          title: `${vehicleData.inv_make} ${vehicleData.inv_model} Details`,
          nav,
          vehicleDetailHtml: vehicleDetailHtml,
          vehicleData: vehicleData
      });
  } else {
      console.log("Controller: Vehicle data not found for invId:", invId); // LOG ADDED
      next({status: 404, message: 'Sorry, we could not find that vehicle.'});
  }
}

module.exports = invCont;