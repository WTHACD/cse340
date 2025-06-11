const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");


const accountController = {};

/* ****************************************
 * Deliver login view
 * *************************************** */
accountController.buildLogin = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
};

/* ****************************************
 * Deliver registration view
 * *************************************** */
accountController.buildRegister = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
};

/* ****************************************
 * Deliver Account Management view
 * (Esta es una nueva función para cuando el login sea exitoso)
 * *************************************** */
accountController.buildAccountManagement = async function (req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/management", { 
      title: "Account Management",
      nav,
      errors: null,
    });
  };


/* ****************************************
 * Process Registration
 * *************************************** */
accountController.registerAccount = async function (req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash("notice", `Congratulations, ${account_firstname}! You're registered. Please log in.`);
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
};

/* ****************************************
 * Process login request
 * ************************************ */
accountController.loginAccount = async function (req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  
  
  const accountData = await accountModel.getAccountByEmail(account_email);

  
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
   
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }

  
  try {
    
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      
      req.flash("success", `Welcome back, ${accountData.account_firstname}!`);
      
      return res.redirect("/account/");
    } else {
     
      req.flash("notice", "Please check your credentials and try again.");
     
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    
    req.flash("notice", "An error occurred during login.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }
};


module.exports = accountController;
