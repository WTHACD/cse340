
const pool = require("../database/")

/* ***************************
 * Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


/* ***************************
 * Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.classification_id = $1`,
        [classification_id]
      )
      return data.rows
    } catch (error) {
      console.error("getclassificationsbyid error " + error)
    }
  }

/* ***************************
 * Get inventory item by inv_id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    console.log("Model: Executing query for inv_id:", inv_id); // LOG ADDED
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    );
    console.log("Model: Query completed. Rows found:", data.rows.length); // LOG ADDED
    return data.rows[0]; // 
  } catch (error) {
    console.error("Model: getVehicleById error: " + error); // LOG MODIFIED
    throw error;
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById};