
const baseController = require("../controllers/baseController"); //


module.exports = function(app) {
  
  app.get("/", baseController.buildHome); //

 
};