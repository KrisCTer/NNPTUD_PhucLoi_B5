var express = require('express');
var router = express.Router();
var User = require('../schemas/users');

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - email
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         email:
 *           type: string
 *         fullName:
 *           type: string
 *         avatarUrl:
 *           type: string
 *         status:
 *           type: boolean
 *         role:
 *           type: string
 *           description: Role ID
 *         loginCount:
 *           type: integer
 * 
 * /api/v1/users:
 *   get:
 *     summary: Lấy danh sách tất cả các users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Trả về danh sách users thành công
 *   post:
 *     summary: Tạo một user mới
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Tạo user thành công
 * 
 * /api/v1/users/{id}:
 *   get:
 *     summary: Lấy chi tiết user theo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *   put:
 *     summary: Cập nhật thông tin user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xoá mềm user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xoá thành công
 * 
 * /api/v1/users/enable:
 *   post:
 *     summary: Kích hoạt user (status = true)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thành công
 * 
 * /api/v1/users/disable:
 *   post:
 *     summary: Vô hiệu hoá user (status = false)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thành công
 */

// GET all active users
router.get('/', async function (req, res, next) {
    try {
        let users = await User.find({ isDeleted: false }).populate('role');
        res.status(200).send({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(404).send({
            success: false,
            message: error.message
        });
    }
});

// GET user by ID
router.get('/:id', async function (req, res, next) {
    try {
        let user = await User.findOne({ _id: req.params.id, isDeleted: false }).populate('role');
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).send({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(404).send({
            success: false,
            message: error.message
        });
    }
});

// POST create new user
router.post('/', async function (req, res, next) {
    try {
        let newUser = new User(req.body);
        await newUser.save();
        res.status(201).send({
            success: true,
            data: newUser
        });
    } catch (error) {
        res.status(400).send({
            success: false,
            message: error.message
        });
    }
});

// PUT update user
router.put('/:id', async function (req, res, next) {
    try {
        let user = await User.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).send({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).send({
            success: false,
            message: error.message
        });
    }
});

// DELETE soft delete user
router.delete('/:id', async function (req, res, next) {
    try {
        let user = await User.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).send({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(400).send({
            success: false,
            message: error.message
        });
    }
});

// POST enable user
router.post('/enable', async function (req, res, next) {
    try {
        const { email, username } = req.body;
        if (!email || !username) {
            return res.status(400).send({
                success: false,
                message: "Email and username are required"
            });
        }

        let user = await User.findOneAndUpdate(
            { email: email, username: username, isDeleted: false },
            { status: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found or information does not match"
            });
        }

        res.status(200).send({
            success: true,
            message: "User enabled successfully",
            data: user
        });
    } catch (error) {
        res.status(400).send({
            success: false,
            message: error.message
        });
    }
});

// POST disable user
router.post('/disable', async function (req, res, next) {
    try {
        const { email, username } = req.body;
        if (!email || !username) {
            return res.status(400).send({
                success: false,
                message: "Email and username are required"
            });
        }

        let user = await User.findOneAndUpdate(
            { email: email, username: username, isDeleted: false },
            { status: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found or information does not match"
            });
        }

        res.status(200).send({
            success: true,
            message: "User disabled successfully",
            data: user
        });
    } catch (error) {
        res.status(400).send({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
