const router = require('express').Router()
const {authController} = require("../controller")
const {verifyUsersToken} = require("../config")

router.post('/login', authController.login)
router.get('/', authController.getAll)
router.post('/register', verifyUsersToken, authController.register)

module.exports = router;