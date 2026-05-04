//This component is a mini cart summary (footer bar) that shows: total number of pizzas, total price and and a quick link to open the cart

import { Link } from "react-router-dom";                                           //Link → navigate to cart page
import { useCart } from "../../context/CartContext";                                      //useCart → access global cart state

export default function CartOverview() {
	const { state } = useCart();                                                  //use to Access: state.cart → list of items in cart, each item has quantity and price

	const totalQuantity = state.cart.reduce((sum, item) => sum + item.quantity, 0);                       //Adds up all quantities
	const totalPrice = state.cart.reduce((sum, item) => sum + item.quantity * item.price, 0);               //Adds total cost

	if (totalQuantity === 0) return null;

	return (
		<div className="cart-total cart-footer-fixed cart-overview-bar">
			<div className="cart-overview-copy">
				<p className="cart-overview-eyebrow">Current order</p>
				<p className="cart-overview-total">
					{totalQuantity} pizzas · ${totalPrice}
				</p>
			</div>
			<Link to="/cart" className="primary-btn cart-overview-cta">
				Open cart
			</Link>
		</div>
	);
}
