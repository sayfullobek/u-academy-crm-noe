const {Group, Users, Course, DateAttendance, MonthlyAttendance, Attendance} = require('../models')

exports.getAll = async (req, res) => {
    try {
        if (req.query.no_page) {
            const all = await Group
                .find({})
                .populate("course")
                .populate("teacher")
                .populate("students")
            return res.status(200).json({
                groups: all
            })
        }
        const page = parseInt(req.query.page) || 1
        const limit = process.env.PAGE_LIMIT || 10
        const skipIndex = (page - 1) * limit
        const groups = await Group.find()
            .skip(skipIndex)
            .limit(limit)
            .sort({createdAt: -1})
            .populate("course")
            .populate("teacher")
            .populate("students")

        if (!groups) {
            return res.status(404).json({
                message: "Hozircha guiruhlar mavjud emas..."
            })
        }
        const total = await Group.countDocuments()

        res.status(200).json({
            groups,
            pagination: {
                total,
                page,
                limit,
                next: `/api/v1/groups?page=${page + 1}`
            }
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

exports.getOne = async (req, res) => {
    try {
        const id = req.params.id
        const group = await Group.findById(id)
            .populate("course")
            .populate("teacher")
            .populate("students")
        if (!group) {
            return res.status(404).json({
                message: "Bunday guruh mavjud emas"
            })
        }
        res.status(200).json({
            group
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

exports.create = async (req, res) => {
    try {
        const group = await Group.findOne({name: req.body.name})
        if (group) {
            return res.status(409).json({
                message: "Bunday nomli guruh avvaldan mavjud"
            })
        }
        const {name, courseId, teacherId, startDate, endDate, weekDays, startHours, endHours}
            = req.body
        if (name.trim().length === 0) {
            return res.status(400).json({
                message: "Guruh nomi bo'lishi shart"
            })
        }
        const course = await Course.findById({_id: courseId})
        if (!course) {
            return res.status(404).json({
                message: "Bunday kurs mavjud emas"
            })
        }
        const teacher = await Users.findById({_id: teacherId})
        if (!teacher) {
            return res.status(404).json({
                message: "Bunday o'qituvchi mavjud emas"
            })
        }
        let newGroup;
        if (name || course || teacher || startDate || endDate || weekDays || startHours || endHours) {
            newGroup = await Group.create({
                name,
                course,
                teacher,
                startDate,
                endDate,
                weekDays,
                startHours,
                endHours
            })
        }
        res.status(200).json({
            message: "Muvaffaqiyatli saqlandi",
            newGroup
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

const allDateSave = async (saves, kun, weekDays) => {
    const days = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"]
    if (weekDays === "Toq") {
        if ((kun.getDay() + 1) === 1) {
            const sana = await DateAttendance.create({
                date: kun, day: days[kun.getDay() + 1]
            })
            saves.push(sana)
        }
    } else if (weekDays === "Juft") {
        if ((kun.getDay() + 1) === 0) {
            const sana = await DateAttendance.create({
                date: kun, day: days[kun.getDay() + 1]
            })
            saves.push(sana)
        }
    }
}

function oyningKundanIboratliginiTop(oy, yil) {
    const oyningBoshlanishi = new Date(yil, oy, 1);
    const birinchiKun = oyningBoshlanishi.getDate();
    const oxirgiKun = new Date(yil, oy + 1, 0).getDate();
    return oxirgiKun - birinchiKun + 1;
}

exports.addStudentByGroup = async (req, res) => {
    try {
        const id = req.params.id
        const oneGroup = await Group.findById(id)
        if (!oneGroup) {
            return res.status(404).json({
                message: "Bunday Guruh mavjud emas!"
            })
        }
        const studentIds = req.body.students
        const arr = []
        for (const item of studentIds) {
            const one = await Users.findById({_id: item.value})
            if (one) {
                const up = await Users.findByIdAndUpdate({_id: item.value, type: 'IS_READY'})
                arr.push(up);
            } else {
                return res.status(404).json({
                    message: "Bunday o'quvchi mavjud emas!"
                })
            }
        }
        for (const item of oneGroup.students) {
            arr.push(item)
        }
        await Group.findByIdAndUpdate(id, {
            students: arr
        })
        //start
        const startGroupYear = oneGroup.startDate.getFullYear()
        const startGroupDate = oneGroup.startDate.getDate() + 1
        const startGroupMonth = oneGroup.startDate.getMonth() + 1
        const startGroupDay = oneGroup.startDate.getDay() + 1

        //end
        const endGroupYear = oneGroup.endDate.getFullYear() + 1
        const endGroupDate = oneGroup.endDate.getDate() + 1
        const endGroupMonth = oneGroup.endDate.getMonth() + 1
        const endGroupDay = oneGroup.endDate.getDay() + 1
        //other count
        const oylar = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Dekabr"]
        for (const item of studentIds) {
            const saveDates = []
            const saveMonths = []
            const yearCount = endGroupYear - startGroupYear;
            for (let i = 0; i < yearCount === 0 ? 1 : yearCount; i++) {
                for (let j = startGroupMonth; j <= endGroupMonth; j++) {
                    if (j === startGroupMonth) {
                        for (let k = startGroupDate; k <= oyningKundanIboratliginiTop(startGroupMonth, startGroupYear); k++) {
                            const kun = new Date(startGroupYear, startGroupMonth, k, oneGroup.startHours, 1, 1, 1)
                            await allDateSave(saveDates, kun, oneGroup.weekDays)
                        }
                    } else {
                        for (let k = 1; k <= oyningKundanIboratliginiTop(j, startGroupYear); k++) {
                            const kun = new Date(startGroupYear, j, k, oneGroup.startHours, 1, 1, 1)
                            await allDateSave(saveDates, kun, oneGroup.weekDays)
                        }
                    }
                    const oy = await MonthlyAttendance.create({
                        month: oylar[j - 1], dateAttendances: saveDates
                    })
                    saveMonths.push(oy)
                }
            }
            const up = await Users.findById({_id: item.value})
            await Attendance.create({
                group: oneGroup,
                student: up,
                monthlyAttendances: saveMonths
            })
        }

        res.status(200).json({
            message: "O'quvchilar qo'shildi"
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

exports.getGroupByStudentId = async (req, res) => {
    try {
        const id = req.params.id
        const student = await Users.findById(id).populate("courses")
        if (!student) {
            return res.status(404).json({
                message: "Bunday o'quvchi topilmadi"
            })
        }
        const resGroup = []
        for (const item of student.courses) {
            const gr = await Group.find({course: item})
            gr.map(item => {
                if (item !== null) {
                    resGroup.push(item)
                }
            })
        }
        if (resGroup.length === 0) {
            return res.status(404).json({
                message: "Ushbu oq'uvchining tanlagan yo'nalishi bo'yicha xozircha kurslar mavjud emas"
            })
        }
        res.status(200).json({
            groups: resGroup
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

exports.addOnePupil = async (req, res) => {
    try {
        const id = req.params.id;
        const groupId = req.body.groupId;
        const oneGroup = await Group.findById({_id: groupId})
        const oneStudent = await Users.findById(id)
        if (!oneStudent) {
            return res.status(404).json({
                message: "Bunday o'quvchi mavjud emas"
            })
        }
        if (!oneGroup) {
            return res.status(404).json({
                message: "Bunday guruh mavjud emas"
            })
        }
        const arr = []
        oneGroup.students.map(item => {
            arr.push(item)
        })
        arr.push(oneStudent)

        const startGroupYear = oneGroup.startDate.getFullYear()
        const startGroupDate = oneGroup.startDate.getDate() + 1
        const startGroupMonth = oneGroup.startDate.getMonth() + 1
        const startGroupDay = oneGroup.startDate.getDay() + 1
        const startHours = Number.parseInt(oneGroup.startHours.split(":")[0])

        //end
        const endGroupYear = oneGroup.endDate.getFullYear()
        const endGroupDate = oneGroup.endDate.getDate() + 1
        const endGroupMonth = oneGroup.endDate.getMonth() + 1
        const endGroupDay = oneGroup.endDate.getDay() + 1

        //other count
        const oylar = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Dekabr"]
        const saveDates = []
        const saveMonths = []
        const yearCount = endGroupYear - startGroupYear;
        let allMonthCount = 0;
        if (yearCount === 0) {
            allMonthCount = yearCount * startGroupMonth + endGroupMonth;
        } else {
            allMonthCount = ((12 - startGroupMonth) + 12) + endGroupMonth;
        }
        let whatMonth = 0;
        for (let j = startGroupMonth; j <= allMonthCount; j++) {
            whatMonth = j;
            if (j === startGroupMonth) {
                for (let k = startGroupDate; k <= oyningKundanIboratliginiTop(startGroupMonth, startGroupYear); k++) {
                    const kun = new Date(startGroupYear, startGroupMonth - 1, k, startHours, 1, 1, 1)
                    await allDateSave(saveDates, kun, oneGroup.weekDays)
                }
            } else {
                if (j > 12) {
                    whatMonth = j - 12;
                }
                for (let k = 1; k <= oyningKundanIboratliginiTop(whatMonth, startGroupYear); k++) {
                    const kun = new Date(j > 12 ? (startGroupYear + 1) : startGroupYear, whatMonth - 1, k, startHours, 1, 1, 1)
                    await allDateSave(saveDates, kun, oneGroup.weekDays)
                }
            }
            const oy = await MonthlyAttendance.create({
                month: oylar[whatMonth - 1], dateAttendances: saveDates
            })
            saveMonths.push(oy)
        }
        const up = await Users.findById(id)
        await Attendance.create({
            group: oneGroup,
            student: up,
            monthlyAttendances: saveMonths
        })

        await Group.findByIdAndUpdate({_id: groupId}, {students: arr})
        await Users.findByIdAndUpdate(id, {type: 'IS_READY'})

        res.status(200).json({
            message: "Muvaffaqiyatli qo'shildi"
        })
    } catch
        (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

exports.getGroupByCourseId = async (req, res) => {
    try {
        const id = req.params.id
        const oneCourse = await Course.findById({_id: id})
        if (!oneCourse) {
            return res.status(404).json({
                message: "Bu kursga tegishli guruhlar mavjud emas"
            })
        }
        const allGroup = await Group.find({course: oneCourse}).populate("course").populate("teacher")
        res.status(200).json({
            groups: allGroup,
            course: oneCourse
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}


exports.getGroupByTeacherId = async (req, res) => {
    try {
        const id = req.params.id
        const oneTeacher = await Users.findById({_id: id})
        if (!oneTeacher) {
            return res.status(404).json({
                message: "Bu o'qituvchiga tegishli guruhlar mavjud emas"
            })
        }
        const allGroup = await Group.find({teacher: oneTeacher}).populate("course").populate("teacher")
        res.status(200).json({
            groups: allGroup,
            teacher: oneTeacher
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}