import mongoose from 'mongoose'

const planSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  place: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
  },
  userId: {
    type: Number,
    required: true,
    min: 1,
    max: 3,
  },
}, {
  timestamps: true,
  versionKey: false,
})

const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema)

export default Plan
