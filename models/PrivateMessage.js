import mongoose from 'mongoose';

const privateMessageSchema = new mongoose.Schema({
  from_user: {
    type: String,
    required: true
  },
  to_user: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  date_sent: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('PrivateMessage', privateMessageSchema);