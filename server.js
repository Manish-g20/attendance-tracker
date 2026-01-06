const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

/* TIMETABLE OBJECT */
const timetable = {
  Monday: {
    "10-11": "Cryptography Laboratory",
    "11-12": "Cryptography Laboratory",
    "12-1": "Engineering Mathematics - 4",
    "2-3": "Cryptography",
    "3-4": "Computer Networks",
    "4-5": "Operating System"
  },

  Tuesday: {
    "10-11": "Web Application Development",
    "11-12": "Web Application Development",
    "12-1": "Operating System",
    "2-3": "Computer Networks Laboratory",
    "3-4": "Computer Networks Laboratory",
    "4-5": "Engineering Economics & Management"
  },

  Wednesday: {
    "10-11": "Engineering Mathematics - 4",
    "11-12": "Cryptography",
    "12-1": "Operating System",
    "2-3": "Web Application Development Laboratory",
    "3-4": "Web Application Development Laboratory",
    "4-5": "Engineering Economics & Management"
  },

  Thursday: {
    "10-11": "Engineering Mathematics - 4",
    "11-12": "Computer Networks",
    "12-1": "Cryptography",
    "2-3": "Web Application Development",
    "3-4": "Operating System Laboratory",
    "4-5": "Operating System Laboratory"
  },

  Friday: {
    "10-11": "Engineering Mathematics - 4",
    "11-12": "Engineering Economics & Management",
    "12-1": "Computer Networks",
    "2-3": null,          // Library / Free period
    "3-4": null,          // Library
    "4-5": null
  }
};


// Create table
db.run(`
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    day TEXT,
    period TEXT,
    subject TEXT,
    status TEXT
)
`);

// Mark attendance
app.post("/attendance", (req, res) => {
    const { date, day, period, status } = req.body;

    const subject = timetable[day]?.[period];

    // ❌ No lecture scheduled
    if (!subject) {
        return res.status(400).json({
            error: "No academic lecture scheduled in this period"
        });
    }

    if (!date || !day || !period || !status) {
        return res.status(400).json({ error: "Missing fields" });
    }

    db.run(
        `INSERT INTO attendance (date, day, period, subject, status)
         VALUES (?, ?, ?, ?, ?)`,
        [date, day, period, subject, status],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});




    

// Get records
app.get("/attendance", (req, res) => {
    db.all("SELECT * FROM attendance", [], (err, rows) => {
        res.send(rows);
    });
});

// Percentage
app.get("/attendance/percentage", (req, res) => {
    db.get(`
        SELECT COUNT(*) total,
        SUM(CASE WHEN status='P' THEN 1 ELSE 0 END) present
        FROM attendance
    `, [], (err, row) => {
        const percent = row.total ? ((row.present / row.total) * 100).toFixed(2) : 0;
        res.send({ percent });
    });
});

app.listen(3000, () => console.log("Server running on 3000"));
app.get("/stats", (req, res) => {
    db.all(`
        SELECT 
            subject,
            COUNT(*) AS total,
            SUM(CASE WHEN status='P' THEN 1 ELSE 0 END) AS present
        FROM attendance
        GROUP BY subject
    `, [], (err, rows) => {
        res.send(rows);
    });
});
app.delete("/attendance", (req, res) => {
    const { date, day, period } = req.body;

    db.run(
        `DELETE FROM attendance 
         WHERE date = ? AND day = ? AND period = ?`,
        [date, day, period],
        function (err) {
            if (err) {
                return res.status(500).send("Error deleting attendance");
            }
            res.send({ deleted: this.changes });
        }
    );
});
