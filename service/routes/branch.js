const express = require('express')
const router = express.Router()
const controller = require('../controllers/branch.controller')
// const {funciones especificas} = require('../controllers/branch.controller')

router.get('/branch', controller.getBranches)
router.get('/branch', controller.addBranch)
router.get('/branch', controller.updateBranch)
router.get('/branch', controller.deleteBranch)

module.exports = router