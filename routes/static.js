const express = require('express')
const router = express.Router()

// Static Routes
router.use(express.static("public"))

module.exports = router