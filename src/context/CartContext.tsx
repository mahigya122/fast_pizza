import { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";
import type { CartItem } from "../types";

type CartState = {              // it creates custome type called cartstate which tells that cart will only contain an array of cart item.
  cart: CartItem[];
};

type CartAction =
  | { type: "cart/add"; payload: CartItem }
  | { type: "cart/increase"; payload: number }
  | { type: "cart/decrease"; payload: number }
  | { type: "cart/delete"; payload: number }
  | { type: "cart/clear" };

type CartContextValue = {                                       // custome type that helps defining a shape (blueprint) for your context value.
  state: CartState;                                               // This is your data that holds the current state of the cart, which includes an array of cart items.
  dispatch: React.Dispatch<CartAction>;                          // This is a function that you will use to send actions to your reducer to update the cart state. The type React.Dispatch<CartAction> means that this function will accept an action of type CartAction, which you defined above as a union of different action types related to cart operations.
};

const CartContext = createContext <CartContextValue | undefined>(undefined);                  //You are creating a global storage space for your app. This says: Context will hold CartContextValue OR it might be undefined

const initialState: CartState = {
  cart: [],                                             // initially Cart starts empty: cart[]
};

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {

    case "cart/add":
      return {...state, cart : [...state.cart, action.payload]}                   // add new item to the cart array.

    case "cart/increase":
      return {
        ...state,
        cart: state.cart.map((item: CartItem) =>                                           //.map loops through each item in the cart and checks if the item id matches the payload id. If it does, it creates a new object with the same properties as the existing item but with an updated quantity (existing quantity + 1). If it doesn't match, it returns the item unchanged.
            item.id === action.payload                                       // check if this is the item i want to update
        ? {...item, quantity: item.quantity + 1}
        : item
      ),
      
      };

    case "cart/decrease":
      return {
        ...state,
        cart: state.cart.map((item: CartItem) =>
            item.id === action.payload
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item: CartItem) => item.quantity > 0),                             //Goes through each item in the array, Checks this condition:(item.quantity > 0) Keeps the item only if the condition is true, Removes it if false
      };

    case "cart/delete":
      return {
        ...state,
        cart: state.cart .filter((item: CartItem) => item.id !== action.payload),                  // keeps the item if it is not equal to action payload, remove it if it is 
      };

    case "cart/clear":
      return { ...state, cart: [] };                               // state Keeps all other properties in the state unchanged but resets the cart to an empty array.

    default:
      return state;                                        //It returns the current state unchanged.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);               // useReducer is a React hook that takes a reducer function and an initial state as arguments and returns the current state and a dispatch function. The reducer function defines how the state should be updated based on different action types. The dispatch function is used to send actions to the reducer to update the state.

  return (
    <CartContext.Provider value={{ state, dispatch }}>                 {/*This makes the cart state and dispatch function available to all components that are wrapped by CartProvider. Any component within this provider can access the cart state and dispatch actions to update it using the useCart hook defined below.*/}
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}