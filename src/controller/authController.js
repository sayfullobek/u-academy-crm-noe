const {Users, Course} = require("../models")
const CryptoJS = require('crypto-js')
const jwt = require("jsonwebtoken")
const validator = require('validator');

exports.login = async (req, res) => {
    try {
        const {
            phoneNumber, password
        } = req.body;
        const users = await Users.findOne({phoneNumber})
        if (!users) {
            return res.status(401).json({
                message: "Telefon raqam yoki parolingizda xatolik"
            })
        }
        const decryptedPass = CryptoJS.AES.decrypt(users.password, process.env.PASSWORD_SECRET_KEY).toString(CryptoJS.enc.Utf8);
        if (decryptedPass !== password) {
            return res.status(401).json({
                message: "Telefon raqam yoki parolingizda xatolik"
            })
        }
        const token = jwt.sign({id: users._id}, process.env.JWT_SECRET_KEY);
        users.password = undefined;
        const role = users.role.toLocaleLowerCase()
        return res.status(200).json({
            message: "Xisobingizga muvaffaqiyatli kirdingiz",
            token,
            url: `/auth/dashboard/${role}/${users._id}`,
            users
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}


exports.getAll = async (req, res) => {
    try {
        const sort = {role: {$ne: 'STUDENT'}}
        if (req.query.no_page) {
            await Users
                .find(sort)
                .populate("courses")
                .exec((err, results) => {
                    if (err) {
                        return res.status(500).json({message: err.message})
                    } else {
                        return res.status(200).json({employees: results})
                    }
                })
        }
        const page = parseInt(req.query.page) || 1
        const limit = process.env.PAGE_LIMIT || 10
        const skipIndex = (page - 1) * limit
        const employees = await Users.find(sort)
            .populate("courses")
            .skip(skipIndex)
            .limit(limit)
            .sort({createAt: -1})
        if (!employees) {
            return res.status(404).json({message: "Hozircha mavjud emas"})
        }
        const total = await Users.countDocuments();
        res.status(200).json({
            employees,
            pagination: {
                total,
                page,
                limit,
                next: `/api/v1/auth?page=${page + 1}`
            }
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

exports.register = async (req, res) => {
    try {
        const {firstName, lastName, middleName, courses, role, phoneNumber, email, password} = req.body;
        if (firstName || lastName || role || phoneNumber || email) {
            const phoneUser = await Users.findOne({phoneNumber: phoneNumber})
            if (phoneUser) {
                return res.status(409).json({
                    message: "Bunday foydalanuvchi avvaldan mavjud"
                })
            }
            if (!validator.isEmail(email)) {
                return res.status(400).json({
                    message: "Emailda xatolik iltimos qayta urinib ko'ring"
                })
            }
            const emailUser = await Users.findOne({email: email})
            if (emailUser) {
                return res.status(409).json({
                    message: "Bunday foydalanuvchi avvaldan mavjud"
                })
            }
            const cArr = []
            if (courses) {
                for (const item of courses) {
                    const c = await Course.findById({_id: item.id})
                    if (c) {
                        cArr.push(c)
                    } else {
                        return res.status(404).json({
                            message: `Kechirasiz qaysidir kursni topolmadim ushbu oynani yangilarn qayta ishlatib ko'ring `
                        })
                    }
                }
            }
            const newUser = new Users({
                firstName: firstName,
                lastName: lastName,
                middleName: middleName ? middleName : "",
                courses: courses ? cArr : null,
                role: role,
                phoneNumber: phoneNumber,
                email: email,
                password: CryptoJS.AES.encrypt(
                    password,
                    process.env.PASSWORD_SECRET_KEY
                ).toString(),
            })
            await newUser.save()
                .then(() => {
                    return res.status(200).json({
                        message: `${role} yaratildi`
                    })
                }).catch((err) => {
                    return res.status(500).json({
                        message: err.message,
                    })
                })
        }
    } catch
        (err) {
        res.status(500).json({
            message: err.message
        })
    }
}