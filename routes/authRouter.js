import { Router } from "express";
import { pool } from "../db/db.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from "../middleware/authenticateToken.js";

const authRouter = Router();

const passKeyChecker = '42069';

// Get Login Page
authRouter.get('/login', async (req, res) => {
    res.render("layout.ejs", {
        title: "Login | Odin-Members-Only",
        body: "components/login.ejs",
    });    
});

// Login in user
authRouter.post('/login', async (req, res) => {
    const data = req.body;
    // console.log(data);
    // { username: 'Rugino3', password: 'wabbywabbo' }
    const {username, password} = data;

    try {
        const {rows:users} = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        
        if (!users || users.length === 0) {
            return res.status(400).json({message: 'User not found'});
        }
        
        let user;
        
        for (user of users) {
        // Compare the password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({message: 'Invalid password'});
        }}

        // Generate JWT
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token:token, username: user.username });        

        // res.redirect("/auth/login"); 
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal Server Error' });  
    }
});

// Get SIgn Up Page
authRouter.get('/signUp', async (req, res) => {
    res.render("layout.ejs", {
        title: "Sign Up | Odin-Members-Only",
        body: "components/signUp.ejs",
    });
});

// Sign up User
authRouter.post('/signUp', async (req, res) => { 
    const data = req.body;
    // console.log(req.body);
    const {firstName, lastName, username, password, password2, passKey} = data;
    try {
        if (password !== password2) {
            res.status(400).json({message: 'The passwords entered do not match. Please make sure they are the same.'});
        }

        // console.log(passKey)
        // console.log(passKeyChecker)

        if (passKey !== passKeyChecker) {
            res.status(400).json({message: 'The secret Number Does not match.'});
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        await pool.query(
            'INSERT INTO users (username, first_name, last_name, password, isMember, isAdmin) VALUES ($1, $2, $3, $4, $5, $6)',
            [username, firstName, lastName, hashedPassword, false, false]
        );
        
        res.status(201).json({message: 'User created successfully'});    
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({message: 'Email is already in use'});
        } else {
            res.status(500).json({message: 'Server error'});
        }          
    }
});

// Verify identity of the user
authRouter.get('/me', authenticateToken, async (req, res) => {
    try {
        const { id } = req.user; // Assuming JWT payload contains `id`
        const {rows:users} = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // console.log(users[0]);
        res.json(users[0]); // Respond with user details
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal Server Error' });        
    }
});

export {authRouter}