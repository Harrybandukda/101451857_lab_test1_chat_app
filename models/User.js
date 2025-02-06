import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdon: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);