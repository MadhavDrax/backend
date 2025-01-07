const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age cannot be negative']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0, 'Weight cannot be negative']
  },
  height: {
    type: Number,
    required: [true, 'Height is required'],
    min: [0, 'Height cannot be negative']
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});
const User = mongoose.model('User', userSchema);
module.exports = User;