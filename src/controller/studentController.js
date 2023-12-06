const {Users, Course, LidTypes, Group} = require("../models")

exports.search = async (req, res) => {
    try {
        const search = req.query.search
        const sort = {firstName: {$regex: search, $options: 'i'}, role: 'STUDENT'}
        const students = await Users
            .find(sort)
            .populate("courses")
        if (students.length === 0) {
            return res.status(404).json({
                message: "Qidiruv natijasida hech qanday O'quvchi topilmadi"
            })
        }
        res.status(200).json({
            students
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

exports.getAll = async (req, res) => {
    try {
        const about = req.query.about
        const sort = {role: 'STUDENT', type: about}
        if (req.query.no_page) {
            await Users
                .find(sort)
                .populate("courses")
                .exec((err, results) => {
                    if (err) {
                        return res.status(500).json({message: err.message})
                    } else {
                        return res.status(200).json({student: results})
                    }
                })
        }
        const page = parseInt(req.query.page) || 1
        const limit = process.env.PAGE_LIMIT || 10
        const skipIndex = (page - 1) * limit
        const students = await Users.find(sort)
            .populate("courses")
            .skip(skipIndex)
            .limit(limit)
            .sort({createAt: -1})
        if (!students) {
            return res.status(404).json({message: "Hozircha O'quvchilar mavjud emas"})
        }
        const total = await Users.countDocuments();
        res.status(200).json({
            students,
            pagination: {
                total,
                page,
                limit,
                next: `/api/v1/student?page=${page + 1}`
            }
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}


exports.getStudentByCourse = async (req, res) => {
    try {
        const id = req.params.groupId
        const oneGroup = await Group.findById({_id: id}).populate("students")
        if (!oneGroup) {
            return res.status(404).json({
                message: "Bunday guruh mavjud emas!"
            })
        }
        const courseId = req.params.courseId
        const sort = {role: 'STUDENT'}
        await Users
            .find(sort)
            .populate("courses")
            .exec()
            .then(results => {
                const arr = []
                results.forEach(item => {
                    item.courses.map(i => {
                        if (i.id === courseId) {
                            arr.push(item)
                        }
                    })
                })
                // const resArr = []
                // oneGroup.students.forEach(item => {
                //     arr.forEach(i => {
                //         if (i.id !== item.id) {
                //             resArr.push(i)
                //         }
                //     })
                // })
                // // const resArr = arr.filter(item => oneGroup.students.map(i => i.id !== item.id))
                // let uniqueArray = resArr.reduce((accumulator, currentValue) => {
                //     if (!accumulator.includes(currentValue)) {
                //         accumulator.push(currentValue);
                //     }
                //     return accumulator;
                // }, []);
                return res.status(200).json({student: arr})
            })
            .catch(err => {
                return res.status(500).json({message: err.message})
            })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}


exports.changeType = async (req, res) => {
    try {
        const id = req.params.id
        const newStudent = await Users.findById(id)
        const type = req.query.type
        if (!newStudent) {
            return res.status(404).json({
                message: "Bunday o'quvchi mavjud emas"
            })
        }
        const des = req.body.isComeDescription
        if (des.trim().length === 0) {
            return res.status(400).json({
                message: "O'quvchining kelmaganini sababini kiriting"
            })
        }
        if (type || des) {
            const updateStudent = await Users.findByIdAndUpdate(id, {
                type: type,
                isComeDescription: des
            })
        }
        res.status(200).json({
            message: "Muvaffaqiyatli bajarildi"
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

exports.create = async (req, res) => {
    try {
        const {firstName, lastName, middleName, courseId, lidTypesId, phoneNumber, password} = req.body;
        const userOne = await Users.findOne({
            phoneNumber
        })
        if (userOne) {
            return res.status(409).json({message: "Bunday foydalanuvchi avvaldan mavjud!"})
        }

        const course = await Course.findById({_id: courseId})
        if (!course) {
            return res.status(404).json({message: "Bunday Kurs topilmadi!"})
        }
        const lid = await LidTypes.findById({_id: lidTypesId})
        if (!lid) {
            return res.status(404).json({message: "Bunday lid turi mavjud emas"})
        }
        const c = [course]
        const newStudent = new Users({
            firstName,
            lastName,
            middleName: middleName ? middleName : "",
            courses: c,
            role: 'STUDENT',
            type: 'REGISTER',
            phoneNumber,
            lidTypes: lid,
            password: password ? password : phoneNumber
        })
        newStudent.save()
            .then(() => {
                res.status(200).json({
                    message: "O'quvchi saqlandi",
                    newStudent
                })
            }).catch((err) => {
            res.status(500).json({
                message: err.message,
            })
        })
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

exports.getOne = async (req, res) => {
    try {
        const id = req.params.id
        const student = await Users.findById(id).populate("courses")
        if (!student) {
            return res.status(404).json({message: "Bunday O'quvchi mavjud emas!"})
        }
        res.status(200).json({
            student
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

exports.update = async (req, res) => {
    try {
        const id = req.params.id
        const getOne = await Users.findById(id)
        if (!getOne) {
            return res.status(404).json({
                message: "Bunday O'quvchi mavjud emas!"
            })
        }
        const {
            firstName, lastName, middleName, phoneNumber
        } = req.body;
        if (firstName || lastName || phoneNumber) {
            await Users.findByIdAndUpdate(id, {
                firstName, lastName, middleName: middleName ? middleName : "", phoneNumber
            })
        }
        res.status(200).json({
            message: "O'quvchining ma'lumotlari taxrirlandi"
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

exports.delete = async (req, res) => {
    try {
        const id = req.params.id
        const student = await Users.findById(id)
        if (!student) {
            return res.status(404).json({message: "Bunday o'quvchi mavjud emas!"})
        }
        await Users.findByIdAndDelete(id)
        res.status(200).json({
            message: "O'quvchi o'chirildi"
        })
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}