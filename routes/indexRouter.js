import { Router } from "express";
import { pool } from "../db/db.js";

const indexRouter = Router();

let  rows;

// Render  Page by default
indexRouter.get('/', async (req, res) => {
    try {
        ({ rows } = await pool.query("SELECT * FROM messages"));

        // Format timestamps before sending them to EJS
        rows.forEach(row => {
            const date = new Date(row.timestamp);
            row.formattedTimestamp = date.toLocaleString('en-GB', { 
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: '2-digit', minute: '2-digit', hour12: false 
            }).replace(',', '');
        });

        res.render("layout.ejs", {
            title: "Odin-Members-Only",
            body: "components/home.ejs",
            messages: rows
        });

    } catch (error) {
        console.log('Error fetching messages:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export {indexRouter};