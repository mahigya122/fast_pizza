import { createContext, useContext, useReducer } from "react";             //createContext → creates a global store, useContext → lets components access that store, useReducer → manages complex state logic (like Redux reducer)

// INITIAL STATE
const initialState = {
  user: {
    username: "",                              //stores username
  }, 
  cart: [],                                    //stores items in the shopping cart
};

// REDUCER 
function reducer(state, action) {                      //reducer function that takes current state and an action, and returns a new state based on the action type
  switch (action.type) {                                  //switch statement to handle different action types
    case "user/setUsername": 
      return {
        ...state,                                               //spread operator to copy existing state
        user: { ...state.user, username: action.payload },             //update the username in the user object with the payload from the action. i.e.state.user.username = "Lith"
      };

    default:
      return state;                         //if the action type doesn't match any case, return the current state unchanged i.e. no state update occurs
  }
}

//  CONTEXT
const AppContext = createContext();                    //create a new context object that will hold the global state and dispatch function for the app

export function AppProvider({ children }) {                          //AppProvider component that wraps the application and provides the global state to all child components i.e. <AppProvider><App /></AppProvider>
  const [state, dispatch] = useReducer(reducer, initialState);         //useReducer gives: state → current data , dispatch → function to update state

  return (
    <AppContext.Provider value={{ state, dispatch }}>                       {/*AppContext.Provider makes them available to all child components*/}
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {                       // this is Custom Hook that allows components to easily access the global state and dispatch function by calling useApp() instead of useContext(AppContext) directly. It abstracts away the context usage and provides a cleaner API for components to interact with the global state.
  return useContext(AppContext);         
}