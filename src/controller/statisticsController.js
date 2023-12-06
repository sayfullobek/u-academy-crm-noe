const {Group, Users, LidTypes, Course} = require('../models')

exports.statistics = async (req, res) => {
    try {
        const group = await Group.find({})
        const employee = await Users.find({role: {$ne: 'STUDENT'}})
        const isReady = await Users.find({role: 'STUDENT', type: 'IS_READY'})
        const wait = await Users.find({role: 'STUDENT', type: 'REGISTER'})
        const notCome = await Users.find({role: 'STUDENT', type: 'NOT_COME'})
        const lids = await LidTypes.find({})
        const course = await Course.find({})
        res.status(200).json({
            statistics: {
                group: group.length,
                employee: employee.length,
                isReady: isReady.length,
                wait: wait.length,
                notCome: notCome.length,
                lids: lids.length,
                course: course.length,
            }
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

exports.lidStatistic = async (req, res) => {
    try {
        const arr = []
        const lids = await LidTypes.find({})
        const students = await Users.find({role: "STUDENT"})
        const profit = students.length
        for (const item of lids) {
            const res = await Users.find({lidTypes: item})
            arr.push({name: item.name, statistics: Number.parseInt((res.length / profit) * 100)})
        }
        res.status(200).json({
            statistics: arr
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}