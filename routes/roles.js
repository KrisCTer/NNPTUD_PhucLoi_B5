var express = require('express');
var router = express.Router();
var Role = require('../schemas/roles');
var User = require('../schemas/users');

/**
 * @openapi
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Tên của Role
 *         description:
 *           type: string
 *           description: Mô tả về Role
 *         isDeleted:
 *           type: boolean
 *           default: false
 * 
 * /api/v1/roles:
 *   get:
 *     summary: Lấy danh sách tất cả các roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Trả về danh sách roles thành công
 *   post:
 *     summary: Tạo một role mới
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       201:
 *         description: Tạo role thành công
 * 
 * /api/v1/roles/{id}:
 *   get:
 *     summary: Lấy chi tiết role theo ID
 *     tags: [Roles]
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
 *     summary: Cập nhật thông tin role
 *     tags: [Roles]
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
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xoá mềm role
 *     tags: [Roles]
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
 * /api/v1/roles/{id}/users:
 *   get:
 *     summary: Lấy danh sách users thuộc về một role cụ thể
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */

// GET all active roles
router.get('/', async function(req, res, next) {
    try {
        let roles = await Role.find({ isDeleted: false });
        res.status(200).send({
            success: true,
            data: roles
        });
    } catch (error) {
        res.status(404).send({
            success: false,
            message: error.message
        });
    }
});

// GET role by ID
router.get('/:id', async function(req, res, next) {
    try {
        let role = await Role.findOne({ _id: req.params.id, isDeleted: false });
        if (!role) {
            return res.status(404).send({
                success: false,
                message: "Role not found"
            });
        }
        res.status(200).send({
            success: true,
            data: role
        });
    } catch (error) {
        res.status(404).send({
            success: false,
            message: error.message
        });
    }
});

// POST create new role
router.post('/', async function(req, res, next) {
    try {
        let newRole = new Role(req.body);
        await newRole.save();
        res.status(201).send({
            success: true,
            data: newRole
        });
    } catch (error) {
        res.status(400).send({
            success: false,
            message: error.message
        });
    }
});

// PUT update role
router.put('/:id', async function(req, res, next) {
    try {
        let role = await Role.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true, runValidators: true }
        );
        if (!role) {
            return res.status(404).send({
                success: false,
                message: "Role not found"
            });
        }
        res.status(200).send({
            success: true,
            data: role
        });
    } catch (error) {
        res.status(400).send({
            success: false,
            message: error.message
        });
    }
});

// DELETE soft delete role
router.delete('/:id', async function(req, res, next) {
    try {
        let role = await Role.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!role) {
            return res.status(404).send({
                success: false,
                message: "Role not found"
            });
        }
        res.status(200).send({
            success: true,
            message: "Role deleted successfully"
        });
    } catch (error) {
        res.status(400).send({
            success: false,
            message: error.message
        });
    }
});

// GET all users by role ID
router.get('/:id/users', async function(req, res, next) {
    try {
        let users = await User.find({ role: req.params.id, isDeleted: false }).populate('role');
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

module.exports = router;
