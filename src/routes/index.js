const express = require('express');
const router = express.Router();

router.use('/course', require("./courseRoute"))
router.use('/auth', require("./authRoute"))
router.use('/student', require("./studentRoute"))
router.use('/group', require('./groupRoute'))
router.use('/lid-types', require('./LidTypesRoute'))
router.use('/statistics', require('./statisticsRoute'))
router.use('/attendance', require('./attendanceRoute'))

module.exports = router;
