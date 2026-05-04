import { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";
import type { Pizza } from "../types";

type MenuState = {
  menu: Pizza[];
};

type MenuAction = { type: "menu/set"; payload: Pizza[] };

type MenuContextValue = {
  state: MenuState;
  dispatch: React.Dispatch<MenuAction>;
};

const MenuContext = createContext<MenuContextValue | undefined>(undefined);                        //this creates a global menu container

const initialState: MenuState = {
  menu: [],                                      // initially Menu starts empty: menu[]
};

function reducer(state: MenuState, action: MenuAction): MenuState {
  switch (action.type) {

    case "menu/set":
       return {...state, menu: action.payload};
       default:
        return state;
  }
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);              // wraps the application and provides the global state to all child components i.e. <MenuProvider><App /></MenuProvider>. useReducer gives: state → current data , dispatch → function to update state

  return (
    <MenuContext.Provider value={{ state, dispatch }}>                         
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu(): MenuContextValue {                         //custome hook that allows components to easily access the menu context. It uses the useContext hook to access the MenuContext and returns its value, which includes both the current state of the menu and the dispatch function to update it. By using this custom hook, components can simply call useMenu() to get access to the menu state and dispatch function without needing to import useContext and MenuContext directly.
  const context = useContext(MenuContext);
  if (!context) throw new Error("useMenu must be used within MenuProvider");
  return context;
}