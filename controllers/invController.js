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
  let className

  if (data.length > 0) {
    className = data[0].classification_name
  } else {
    const classifications = await invModel.getClassifications()
    const classification = classifications.rows.find(c => c.classification_id == classification_id)
    if (classification) {
      className = classification.classification_name
    } else {
      const err = new Error("Page Not Found")
      err.status = 404
      return next(err)
    }
  }

  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}

/* ***************************
 * Build vehicle detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const invId = parseInt(req.params.invId);
  const vehicleData = await invModel.getVehicleById(invId);

  if (vehicleData) {
      const vehicleDetailHtml = utilities.buildVehicleDetailHtml(vehicleData);
      let nav = await utilities.getNav();
      res.render('./inventory/vehicle-detail', {
          title: `${vehicleData.inv_make} ${vehicleData.inv_model} Details`,
          nav,
          vehicleDetailHtml,
          errors: null,
      });
  } else {
      next({status: 404, message: 'Sorry, we could not find that vehicle.'});
  }
}

/* ***************************
 * Build management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
  })
}

/* ***************************
 * Build add classification view
 * ************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

/* ****************************************
* Process new classification
* *************************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const addResult = await invModel.addClassification(classification_name)
  let nav = await utilities.getNav()
  if (addResult.rowCount) { 
    req.flash("notice", `The ${classification_name} classification was successfully added.`)
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    })
  } else {
    //...
    req.flash("notice", "Sorry, adding the classification failed.")
    res.status(501).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    })
  }
}

/* ***************************
 * Build add inventory view
 * ************************** */
invCont.buildAddInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationList,
    errors: null,
  })
}

/* ****************************************
* Process new inventory
* *************************************** */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

  const addResult = await invModel.addInventory(
    inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
  )

  if (addResult.rowCount) {
    req.flash("notice", `The ${inv_make} ${inv_model} was successfully added.`)
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    })
  } else {
    let classificationList = await utilities.buildClassificationList(classification_id)
    req.flash("notice", "Sorry, adding the inventory failed.")
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: null,
      inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color,
    })
  }
}

module.exports = invCont