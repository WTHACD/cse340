const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")
require("dotenv").config()

/* ****************************************
* Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
}

/* ****************************************
* Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
}

/* ****************************************
* Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
      req.flash("notice", 'Sorry, there was an error processing the registration.')
      res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }
}

/* ****************************************
 * Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    return new Error('Access Forbidden')
  }
}

/* ****************************************
* Build Account Management View
* *************************************** */
async function buildAccountManagementView(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
    })
}

/* ****************************************
* Build Account Update View
* *************************************** */
async function buildUpdateView(req, res, next) {
    const account_id = parseInt(req.params.account_id)
    let nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    })
}

/* ****************************************
* Process Account Info Update
* *************************************** */
async function updateAccountInfo(req, res, next) {
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    const errors = validationResult(req)
    let nav = await utilities.getNav()

    if (!errors.isEmpty()) {
        return res.render("account/update", {
            title: "Update Account Information",
            nav,
            errors: errors.array(),
            account_id,
            account_firstname,
            account_lastname,
            account_email,
        })
    }

    const updateResult = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email)

    if (updateResult) {
        // Regenerate JWT with updated info
        const updatedAccountData = await accountModel.getAccountById(account_id)
        const accessToken = jwt.sign(updatedAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
        res.cookie("jwt", accessToken, { httpOnly: true, secure: process.env.NODE_ENV !== 'development', maxAge: 3600 * 1000 });

        req.flash("notice", "Your account information has been successfully updated.")
        res.redirect("/account/")
    } else {
        req.flash("notice", "Sorry, the update failed.")
        res.status(501).render("account/update", {
            title: "Update Account Information",
            nav,
            errors: null,
            account_id,
            account_firstname,
            account_lastname,
            account_email,
        })
    }
}

/* ****************************************
* Process Password Change
* *************************************** */
async function updatePassword(req, res, next) {
    const { account_id, account_password } = req.body
    const errors = validationResult(req)
    let nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(account_id)

    if (!errors.isEmpty()) {
        return res.render("account/update", {
            title: "Update Account Information",
            nav,
            errors: errors.array(),
            account_id: accountData.account_id,
            account_firstname: accountData.account_firstname,
            account_lastname: accountData.account_lastname,
            account_email: accountData.account_email,
        })
    }

    // Hash the new password
    let hashedPassword = await bcrypt.hashSync(account_password, 10)

    const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

    if (updateResult) {
        req.flash("notice", "Your password has been successfully updated.")
        res.redirect("/account/")
    } else {
        req.flash("notice", "Sorry, the password update failed.")
        res.status(501).render("account/update", {
            title: "Update Account Information",
            nav,
            errors: null,
            account_id: accountData.account_id,
            account_firstname: accountData.account_firstname,
            account_lastname: accountData.account_lastname,
            account_email: accountData.account_email,
        })
    }
}


/* ****************************************
* Process Logout
* *************************************** */
async function logout(req, res) {
    res.clearCookie("jwt")
    return res.redirect("/")
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagementView, buildUpdateView, updateAccountInfo, updatePassword, logout }