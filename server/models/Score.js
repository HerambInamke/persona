import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: Number,
    required: true,
    min: 1,
    max: 99
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Normal', 'Pro', 'Chaos']
  },
  bestSingleReaction: {
    type: Number,
    required: true,
    min: 80
  },
  bestTournamentAverage: {
    type: Number,
    default: null
  },
  falseStarts: {
    type: Number,
    default: 0
  },
  totalAttempts: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

scoreSchema.index({ difficulty: 1, bestTournamentAverage: 1, bestSingleReaction: 1 });

export default mongoose.model('Score', scoreSchema);
