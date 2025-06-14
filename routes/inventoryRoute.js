const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require('../utilities/inventory-validation')

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build vehicle detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetailView));

// Route to build management view
router.get(
    "/",
    utilities.checkManagementAccess,
    utilities.handleErrors(invController.buildManagementView)
);

// Route to build add classification view
router.get(
    "/add-classification",
    utilities.checkManagementAccess,
    utilities.handleErrors(invController.buildAddClassificationView)
);

// Route to build add inventory view
router.get(
    "/add-inventory",
    utilities.checkManagementAccess,
    utilities.handleErrors(invController.buildAddInventoryView)
);

// Route to build edit inventory view
router.get(
    "/edit/:inv_id",
    utilities.checkManagementAccess,
    utilities.handleErrors(invController.editInventoryView)
);

// Route to build delete confirmation view
router.get(
    "/delete/:inv_id",
    utilities.checkManagementAccess,
    utilities.handleErrors(invController.deleteInventoryView)
);

// Route to get inventory for AJAX Route
router.get(
    "/getInventory/:classification_id",
    utilities.checkManagementAccess,
    utilities.handleErrors(invController.getInventoryJSON)
)

// Process the new classification data
router.post(
    "/add-classification",
    utilities.checkManagementAccess,
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
);

// Process the new inventory data
router.post(
    "/add-inventory",
    utilities.checkManagementAccess,
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
);

// Process the inventory update
router.post(
    "/update",
    utilities.checkManagementAccess,
    invValidate.inventoryRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
);

// Process the inventory delete
router.post(
    "/delete",
    utilities.checkManagementAccess,
    utilities.handleErrors(invController.deleteInventory)
);


module.exports = router;