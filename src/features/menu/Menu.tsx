import { useEffect, useState } from "react";                                 //useState → store menu data and useEffect → run code when component loads
import { getMenu } from "../../services/apiRestaurant";                            //getMenu → API call (fetch pizzas)
import MenuItem from "./MenuItem";                                             //MenuItem → component to display each pizza
import CartOverview from "../cart/CartOverview";                                   //CartOverview → component to show cart summary at the bottom of the menu page
import type { Pizza } from "../../types";
import Loader from "../../UI/Loader";
import LinkButton from "../../UI/LinkButton";

export default function Menu() {
  const [menu, setMenu] = useState<Pizza[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
		let isMounted = true;

		(async () => {
			try {
				const data = await getMenu();

				if (isMounted) setMenu(data);
			} catch (err) {
				// Error handling - could display to user if needed
			} finally {
				if (isMounted) setIsLoading(false);
			}
		})();

    return () => {
			isMounted = false;
		};
	}, []);
                                          
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