const router = require('express').Router()
const {verifyUsersToken} = require('../config')
const {lidTypesController} = require('../controller')

router.get('/', lidTypesController.getAll)
router.get('/:id', lidTypesController.getOne)
router.post('/', verifyUsersToken, lidTypesController.create)
router.put('/:id', verifyUsersToken, lidTypesController.edit)
router.delete('/:id', verifyUsersToken, lidTypesController.delete)

module.exports = router