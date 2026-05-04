//mini Redux for username only.
import { createContext, useContext, useReducer } from "react";        //createContext → creates global shared space, useContext → lets components read it, useReducer → manages state updates (like Redux reducer)
import type { ReactNode } from "react";

type UserState = {
 username: string;
};

type UserAction = { type: "user/setUsername"; payload: string };

type UserContextValue = {
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);                        //global container to holds state + dispatch

const initialState: UserState = {
 username: "",                                        //Default value: username starts empty
};

function reducer(state: UserState, action: UserAction): UserState {
    switch (action.type){                                         //When you dispatch: type: "user/setUsername", payload: "Lith". 
        case "user/setUsername":
            return{... state, username: action.payload};
            default:
                return state;     
    }
}

export function UserProvider({children}: {children: ReactNode}) {                                   //Wraps your entire app so everything can access user state
    const [state,dispatch]= useReducer(reducer, initialState);                       //state → current username, dispatch → function to update username by sending actions to the reducer

    return(
        <UserContext.Provider value={{state, dispatch }}>                        {/*Everything inside app can use: state and dispatch to read username and update it*/}
            {children}
        </UserContext.Provider>
    );
}
export function useUser(): UserContextValue {                                          //Custom Hook to easily access user context in any component by calling useUser() instead of useContext(UserContext) directly. It abstracts away the context usage and provides a cleaner API for components to interact with the user state.
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
}