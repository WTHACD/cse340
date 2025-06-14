// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

// Route to build the login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to build the account management view
router.get(
    "/",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccountManagementView)
)

// Route to build the account update view
router.get(
    "/update/:account_id",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildUpdateView)
)

// Route to handle logout
router.get("/logout", utilities.handleErrors(accountController.logout))

// Process the registration data
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Process the account info update
router.post(
    "/update-info",
    utilities.checkLogin, 
    regValidate.updateAccountRules(),
    utilities.handleErrors(accountController.updateAccountInfo)
)

// Process the password change
router.post(
    "/update-password",
    utilities.checkLogin, 
    regValidate.changePasswordRules(),
    utilities.handleErrors(accountController.updatePassword)
)

module.exports = router;