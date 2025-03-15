const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const axios = require('axios');

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP route
router.post('/send-otp', async (req, res) => {
    try {
        const { phoneNumber, role } = req.body;
        
        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP with phone number (with 5 minutes expiry)
        otpStore.set(phoneNumber, {
            otp,
            role: role === 'landlord' ? 'owner' : 'user', // Map roles to match User model
            expiry: Date.now() + 5 * 60 * 1000
        });
        
        // Send OTP via WhatsApp server
        const message = `Your OTP for RoomsOnRent is: ${otp}. This OTP will expire in 5 minutes.`;
        await axios.post('http://localhost:3001/send-message', {
            phone: phoneNumber,
            message
        });
        
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, message: 'Error sending OTP' });
    }
});

// Verify OTP route
router.post('/verify-otp', async (req, res) => {
    try {
        const { phoneNumber, otp, role } = req.body;
        
        // Check if OTP exists and is valid
        const storedData = otpStore.get(phoneNumber);
        if (!storedData || storedData.otp !== otp || Date.now() > storedData.expiry) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
        
        // Clear OTP
        otpStore.delete(phoneNumber);
        
        // Find or create user
        let user = await User.findOne({ email: phoneNumber + '@whatsapp.temp' });
        if (!user) {
            user = await User.create({
                name: 'WhatsApp User',
                email: phoneNumber + '@whatsapp.temp',
                password: await require('bcryptjs').hash(crypto.randomBytes(20).toString('hex'), 10),
                role: storedData.role,
                verified: true,
                avatar: 'https://via.placeholder.com/150'
            });
        }
        
        // Generate JWT token using the existing method
        const token = user.getSignedJwtToken();
        
        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: 'Error verifying OTP' });
    }
});

module.exports = router; 