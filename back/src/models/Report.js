const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    box: {
      x1: Number,
      y1: Number,
      x2: Number,
      y2: Number
    }
  },
  { _id: false }
);

const licensePlateSchema = new mongoose.Schema(
  {
    plateTextOriginal: {
      type: String,
      trim: true,
      default: ''
    },
    plateTextNormalized: {
      type: String,
      trim: true,
      default: ''
    },
    yoloConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    ocrConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    box: {
      x1: Number,
      y1: Number,
      x2: Number,
      y2: Number
    }
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    imagePath: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    processedImageUrl: {
      type: String,
      default: null
    },
    locationName: {
      type: String,
      trim: true,
      default: ''
    },
    latitude: {
      type: Number,
      min: -90,
      max: 90,
      default: null
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
      default: null
    },
    vehicleType: {
      type: String,
      default: 'unknown'
    },
    smokeDetected: {
      type: Boolean,
      default: false
    },
    smokeLevel: {
      type: String,
      enum: ['none', 'low', 'medium', 'heavy'],
      default: 'none'
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    detections: {
      type: [detectionSchema],
      default: []
    },
    licensePlateDetection: {
      status: {
        type: String,
        trim: true,
        default: ''
      },
      totalPlates: {
        type: Number,
        min: 0,
        default: 0
      },
      plates: {
        type: [licensePlateSchema],
        default: []
      }
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'action_taken'],
      default: 'pending'
    },
    adminNote: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ user: 1, createdAt: -1 });
reportSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Report', reportSchema);
