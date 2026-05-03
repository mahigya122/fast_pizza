import { Link, useNavigate } from "react-router-dom";                 //Link → for navigation without page reload, useNavigate → lets you redirect programmatically
import { useState } from "react";                                  // useState → manages input value
import { useApp } from "../store";                   // useApp → custom hook to access global state and dispatch actions

export default function Header() {
  const [query, setQuery] = useState("");                                //Stores what user types in the search box. i.e. Example: "12345"
  const navigate = useNavigate();                                      //This gives you a function to change routes manually. i.e. navigate("/order/12345") → redirects to order page with id 12345
  const { state } = useApp();
  const username = state.user.username;

  function handleSearch(e) {
    e.preventDefault();                                          //stops page reload (default form behavior)
    if (!query.trim()) return;                                           //do nothing if input is empty and Trim input to avoid spaces:

    navigate(`/order/${query}`);                                     //edirects user to: /order/12345 (if they typed 12345). This is where you would show order details based on the ID in the URL.
    setQuery("");                                                //clears input after search
  }

  return (
    <header className="flex justify-between items-center p-4 bg-yellow-400">
      {/* LEFT: Logo */}
      <Link to="/" className="font-bold text-xl">
        pizza.co
      </Link>

      {/* RIGHT: Search */}
      <div className="flex items-center gap-4">
    
    {/* Username */}
    {username && (                                                                         //User types name in Home, dispatch stores it in global state, Header (which is always rendered via AppLayout) reads it, React re-renders → username appears instantly. 
      <span className="bg-white px-3 py-1 rounded-full text-sm font-semibold">
    👤 {username}
      </span>
    )}

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search order #"
          value={query}
          onChange={(e) => setQuery(e.target.value)}                                  //value → comes from state, onChange → updates state when user types
          className="px-2 py-1 rounded"
        />
      </form>
      </div>
    </header>
  );
}