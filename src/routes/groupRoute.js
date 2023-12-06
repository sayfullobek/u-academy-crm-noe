const router = require('express').Router()
const {groupController} = require('../controller')
const {verifyUsersToken} = require('../config')

router.get("/", groupController.getAll)
router.get("/:id", groupController.getOne)
router.post("/", verifyUsersToken, groupController.create)
router.put("/add-students/:id", verifyUsersToken, groupController.addStudentByGroup)
router.put("/add-one-student/:id", verifyUsersToken, groupController.addOnePupil)
router.get("/get-one-student/:id", groupController.getGroupByStudentId)
router.get("/get-group-by-course-id/:id", groupController.getGroupByCourseId)
router.get("/get-group-by-teacher-id/:id", groupController.getGroupByTeacherId)

module.exports = router;