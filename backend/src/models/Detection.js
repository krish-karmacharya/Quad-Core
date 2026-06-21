const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema(
  {
    imagePath: {
      type: String,
      required: true
    },
    originalFileName: {
      type: String,
      required: true
    },
    smokeDetection: {
      smokeDetected: {
        type: Boolean,
        default: false
      },
      totalSmokeDetections: {
        type: Number,
        default: 0
      },
      detections: [
        {
          class: { type: String, default: 'smoke' },
          confidence: Number,
          box: {
            x: Number,
            y: Number,
            width: Number,
            height: Number
          },
          segmentationPointsCount: Number
        }
      ]
    },
    licensePlateDetection: {
      performed: {
        type: Boolean,
        default: false
      },
      reason: String,
      totalPlates: {
        type: Number,
        default: 0
      },
      plates: [
        {
          plateTextOriginal: String,
          plateTextNormalized: String,
          yoloConfidence: Number,
          ocrConfidence: Number,
          box: {
            x1: Number,
            y1: Number,
            x2: Number,
            y2: Number
          }
        }
      ]
    },
    status: {
      type: String,
      enum: ["NO_SMOKE", "SMOKE_DETECTED", "PLATE_DETECTED", "PLATE_NOT_FOUND", "ERROR"],
      required: true
    },
    reviewStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING"
    },
    adminReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
      },
      reviewedAt: {
        type: Date,
        default: null
      },
      note: {
        type: String,
        default: ""
      },
      correctedPlateText: {
        type: String,
        default: ""
      }
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

module.exports = mongoose.model('Detection', detectionSchema);
