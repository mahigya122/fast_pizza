import { createContext, useContext, useReducer } from "react";             //createContext → creates a global store, useContext → lets components access that store, useReducer → manages complex state logic (like Redux reducer)
import type { ReactNode } from "react";
import type { AppAction, AppContextValue, AppState } from "./types.ts";

// INITIAL STATE
const initialState: AppState = {
  user: {
    username: "",                              //stores username
  },
  cart: [],                                    //stores items in the shopping cart
};

// REDUCER
function reducer(state: AppState, action: AppAction): AppState {                      //reducer function that takes current state and an action, and returns a new state based on the action type
  switch (action.type) {                                  //switch statement to handle different action types
    case "user/setUsername":
      return {
        ...state,                                               //spread operator to copy existing state
        user: { ...state.user, username: action.payload },             //update the username in the user object with the payload from the action. i.e.state.user.username = "Lith"
      };

    case "cart/addItem": {                                                                 // to add a new item to the cart. The action.payload is expected to be a CartItem object that contains the details of the item to be added. If the item already exists in the cart, we update its quantity instead of adding a duplicate entry.
      const existingItem = state.cart.find((item) => item.id === action.payload.id);          //find method to check if the item already exists in the cart by comparing the id of each item with the id of the payload. If a match is found, existingItem will hold that item; otherwise, it will be undefined.

      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>                                                           //if the item id matches the payload id, we create a new object with the same properties as the existing item but with an updated quantity (existing quantity + payload quantity). If it doesn't match, we return the item unchanged.
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }                       // This is where we update the quantity of the existing item by adding the quantity from the payload to the existing quantity. For example, if the existing item has a quantity of 2 and the payload has a quantity of 1, the new quantity will be 3.
              : item
          ),
        };
      }

      return {
        ...state,
        cart: [...state.cart, action.payload],                                             // if the item doesn't exist in the cart, we add it to the cart array by creating a new array that includes all existing items plus the new item from the payload. For example, if the current cart has 2 items and we add a new item, the new cart will have 3 items. The spread operator is used to create a new array that combines the existing cart items with the new item.
      };
    }

    case "cart/increaseQty":                                      // to increase the quantity of a specific item in the cart. The action.payload is expected to be the id of the item whose quantity we want to increase.
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };

    case "cart/decreaseQty":                                       // to reduce the quantity of a specific item in the cart. The action.payload is expected to be the id of the item whose quantity we want to decrease. If the quantity becomes 0 or less, we remove that item from the cart.
      return {
        ...state,
        cart: state.cart
          .map((item) =>
            item.id === action.payload
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0),
      };

    case "cart/deleteItem":                                                  // to delete item from the cart. The action.payload is expected to be the id of the item we want to remove from the cart. We use the filter method to create a new array that includes only the items whose id does not match the payload, effectively removing the specified item from the cart.
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };

    case "cart/clear":                                                     // to clean the cart after order is placed. This action doesn't require a payload since it simply resets the cart to an empty array.
      return {
        ...state,
        cart: [],
      };

    default:
      return state;                         //if the action type doesn't match any case, return the current state unchanged i.e. no state update occurs
  }
}

//  CONTEXT
const AppContext = createContext<AppContextValue | undefined>(undefined);                    //create a new context object that will hold the global state and dispatch function for the app

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {                          //AppProvider component that wraps the application and provides the global state to all child components i.e. <AppProvider><App /></AppProvider>
  const [state, dispatch] = useReducer(reducer, initialState);         //useReducer gives: state → current data , dispatch → function to update state

  return (
    <AppContext.Provider value={{ state, dispatch }}>                       {/*AppContext.Provider makes them available to all child components*/}
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {                       // this is Custom Hook that allows components to easily access the global state and dispatch function by calling useApp() instead of useContext(AppContext) directly. It abstracts away the context usage and provides a cleaner API for components to interact with the global state.
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
