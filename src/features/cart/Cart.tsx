import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { clearCart } from "../../redux/cartSlice"; 
import CartItem from "./CartItem";
import EmptyCart from "./EmptyCart";
import LinkButton from "../../UI/LinkButton";

export default function Cart() {
	const dispatch = useDispatch();
	const cart = useSelector((state: RootState) => state.cart.cart);
	const username = useSelector((state: RootState) => state.user.name);

	if (cart.length === 0) {
		return <EmptyCart />;
	}

	const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);                  //This loops through cart and calculates: total = quantity × price (for each item) + sum

	return (
		<div className="content-section cart-page">
			<p className="eyebrow">Your order</p>
			<h2 className="section-title">{username ? `${username}'s cart` : "Your cart"}</h2>
			<p className="section-subtitle">Adjust quantities, remove items, or continue adding more pizzas.</p>

			<ul className="cart-list">
				{cart.map((item) => (
					<CartItem key={item.id} item={item} />
				))}
			</ul>

			<div className="cart-total cart-footer-fixed">
				<div className="cart-footer-summary">
					<span className="cart-footer-label">Cart total</span>

					{/* formatted */}
					<p className="cart-footer-amount">
						${total.toFixed(2)}                               {/*toFixed(2) formats the total to always show 2 decimal places, even if it's a whole number (e.g., $20.00 instead of $20)*/}
					</p>
				</div>

				<div className="cart-footer-actions">
					<LinkButton to="/menu" className="secondary-btn">
						Continue browsing
					</LinkButton>

					<LinkButton to="/order/new" className="primary-btn">
						Checkout
					</LinkButton>

					<button
						onClick={() => dispatch(clearCart())}
						className="ghost-btn"
					>
						Clear cart
					</button>
				</div>
			</div>
		</div>
	);
	}