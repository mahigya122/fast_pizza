//This component is a mini cart summary (footer bar) 

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

export default function CartOverview() {
	const cart = useSelector((state: RootState) => state.cart.cart);

	const { totalQuantity, totalPrice } = cart.reduce(                         //This loops through cart and calculates: totalQuantity = sum of all item quantities, totalPrice = sum of (quantity × price) for all items
		(acc, item) => {
			acc.totalQuantity += item.quantity;
			acc.totalPrice += item.quantity * item.price;
			return acc;
		},
		{ totalQuantity: 0, totalPrice: 0 }
	);	

	if (totalQuantity === 0) return null;

	return (
		<div className="cart-total cart-footer-fixed cart-overview-bar">
			<div className="cart-overview-copy">
				<p className="cart-overview-eyebrow">Current order</p>
				<p className="cart-overview-total">
					{totalQuantity} pizzas · ${totalPrice.toFixed(2)}                           
				</p>
			</div>
			<Link to="/cart" className="primary-btn cart-overview-cta">
				Open cart
			</Link>
		</div>
	);
}
