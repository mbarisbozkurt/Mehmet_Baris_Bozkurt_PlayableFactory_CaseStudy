import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: string;
  name: string;
  image?: string;
  price: number; // unit price
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  shippingAddress?: { street: string; city: string; state: string; zipCode: string; phone: string };
  paymentMethod?: 'credit_card' | 'bank_transfer';
}

const loadInitialState = (): CartState => {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const raw = localStorage.getItem('cart');
    if (!raw) return { items: [] };
    return JSON.parse(raw) as CartState;
  } catch {
    return { items: [] };
  }
};

const initialState: CartState = loadInitialState();

const persist = (state: CartState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(state));
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      if (existing) existing.quantity += action.payload.quantity;
      else state.items.push(action.payload);
      persist(state);
    },
    removeItem: (state, action: PayloadAction<{ productId: string }>) => {
      state.items = state.items.filter((i) => i.productId !== action.payload.productId);
      persist(state);
    },
    increment: (state, action: PayloadAction<{ productId: string }>) => {
      const it = state.items.find((i) => i.productId === action.payload.productId);
      if (it) it.quantity += 1;
      persist(state);
    },
    decrement: (state, action: PayloadAction<{ productId: string }>) => {
      const it = state.items.find((i) => i.productId === action.payload.productId);
      if (it) it.quantity = Math.max(1, it.quantity - 1);
      persist(state);
    },
    clearCart: (state) => {
      state.items = [];
      persist(state);
    },
    setAddress: (state, action: PayloadAction<CartState['shippingAddress']>) => {
      state.shippingAddress = action.payload;
      persist(state);
    },
    setPaymentMethod: (state, action: PayloadAction<CartState['paymentMethod']>) => {
      state.paymentMethod = action.payload;
      persist(state);
    },
  },
});

export const { addItem, removeItem, increment, decrement, clearCart, setAddress, setPaymentMethod } = cartSlice.actions;
export default cartSlice.reducer;

