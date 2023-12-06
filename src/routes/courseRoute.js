const router = require('express').Router();
const {courseController} = require("../controller")
const {verifyUsersToken} = require("../config")

router.get('/', courseController.getAll)
router.get('/:id', courseController.getOne)
router.post('/', verifyUsersToken, courseController.create)
router.put('/:id', verifyUsersToken, courseController.edit)
router.delete('/:id', verifyUsersToken, courseController.delete)

module.exports = router;