const router = require('express').Router();
const {studentController} = require("../controller")
const {verifyUsersToken} = require("../config")

router.get('/', studentController.getAll)
router.get('/search', studentController.search)
router.get('/:id', studentController.getOne)
router.get('/group-by/:groupId/:courseId', studentController.getStudentByCourse)
router.put("/change-type/:id", verifyUsersToken, studentController.changeType)
router.post('/', verifyUsersToken, studentController.create)
router.put('/:id', verifyUsersToken, studentController.update)
router.delete('/:id', verifyUsersToken, studentController.delete)

module.exports = router;