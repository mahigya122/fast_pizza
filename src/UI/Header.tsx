import { useNavigate } from "react-router-dom";                 //useNavigate → lets you redirect programmatically
import { useState, type FormEvent } from "react";  
import { useDispatch} from "react-redux";
                            
import Username from "../features/user/Username";
import {clearCart} from "../redux/cartSlice";
import { setUsername } from "../redux/userSlice";

export default function Header() {
  const [query, setQuery] = useState("");                                      //Stores what user types in the search box. i.e. Example: "12345"

  const navigate = useNavigate();                                              //This gives you a function to change routes manually. i.e. navigate("/order/12345") → redirects to order page with id 12345
  const dispatch = useDispatch();                                              //This gives you the dispatch function to send actions to your Redux store. i.e. dispatch(clearCart()) → clears the cart in the Redux state

  function handleSearch(e: FormEvent<HTMLFormElement>) {                       //Handles the search form submission when user presses Enter in the search box.                    
    e.preventDefault();                                                        //stops page reload (default form behavior)
    if (!query.trim()) return;                                                 //do nothing if input is empty and Trim input to avoid spaces if there is input

    navigate(`/order/${query}`);                                               //edirects user to: /order/12345 (if they typed 12345). This is where you would show order details based on the ID in the URL.
    setQuery("");                                                              //clears input after search
  }

  function handleLogoClick() {                                                //reset everything: clear cart and username when clicking logo
    dispatch(setUsername(""));        // clear username
    dispatch(clearCart());           // clear cart
    navigate("/");
  }

  return (
    <header className="topbar">                         {/*This is the top navigation bar that appears on every page. It includes the logo, username, and search form.*/}
      {/* LEFT: Logo */}
      <button onClick={handleLogoClick} className="brand-logo">
        pizza.co
      </button>

      {/* RIGHT: Search */}
      <div className="topbar-tools">
    
    {/* Username */}
    <Username />
       
    {/* Search Order */}
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