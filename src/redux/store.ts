import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import userReducer from "./userSlice";
import menuReducer from "./menuSlice";

export const store = configureStore({                                   // my export variable i.e. store.
  reducer: {
    cart: cartReducer,
    user: userReducer,
    menu: menuReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;