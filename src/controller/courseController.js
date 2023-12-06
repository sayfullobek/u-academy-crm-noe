const {Course} = require("../models")
const path = require("path")
const fs = require("fs")

exports.getAll = async (req, res) => {
    try {
        if (req.query.no_page) {
            const courses = await Course
                .find({})
            return res.status(200).json({courses})
        }

        const page = parseInt(req.query.page) || 1
        const limit = process.env.PAGE_LIMIT || 10
        const skipIndex = (page - 1) * limit
        const courses = await Course.find()
            .skip(skipIndex)
            .limit(limit)
            .sort({createdAt: -1})

        if (!courses) {
            return res.status(404).json({
                message: "Kurslar topilmadi"
            })
        }

        const total = await Course.countDocuments()

        res.status(200).json({
            courses,
            pagination: {
                total,
                page,
                limit,
                next: `/api/v1/course?page=${page + 1}`
            }
        })
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

exports.getOne = async (req, res) => {
    try {
        const id = req.params.id
        const course = await Course.findById(id)
        if (!course) {
            return res.status(404).json({
                message: "Bunday Kurs mavju emas"
            })
        }
        res.status(200).json({course})
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

exports.create = async (req, res) => {
    try {
        // if (!req.body.files) {
        //     return res.status(404).json({
        //         message: "Rasm topilmadi"
        //     })
        // }
        // const img = req.files.photo

        // if (!img.mimetype.startsWith("image")) {
        //     return res.status(400).json({
        //         message: "Faqat rasm bo'lishi kerak"
        //     })
        // }

        // if (img.size > process.env.MAX_FILE_SIZE) {
        //     return res.status(400).json({
        //         message: "Rasm xajmi juda katta"
        //     })
        // }

        const {
            name, price
        } = req.body

        const existCourse = await Course.findOne({
            name
        })

        if (existCourse) {
            return res.status(400).json({
                message: "Bunday nomli kurs avvaldan mavjud"
            })
        }

        if (price <= 0) {
            return res.status(409).message({message: "Kursning narxi bo'lishi shart"})
        }

        // img.name = `image_${Date.now()}${path.parse(img.name).ext}`
        //
        // img.mv(`public/uploads/course/${img.name}`, async (err) => {
        //     if (err) {
        //         return res.status(500).json({message: err.message})
        //     }
        // })

        const host = req.get('host')
        // const course = Course.create({
        //     name, price, photo: `https://${host}/uploads/course/${img.name}`
        // })
        const course = Course.create({
            name, price
        })

        res.status(200).json({
            message: "Kurs yaratildi",
            course
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

exports.edit = async (req, res) => {
    try {
        const id = req.param.id
        const course = await Course.findById(id)

        if (!course) {
            return res.status(404).json({message: "Bunday kurs topilmadi"})
        }
        if (req.files) {
            const img = req.files.photo
            const oldImagePath = course.photo('/uploads/course/')[1]
            fs.unlinkSync(`public/uploads/course/${oldImagePath}`)
            if (!img.mimetype.startsWith("image")) {
                return res.status({
                    message: "Faqat rasm bo'lishi kerak"
                })
            }
            if (img.size > process.env.MAX_FILE_SIZE) {
                return res.status(400).json({
                    message: "Fayl xajmi juda katta"
                })
            }
            img.name = `image_${Date.now()}${path.parse(img.name).ext}`
            img.mv(`public/uploads/course/${img.name}`, async (err) => {
                if (err) {
                    return res.status(500).json({message: err.message})
                }
            })
            const host = req.get('host')
            await Course.findByIdAndUpdate(id, {
                photo: `${req.protocol}://${host}/uploads/course/${img.name}`
            })
        }
        const {name, price} = req.body
        if (name || price) {
            await Course.findByIdAndUpdate(id, {
                name: name,
                price: price
            })
        }
        res.status(200).json({
            message: "Kurs taxrirlandi",
            course
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
        const course = await Course.findById(id)
        if (!course) {
            return res.status(404).json({
                message: "Bunday kursl topilmadi"
            })
        }
        const oldImagePath = course.photo.split('/upload/course/')
        fs.unlinkSync(`public/uploads/course/${oldImagePath}`)

        await Course.findByIdAndDelete(id)
        res.status(200).json({
            message: "Kurs o'chirildi"
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}