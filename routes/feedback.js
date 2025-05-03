const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const Feedback = require('../models/Feedback');

router.get('/', ensureAuthenticated, async (req, res) => {
    const isMobile = req.useragent.isMobile;
    try {
        res.render('feedback', { user: req.user, isMobile });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/', ensureAuthenticated, async (req, res) => {
    try {
        const { feedbackType, feedback } = req.body;
        const userId = req.user.id;
        const newFeedback = new Feedback({
            userId,
            feedbackType,
            feedback
        });
        await newFeedback.save();
        return res.status(200).json({ message: 'Feedback submitted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;