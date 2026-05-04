import { useCart } from "../../context/CartContext";                                  //useCart → access global cart state + dispatch
import { useUser } from "../../context/UserContext";                                  //useUser → access user state for username
import CartItem from "./CartItem";                                         //CartItem → renders each item in the cart with its details and quantity controls
import EmptyCart from "./EmptyCart";                                        //EmptyCart → shown when cart is empty
import LinkButton from "../../UI/LinkButton";                            //LinkButton → custom button that uses React Router's Link for navigation without page reload

export default function Cart() {
	const { state, dispatch } = useCart();                            //state.cart → list of items , dispatch → update cart
	const { state: userState } = useUser();                            //state.username → get username

	if (state.cart.length === 0) {                                  //If cart is empty: stop rendering this page show <EmptyCart /> instead
		return <EmptyCart />;
	}

	const total = state.cart.reduce((sum, item) => sum + item.quantity * item.price, 0);                  //This loops through cart and calculates: total = quantity × price (for each item) + sum

	return (
		<div className="content-section cart-page">
			<p className="eyebrow">Your order</p>
			<h2 className="section-title">{userState.username}'s cart</h2>                            {/*Shows username's cart. If no username → shows "cart" */}                                             
			<p className="section-subtitle">Adjust quantities, remove items, or continue adding more pizzas.</p>

			<ul className="cart-list">
				{state.cart.map((item) => (                                    //For each item: render <CartItem /> and pass them as props (item details + quantity controls). The key prop helps React optimize rendering by uniquely identifying each item in the list.
					<CartItem key={item.id} item={item} />
				))}
			</ul>

			<div className="cart-total cart-footer-fixed">
				<div className="cart-footer-summary">
					<span className="cart-footer-label">Cart total</span>
					<p className="cart-footer-amount">${total}</p>                                           {/*Shows total price*/}
				</div>
				<div className="cart-footer-actions">
					<LinkButton to="/menu" className="secondary-btn">Continue browsing</LinkButton>
					<LinkButton to="/order/new" className="primary-btn">Checkout</LinkButton>
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
