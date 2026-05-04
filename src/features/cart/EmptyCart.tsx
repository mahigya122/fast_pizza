import { Link } from "react-router-dom";                     //Link is used for navigation without page reload so user can go to /menu

export default function EmptyCart() {                              //This is a React function component that returns UI.
	return (
		<div className="empty-state-card">
			<p className="section-subtitle">Your cart is empty. Start by adding some pizzas from the menu.</p>
			<Link to="/menu" className="primary-btn">
				Go to menu
			</Link>
		</div>
	);
}
