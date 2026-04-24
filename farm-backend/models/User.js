// farm-backend/models/User.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: true,
      trim:     true
    },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true
    },
    password: {
      type:      String,
      required:  true,
      minlength: 6
    },
    phone: {
      type:    String,
      default: ''
    },
    address: {
      type:    String,
      default: ''
    },
    role: {
      type:    String,
      enum:    ['admin', 'guest', 'customer'],
      default: 'customer'
    }
  },
  { timestamps: true }
);

// ---- Hash password using promise style (no next) ----
userSchema.pre('save', function() {
  const user = this;

  if (!user.isModified('password')) {
    return Promise.resolve();
  }

  return bcrypt.genSalt(10)
    .then(function(salt) {
      return bcrypt.hash(user.password, salt);
    })
    .then(function(hash) {
      user.password = hash;
    });
});

// ---- Check password ----
userSchema.methods.matchPassword = function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);