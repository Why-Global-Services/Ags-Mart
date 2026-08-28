const mongoose = require('mongoose');
const { v4 } = require('uuid');

const couponSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: v4,
    },
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Coupon message is required'],
      trim: true,
    },
    
    // Offer Type
    offerType: {
      type: String,
      enum: ['DISCOUNT', 'FREE_PRODUCT'],
      default: 'DISCOUNT',
      required: true,
    },

    // Common Fields
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // DISCOUNT-specific fields
    discountValue: {
      type: Number,
      min: 0,
      required: function() {
        return this.offerType === 'DISCOUNT';
      },
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: function() {
        return this.offerType === 'DISCOUNT';
      },
    },
    maxDiscountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // FREE_PRODUCT-specific fields
    freeProduct: {
      productId: {
        type: String,
        ref: 'Product',
        required: function() {
          return this.offerType === 'FREE_PRODUCT';
        },
      },
      variantId: {
        type: String,
        required: function() {
          return this.offerType === 'FREE_PRODUCT' && this.freeProduct?.productType === 'variant';
        },
      },
      productType: {
        type: String,
        enum: ['variant', 'nonVariant'],
        required: function() {
          return this.offerType === 'FREE_PRODUCT';
        },
      },
    },

    // Validity
    validFrom: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    validUntil: {
      type: Date,
      required: [true, 'End date is required'],
    },

    // Usage
    usageLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    repeatUsage: {
      type: String,
      enum: ['allowed', 'notAllowed'],
      default: 'allowed',
    },

    // Image
    couponImage: {
      type: String,
      required: [true, 'Coupon image is required'],
    },

    // Flags
    cashBack: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    firstOrderOnly: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ status: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });

// Validation: Ensure end date is after start date
couponSchema.pre('save', function(next) {
  if (this.validUntil <= this.validFrom) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Validation: First order coupons should not allow repeat usage
couponSchema.pre('save', function(next) {
  if (this.firstOrderOnly && this.repeatUsage === 'allowed') {
    this.repeatUsage = 'notAllowed';
  }
  if (this.firstOrderOnly && this.usageLimit > 1) {
    this.usageLimit = 1;
  }
  next();
});

const CouponModel = mongoose.model('Coupon', couponSchema);

module.exports = {CouponModel};