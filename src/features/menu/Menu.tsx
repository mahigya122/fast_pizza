import { useEffect, useState } from "react";                                 //useState → store menu data and useEffect → run code when component loads
import { getMenu } from "../../services/apiRestaurant.ts";                            //getMenu → API call (fetch pizzas)
import MenuItem from "./MenuItem";                                             //MenuItem → component to display each pizza
import CartOverview from "../cart/CartOverview";                                   //CartOverview → component to show cart summary at the bottom of the menu page
import type { Pizza } from "../../types.ts";
import Loader from "../../UI/Loader";
import LinkButton from "../../UI/LinkButton";

export default function Menu() {
  const [menu, setMenu] = useState<Pizza[]>([]);                                   //Initially: menu is empty array. After fetching data from server, we update it with setMenu(data) and the component re-renders to show the pizzas.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const data = await getMenu();                                        //Calls API: getMenu() → fetches pizza data from the server. This is an asynchronous operation, so we use await to wait for the response before proceeding.
        setMenu(data);                                                               // Saves result into state: setMenu(data) → updates the menu state with the fetched pizza data. This triggers a re-render of the component, and now we can display the list of pizzas on the page using the menu state.
      } finally {
        setIsLoading(false);
      }
    }
    fetchMenu();
  }, []);                                                    //Runs once when page loads

  useEffect(() => {
    document.body.classList.add("menu-scroll-lock");                  //Adds a class to the entire page (<body>) so the body become unscrollable when the menu is open. This is useful for mobile devices to prevent background scrolling when the user is browsing the menu. and overflow: hidden;

    return () => {
      document.body.classList.remove("menu-scroll-lock");
    };
  }, []);

  return (
    <div className="content-section menu-page">
      <h1 className="section-title">Menu</h1>
      <p className="section-subtitle">Handcrafted recipes with balanced ingredients and bold flavors.</p>

      {isLoading ? (
        <Loader label="Loading menu..." />
      ) : menu.length === 0 ? (
        <div className="empty-state-card">
          <p className="section-subtitle">No pizzas available right now.</p>
          <LinkButton to="/" className="primary-btn">Back home</LinkButton>
        </div>
      ) : (
        <div className="menu-list">
          {menu.map((pizza) => (
            <MenuItem pizza={pizza} key={pizza.id} />
          ))}
        </div>
      )}

      {/* FOOTER */}
      <CartOverview />
    </div>
  );
}