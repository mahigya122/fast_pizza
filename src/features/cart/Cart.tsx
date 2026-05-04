import { useApp } from "../../store.tsx";
import CartItem from "./CartItem";
import EmptyCart from "./EmptyCart";
import LinkButton from "../../UI/LinkButton";

export default function Cart() {
	const { state, dispatch } = useApp();

	if (state.cart.length === 0) {
		return <EmptyCart />;
	}

	const total = state.cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

	return (
		<div className="content-section cart-page">
			<h2 className="section-title">Your cart</h2>
			<p className="section-subtitle">Adjust quantities, remove items, or continue adding more pizzas.</p>

			<ul className="cart-list">
				{state.cart.map((item) => (
					<CartItem key={item.id} item={item} />
				))}
			</ul>

			<div className="cart-total cart-footer-fixed">
				<p>Total: ${total}</p>
				<div className="cart-footer-actions">
					<LinkButton to="/menu" className="secondary-btn">Go back to menu</LinkButton>
					<LinkButton to="/order/new" className="primary-btn">Order pizza</LinkButton>
					<button
						onClick={() => dispatch({ type: "cart/clear" })}
						className="ghost-btn"
					>
						Clear cart
					</button>
				</div>
			</div>
		</div>
	);
}
