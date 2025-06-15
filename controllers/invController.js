const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

// ... (todas las funciones existentes hasta updateInventory se mantienen igual) ...

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
      let nav = await utilities.getNav();
      res.render('./inventory/vehicle-detail', {
          title: vehicleData.inv_make + ' ' + vehicleData.inv_model,
          nav,
          errors: null,
          vehicleData
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
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    classificationSelect,
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
  let classificationSelect = await utilities.buildClassificationList()
  if (addResult.rowCount) {
    req.flash("notice", `The ${classification_name} classification was successfully added.`)
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classificationSelect,
    })
  } else {
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
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

  const addResult = await invModel.addInventory(
    inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
  )

  if (addResult) {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList()
    req.flash("notice", `The ${inv_make} ${inv_model} was successfully added.`)
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect,
      errors: null,
    })
  } else {
    let nav = await utilities.getNav()
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

/* ***************************
 * Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 * Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 * Build delete confirmation view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ***************************
 * Process Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("notice", `The vehicle was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}

/* ***************************
 * Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0] && invData[0].inv_id) {
    return res.json(invData)
  } else {
    return res.json([])
  }
}

/* ***************************
 * Build compare selection view
 * ************************** */
invCont.buildCompareSelectionView = async function (req, res, next) {
  let nav = await utilities.getNav()
  // We'll get all inventory items to display them
  const allInventory = await invModel.getInventoryByClassificationId(null); // Passing null or modifying the function to get all items
  const grid = await utilities.buildComparisonGrid(allInventory)
  res.render("./inventory/compare", {
      title: "Compare Vehicles",
      nav,
      errors: null,
      grid,
  })
}

/* ***************************
 * Manage comparison list in session
 * ************************** */
invCont.manageCompare = async function (req, res, next) {
  const action = req.params.action;
  const inv_id = parseInt(req.params.inv_id);

  // Initialize compare list in session if it doesn't exist
  if (!req.session.compareList) {
      req.session.compareList = [];
  }

  if (action === 'add') {
      // Prevent adding the same car twice
      if (!req.session.compareList.includes(inv_id)) {
          if (req.session.compareList.length < 2) {
              req.session.compareList.push(inv_id);
          } else {
              // If list is full, replace the second item
              req.session.compareList[1] = inv_id;
          }
      }
  }

  if (action === 'remove') {
      req.session.compareList = req.session.compareList.filter(id => id !== inv_id);
  }

  if (req.session.compareList.length === 2) {
      // If two cars are selected, go to comparison view
      return res.redirect('/inv/compare-view');
  } else {
      // Otherwise, redirect back to where the user was, with a message
      req.flash("notice", "Vehicle added to comparison. Select one more.");
      res.redirect(req.get('Referer') || '/'); // Go back to the previous page
  }
};

/* ***************************
* Build the comparison view
* ************************** */
invCont.buildCompareView = async function (req, res, next) {
  let nav = await utilities.getNav();
  const compareIds = req.session.compareList || [];

  if (compareIds.length < 2) {
      req.flash("notice", "Please select at least two vehicles to compare.");
      return res.redirect('/'); 
  }

  const [vehicle1, vehicle2] = await invModel.getVehiclesByIds(compareIds);

  res.render("./inventory/comparison", {
      title: "Vehicle Comparison",
      nav,
      errors: null,
      vehicle1,
      vehicle2,
  });

  
   req.session.compareList = [];
};
module.exports = invCont