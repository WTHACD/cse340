const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************* */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
      grid += '<li>'
      grid +=  '<a href="/inv/detail/'+ vehicle.inv_id
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model
      + 'details"><img src="' + vehicle.inv_thumbnail
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="/inv/detail/' + vehicle.inv_id +'" title="View '
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$'
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'      
      grid += `<a href="/inv/compare/add/${vehicle.inv_id}" class="compare-link">Compare</a>`
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the classification select list
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
 * Build the vehicle detail view HTML
 **************************************** */
Util.buildVehicleDetailHtml = function(vehicleData) {
  let detailHtml = '<div class="vehicle-detail-container">';
  detailHtml += `<img src="${vehicleData.inv_image}" alt="Image of ${vehicleData.inv_make} ${vehicleData.inv_model}">`;
  detailHtml += '<div class="vehicle-detail-info">';
  detailHtml += `<h2>${vehicleData.inv_make} ${vehicleData.inv_model} Details</h2>`;
  detailHtml += `<p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicleData.inv_price)}</p>`;
  detailHtml += `<p><strong>Description:</strong> ${vehicleData.inv_description}</p>`;
  detailHtml += `<p><strong>Color:</strong> ${vehicleData.inv_color}</p>`;
  detailHtml += `<p><strong>Miles:</strong> ${new Intl.NumberFormat('en-US').format(vehicleData.inv_miles)}</p>`;
  detailHtml += '</div></div>';
  return detailHtml;
};

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("notice", "Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 * Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

/* ****************************************
 * Check for Employee or Admin Authorization
 * ************************************ */
Util.checkManagementAccess = (req, res, next) => {
    if (res.locals.loggedin) {
        const account_type = res.locals.accountData.account_type
        if (account_type === 'Employee' || account_type === 'Admin') {
            next()
        } else {
            req.flash("notice", "You are not authorized to access this page.")
            return res.redirect("/account/login")
        }
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
}


/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* **************************************
* Build the comparison selection view HTML
* ************************************ */
Util.buildComparisonGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="compare-display">'
    data.forEach(vehicle => {
      grid += '<li>'
      grid += `<input type="checkbox" name="inv_id" value="${vehicle.inv_id}">`
      grid +=  '<a href="/inv/detail/'+ vehicle.inv_id
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model
      + 'details"><img src="' + vehicle.inv_thumbnail
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += `${vehicle.inv_make} ${vehicle.inv_model}`
      grid += '</h2>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

module.exports = Util