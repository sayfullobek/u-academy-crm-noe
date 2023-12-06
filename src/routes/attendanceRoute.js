const router = require('express').Router()
const {attendanceController} = require("../controller")
const {verifyUsersToken} = require('../config')

router.get("/:id", attendanceController.getAttendanceByGroupId)

module.exports = router