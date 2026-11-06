import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 80,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,
  },
  treeVisits: {
    type: [{
      place: { type: String, required: true, maxlength: 100 },
      visitedAt: { type: Date, default: Date.now },
    }],
    default: [],
  },
}, {
  timestamps: true,
  versionKey: false,
})

userSchema.statics.findByEmailWithPassword = function findByEmailWithPassword(email) {
  return this.findOne({ email }).select('+passwordHash')
}

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
