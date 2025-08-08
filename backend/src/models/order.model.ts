import mongoose, { Document, Schema } from 'mongoose';

// Order item interface
interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variant?: {
    size?: string;
    color?: string;
    sku?: string;
  };
  quantity: number;
  price: number;
  name: string; // Store product name at the time of order
}

// Order document interface
export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  paymentInfo: {
    method: 'credit_card' | 'bank_transfer';
    status: 'pending' | 'completed' | 'failed';
    transactionId?: string;
  };
  trackingNumber?: string;
  notes?: string;
  calculateTotalAmount(): void;
}

// Order schema
const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    items: [{
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      variant: {
        size: String,
        color: String,
        sku: String,
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
      },
      price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
      },
      name: {
        type: String,
        required: true,
      },
    }],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    paymentInfo: {
      method: {
        type: String,
        enum: ['credit_card', 'bank_transfer'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
      },
      transactionId: String,
    },
    trackingNumber: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Calculate total amount before saving
orderSchema.methods.calculateTotalAmount = function() {
  this.totalAmount = this.items.reduce((total: number, item: IOrderItem) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Pre-save middleware to calculate total amount
orderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.calculateTotalAmount();
  }
  next();
});

// Index for better search performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

// Create the model
const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;