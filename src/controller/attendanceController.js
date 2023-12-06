const {Group, Attendance, MonthlyAttendance, DateAttendance} = require("../models")
const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Dekabr"];
exports.getAttendanceByGroupId = async (req, res) => {
    try {
        const id = req.params.id
        const group = await Group.findById({_id: id})
            .populate("students")
        if (!group) {
            return res.status(404).json({
                message: "Bunday guruh mavjud emas"
            })
        }
        const arr = []
        const nowDate = new Date()
        for (const item of group.students) {
            const res = await Attendance.findOne({student: item._id})
                .populate("monthlyAttendances")
                .populate("student")
            if (res) {
                arr.push(res)
            }
        }

        const dateRes = []
        for (const item of arr) {
            for (const i of item.monthlyAttendances) {
                if (i.month === months[nowDate.getMonth()]) {
                    dateRes.push(i)
                }
            }
        }

        const resp = []
        for (const item of dateRes) {
            for (const i of item.dateAttendances) {
                if (i.date === nowDate) {
                    resp.push(i)
                }
            }
        }
        res.status(200).json({
            attendances: resp
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}