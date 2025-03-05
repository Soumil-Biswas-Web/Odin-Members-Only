import { request, Router } from "express";
import { pool } from "../db/db.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const addRouter = Router();

// Render  Page by default
addRouter.get('/', async (req, res) => {
    res.render("layout.ejs", {
        title: "Odin-Members-Only",
        body: "components/newMessage.ejs",
    });
});

// Post New Message to Database
addRouter.post('/newMessage', authenticateToken, async(req, res) => {
    const data = req.body;
    // console.log(data);
    const {message} = data;
    const timestamp = new Date().toISOString(); // Get current timestamp in ISO format
    // { message: 'mom, get the camera' }
    try {
        const { id } = req.user; // Assuming JWT payload contains `id`

        const {rows:users} = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

        const user = users[0].username 

        // console.log(user);

        // Insert message into database
        await pool.query(
            'INSERT INTO messages (username, message, timestamp) VALUES ($1, $2, $3)',
            [user, message, timestamp]
        );

        res.status(201).json({message: ('Message posted successfully by', user)}); 
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ message: 'Internal Server Error' });         
    }
});

export {addRouter};