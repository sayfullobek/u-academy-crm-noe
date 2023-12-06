const {LidTypes} = require('../models')

exports.getAll = async (req, res) => {
    try {
        if (req.query.no_page) {
            const all = await LidTypes.find({})
            return res.status(200).json({lidTypes: all})
        }
        const page = parseInt(req.query.page) || 1
        const limit = process.env.PAGE_LIMIT || 10
        const skipIndex = (page - 1) * limit
        const lidTypes = await LidTypes.find()
            .skip(skipIndex)
            .limit(limit)
            .sort({createdAt: -1})

        if (!lidTypes) {
            return res.status(404).json({
                message: "Lid turlari topilmadi"
            })
        }

        const total = await LidTypes.countDocuments()

        res.status(200).json({
            lidTypes,
            pagination: {
                total,
                page,
                limit,
                next: `/api/v1/lid-types?page=${page + 1}`
            }
        })
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

exports.getOne = async (req, res) => {
    try {
        const lidTypes = await LidTypes.findById(req.params.id)
        if (!lidTypes) {
            return res.status(404).json({
                message: "Bunday lid turi mavjud emas"
            })
        }
        res.status(200).json({lidTypes})
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

exports.create = async (req, res) => {
    try {
        const {name, logo} = req.body;
        await validate(name, logo, res)
        const newLid = await LidTypes.create(
            {name, logo}
        )
        res.status(200).json({message: "Muvaffaqiyatli saqlandi", newLid})
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

exports.edit = async (req, res) => {
    try {
        const id = req.params.id
        const {name, logo} = req.body;
        const oneLid = await LidTypes.findById(id);
        if (!oneLid) {
            return res.status(404).json({
                message: "Bunday Lid turi mavjud emas"
            })
        }
        await validate(name, logo, res)
        if (name || logo) {
            await LidTypes.findByIdAndUpdate(id, {name: name, logo: logo})
        }
        res.status(200).json({message: "Muvaffaqiyatli taxrirlandi"})
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

exports.delete = async (req, res) => {
    try {
        const id = req.params.id
        const oneLid = await LidTypes.findById(id)
        if (!oneLid) {
            return res.status(404).json({message: "Bunday Lid turi mavjud emas"})
        }
        await LidTypes.findByIdAndDelete(id)
        res.status(200).json({
            message: "Lid turi o'chirildi"
        })
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

const validate = async (name, logo, res) => {
    if (name.trim().length === 0) {
        return res.status(409).json({message: "Lid turi nomi bo'lishi shart"})
    }
    if (logo.trim().length === 0) {
        return res.status(409).json({message: "Lid turining logosi bo'lishi shart"})
    }
    const lid = await LidTypes.findOne({name})
    if (lid) {
        return res.status(400).json({message: "Bunday Lid turi avvaldan mavjud"})
    }
}