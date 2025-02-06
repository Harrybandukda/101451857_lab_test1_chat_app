import express from 'express';
import GroupMessage from '../models/GroupMessage.js';
import PrivateMessage from '../models/PrivateMessage.js';

const router = express.Router();

router.get('/messages/:room', async (req, res) => {
  try {
    const messages = await GroupMessage.find({ room: req.params.room })
      .sort({ date_sent: -1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/private/:fromUser/:toUser', async (req, res) => {
  try {
    const messages = await PrivateMessage.find({
      $or: [
        { from_user: req.params.fromUser, to_user: req.params.toUser },
        { from_user: req.params.toUser, to_user: req.params.fromUser }
      ]
    }).sort({ date_sent: -1 }).limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;