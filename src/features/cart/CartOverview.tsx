import { Link } from "react-router-dom";
import { useApp } from "../../store.tsx";

export default function CartOverview() {
	const { state } = useApp();

	const totalQuantity = state.cart.reduce((sum, item) => sum + item.quantity, 0);
	const totalPrice = state.cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

	if (totalQuantity === 0) return null;

	return (
		<div className="cart-total cart-footer-fixed">
			<p>
				{totalQuantity} pizzas | ${totalPrice}
			</p>
			<Link to="/cart" className="secondary-btn">
				Open cart
			</Link>
		</div>
	);
}
