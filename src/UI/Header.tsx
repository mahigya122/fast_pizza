import { Link, useNavigate } from "react-router-dom";                 //Link → for navigation without page reload, useNavigate → lets you redirect programmatically
import { useState } from "react";                                  // useState → manages input value
import type { FormEvent } from "react";
import Username from "../features/user/Username";

export default function Header() {
  const [query, setQuery] = useState("");                                //Stores what user types in the search box. i.e. Example: "12345"
  const navigate = useNavigate();                                      //This gives you a function to change routes manually. i.e. navigate("/order/12345") → redirects to order page with id 12345

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();                                          //stops page reload (default form behavior)
    if (!query.trim()) return;                                           //do nothing if input is empty and Trim input to avoid spaces:

    navigate(`/order/${query}`);                                     //edirects user to: /order/12345 (if they typed 12345). This is where you would show order details based on the ID in the URL.
    setQuery("");                                                //clears input after search
  }

  return (
    <header className="topbar">                                   {/*This is the top navigation bar that appears on every page. It includes the logo, username, and search form.*/}
      {/* LEFT: Logo */}
      <Link to="/" className="brand-logo">
        pizza.co
      </Link>

      {/* RIGHT: Search */}
      <div className="topbar-tools">
    
    {/* Username */}
    <Username />

      <form onSubmit={handleSearch} className="order-search-form">
        <input
          type="text"
          placeholder="Search order #"
          value={query}
          onChange={(e) => setQuery(e.target.value)}                                  //value → comes from state, onChange → updates state when user types
          className="order-search-input"
        />
      </form>
      </div>
    </header>
  );
}