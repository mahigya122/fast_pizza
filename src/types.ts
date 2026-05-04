//This file is TypeScript type definitions for your app. 
//It doesn’t run code — it describes the shape of your data and actions so your app is safer and easier to manage.

export type Pizza = {
  id: number;
  name: string;
  unitPrice: number;
  ingredients: string[];
  soldOut?: boolean;
  imageUrl?: string;
};

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export type AppState = {                          //This defines the shape of the global state of the application. It includes a user object with a username property and a cart array that holds CartItem objects. This state will be managed by a reducer and provided to the rest of the app through context.
  user: {
    username: string;
  };
  cart: CartItem[];
};

export type AppAction =                                                 //This defines the shape of all possible actions that can be dispatched to the reducer. Each action has a type property that indicates the type of action being performed, and a payload property that carries any additional data needed to perform that action.
  | { type: "user/setUsername"; payload: string }
  | { type: "cart/addItem"; payload: CartItem }
  | { type: "cart/increaseQty"; payload: number }
  | { type: "cart/decreaseQty"; payload: number }
  | { type: "cart/deleteItem"; payload: number }
  | { type: "cart/clear" };

export type AppContextValue = {                                      //This defines the shape of the value that will be provided by the AppContext. It includes the current state of the application (state) and a dispatch function (dispatch) that can be used to send actions to the reducer to update the state.
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
};
