import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { UserProvider } from "./context/UserContext";
import { CartProvider } from "./context/CartContext";
import { MenuProvider } from "./context/MenuContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
      <MenuProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </MenuProvider>
    </UserProvider>
  </React.StrictMode>
);