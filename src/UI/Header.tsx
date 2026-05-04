import { useNavigate } from "react-router-dom";                 //useNavigate → lets you redirect programmatically
import { useState } from "react";                                  // useState → manages input value
import type { FormEvent } from "react";
import Username from "../features/user/Username";
import { useCart } from "../context/CartContext";               //useCart → access cart dispatch to reset cart
import { useUser } from "../context/UserContext";               //useUser → access user dispatch to reset username
                              //useApp → access global state + dispatch to reset cart and username

export default function Header() {
  const [query, setQuery] = useState("");                                //Stores what user types in the search box. i.e. Example: "12345"
  const navigate = useNavigate();                                      //This gives you a function to change routes manually. i.e. navigate("/order/12345") → redirects to order page with id 12345
  const { dispatch: cartDispatch } = useCart();                    //dispatch → to reset cart
  const { dispatch: userDispatch } = useUser();                   //dispatch → to reset username

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();                                          //stops page reload (default form behavior)
    if (!query.trim()) return;                                           //do nothing if input is empty and Trim input to avoid spaces:

    navigate(`/order/${query}`);                                     //edirects user to: /order/12345 (if they typed 12345). This is where you would show order details based on the ID in the URL.
    setQuery("");                                                //clears input after search
  }

  function handleLogoClick() {                                   //reset everything: clear cart and username when clicking logo
    userDispatch({ type: "user/setUsername", payload: "" });        //clear username
    cartDispatch({ type: "cart/clear" });                           //clear cart
    navigate("/");                                              //go back to home
  }

  return (
    <header className="topbar">                                   {/*This is the top navigation bar that appears on every page. It includes the logo, username, and search form.*/}
      {/* LEFT: Logo */}
      <button onClick={handleLogoClick} className="brand-logo">
        pizza.co
      </button>

      {/* RIGHT: Search */}
      <div className="topbar-tools">
    
    {/* Username */}
    <Username />

      <form onSubmit={handleSearch} className="order-search-form">
        <input
          type="text"
          placeholder="Track order #"
          value={query}
          onChange={(e) => setQuery(e.target.value)}                                  //value → comes from state, onChange → updates state when user types
          className="order-search-input"
        />
      </form>
      </div>
    </header>
  );
}