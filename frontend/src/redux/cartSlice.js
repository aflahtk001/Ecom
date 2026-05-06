import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: [],
  shopkeeperId: null, // Restrict cart to one shop at a time for checkout simplicity
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const shopId = item.shopkeeperId?._id || item.shopkeeperId;
      
      // Check if trying to add item from different shop
      if (state.shopkeeperId && state.shopkeeperId !== shopId) {
        state.cartItems = []; // reset cart for new shop
        state.shopkeeperId = shopId;
      } else if (!state.shopkeeperId) {
        state.shopkeeperId = shopId;
      }

      const existItem = state.cartItems.find((x) => x._id === item._id);
      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? { ...x, qty: x.qty + (item.qty || 1) } : x
        );
      } else {
        state.cartItems.push({ ...item, qty: item.qty || 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      if (state.cartItems.length === 0) {
        state.shopkeeperId = null;
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.shopkeeperId = null;
    }
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
