import { createSlice, PayloadAction } from "@reduxjs/toolkit";              // createslice function that is used to create a a Redux slice. which define state, write reducers, and auto-generate action. and payloadaction is a typescript type this tells “What type of data will be inside action.payload”.
import type { Pizza } from "../types";

type MenuState = {
    menu: Pizza[];
};

const initialState: MenuState = {
    menu: [],
};

const menuSlice = createSlice ({
    name: "menu",
    initialState,
    reducers: {
        //-------------set menu----------------  
        setMenu(state, action: PayloadAction<Pizza[]>) {                                     //state → current Redux state and action.payload → an array of Pizza items
        state.menu = action.payload;                                              //Takes the incoming data and stores it in state.menu
}
    }
});

export const {setMenu} = menuSlice.actions;

export default menuSlice.reducer; 

