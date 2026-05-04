import { Link } from "react-router-dom";

export default function EmptyCart() {
	return (
		<div className="empty-state-card">
			<p className="section-subtitle">Your cart is empty. Start by adding some pizzas from the menu.</p>
			<Link to="/menu" className="primary-btn">
				Go to menu
			</Link>
		</div>
	);
}
