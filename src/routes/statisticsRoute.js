const router = require('express').Router()
const {verifyUsersToken} = require('../config')
const {statisticsController} = require('../controller')

router.get('/', statisticsController.statistics)
router.get('/lid', statisticsController.lidStatistic)

module.exports = router