require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test MySQL connection
async function testDatabaseConnection() {
    try {
        const connection = await db.getConnection();
        console.log("MySQL database connected successfully!");
        connection.release();
    } catch (error) {
        console.error("MySQL connection failed:", error.message);
    }
}

testDatabaseConnection();

// Home route
app.get("/", function (req, res) {
    res.send("Student Management System Backend is running!");
});
// GET all teachers
// GET one teacher
app.get("/api/teachers/:id", async function (req, res) {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            "SELECT * FROM teachers WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch teacher"
        });
    }
});
// ADD teacher
app.post("/api/teachers", async function (req, res) {
    try {
        const {
            id,
            name,
            email,
            phone,
            department
        } = req.body;

        const sql = `
            INSERT INTO teachers
            (id, name, email, phone, department)
            VALUES (?, ?, ?, ?, ?)
        `;

        await db.query(sql, [
            id,
            name,
            email,
            phone,
            department
        ]);

        res.status(201).json({
            message: "Teacher added successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to add teacher"
        });
    }
});
// DELETE teacher
app.delete("/api/teachers/:id", async function (req, res) {
    try {
        const { id } = req.params;

        await db.query(
            "DELETE FROM teachers WHERE id = ?",
            [id]
        );

        res.json({
            message: "Teacher deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete teacher"
        });
    }
});
// UPDATE teacher
app.put("/api/teachers/:id", async function (req, res) {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            phone,
            department
        } = req.body;

        const sql = `
            UPDATE teachers
            SET name = ?, email = ?, phone = ?, department = ?
            WHERE id = ?
        `;

        await db.query(sql, [
            name,
            email,
            phone,
            department,
            id
        ]);

        res.json({
            message: "Teacher updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update teacher"
        });
    }
});

// GET all students
app.get("/api/students", async function (req, res) {
    try {
        const [rows] = await db.query("SELECT * FROM students");

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch students"
        });
    }
});

// GET one student
app.get("/api/students/:id", async function (req, res) {
    try {
        const [rows] = await db.query(
            "SELECT * FROM students WHERE id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch student"
        });
    }
});

// ADD student
app.post("/api/students", async function (req, res) {
    try {
        const {
            id,
            name,
            email,
            phone,
            dob,
            gender,
            department,
            course
        } = req.body;

        const sql = `
            INSERT INTO students
            (id, name, email, phone, dob, gender, department, course)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(sql, [
            id,
            name,
            email,
            phone,
            dob || null,
            gender,
            department,
            course
        ]);

        res.status(201).json({
            message: "Student added successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to add student"
        });
    }
});

// UPDATE student
app.put("/api/students/:id", async function (req, res) {
    try {
        const {
            name,
            email,
            phone,
            dob,
            gender,
            department,
            course
        } = req.body;

        const sql = `
            UPDATE students
            SET
                name = ?,
                email = ?,
                phone = ?,
                dob = ?,
                gender = ?,
                department = ?,
                course = ?
            WHERE id = ?
        `;

        const [result] = await db.query(sql, [
            name,
            email,
            phone,
            dob || null,
            gender,
            department,
            course,
            req.params.id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({
            message: "Student updated successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update student"
        });
    }
});

// DELETE student
app.delete("/api/students/:id", async function (req, res) {
    try {
        const [result] = await db.query(
            "DELETE FROM students WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({
            message: "Student deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to delete student"
        });
    }
});

// Start server
app.listen(PORT, function () {
    console.log(`Server is running on http://localhost:${PORT}`);
});