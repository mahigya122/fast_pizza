import { Link } from "react-router-dom";
import { useApp } from "../../store.tsx";
import CreateUser from "../user/CreateUser";
import Username from "../user/Username";

export default function CreateOrder() {
	const { state } = useApp();

	return (
		<section className="content-section">
			<h2 className="section-title">Checkout coming next</h2>
			<p className="section-subtitle">This is your future order/new page. We can build the full checkout flow in the next step.</p>

			{state.user.username ? (
				<p className="section-subtitle" style={{ marginTop: "10px" }}>
					Taking order for <Username className="inline-username" prefix="" />
				</p>
			) : (
				<CreateUser buttonLabel="Save name for this order" placeholder="Enter your name for order" />
			)}

			<div className="cart-footer-actions order-links">
				<Link to="/cart" className="ghost-btn">
					Back to cart
				</Link>
				<Link to="/menu" className="secondary-btn">
					Go to menu
				</Link>
			</div>
		</section>
	);
}
