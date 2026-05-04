import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LinkButton from "../../UI/LinkButton";
import { getOrderById } from "../../services/orderStorage";

function formatTimeRemaining(targetTime: string) {
	const remainingMs = new Date(targetTime).getTime() - Date.now();
	if (!Number.isFinite(remainingMs)) return "Estimated time unavailable";
	if (remainingMs <= 0) return "Out for delivery or arriving any moment";

	const totalSeconds = Math.ceil(remainingMs / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${minutes} min ${seconds.toString().padStart(2, "0")} sec`;
}

export default function Order() {
	const { orderId } = useParams();                                 // useParams → gets orderId from the URL (e.g., /order/123 → orderId will be "123"). This allows us to know which order to display based on the URL.
	const order = orderId ? getOrderById(orderId) : null;               // getOrderById → retrieves the order details from local storage using the orderId. If orderId is not present, it returns null.
	const [now, setNow] = useState(Date.now());                      // now state is used to trigger re-render every second so that the remaining time updates in real-time. It’s initialized with the current timestamp.

	useEffect(() => {
		const timer = window.setInterval(() => setNow(Date.now()), 1000);               // sets up a timer that updates the now state every second, which causes the component to re-render and update the displayed remaining time. The interval is cleared when the component unmounts to prevent memory leaks.
		return () => window.clearInterval(timer);                                     // Cleanup function to clear the timer when component unmounts
	}, []);

	if (!order) {              // if order is not found
		return (
			<section className="content-section">
				<h2 className="section-title">Order not found</h2>
				<p className="section-subtitle">We could not find an order with that ID on this device.</p>
				<div className="cart-footer-actions order-links" style={{ marginTop: 18 }}>
					<LinkButton to="/menu">Back to menu</LinkButton>
					<LinkButton to="/order/new" className="secondary-btn">
						Place a new order
					</LinkButton>
				</div>
			</section>
		);
	}
         // what is shown in the ui when order is shown/found.
	return ( 
		<section className="content-section"> 
			<h2 className="section-title">Order #{order.id}</h2>                      {/*Saved locally so you can reopen it anytime from this browser.*/}

			<div className="order-detail-card" style={{ marginTop: 14 }}>
				<div className="cart-footer-label">Delivery status</div>
				<div className="cart-footer-amount" style={{ fontSize: 22, marginTop: 6 }}>
					{formatTimeRemaining(order.estimatedDeliveryAt)}
				</div>
				<p style={{ marginTop: 8, color: "var(--text-muted)" }}>
					Estimated arrival by {new Date(order.estimatedDeliveryAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
				</p>
				<p style={{ color: "var(--text-muted)" }}>
					Updated {new Date(now).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}
				</p>
			</div>

			<div className="order-detail-grid">
				<div className="order-detail-card">
					<div className="cart-footer-label">Customer</div>
					<div className="cart-footer-amount" style={{ fontSize: 22 }}>
						{order.customer}
					</div>
					<p style={{ marginTop: 8, color: "var(--text-muted)" }}>address: {order.address}</p>
					{order.phone && <p style={{ color: "var(--text-muted)" }}>Phone: {order.phone}</p>}
					{order.notes && <p style={{ color: "var(--text-muted)" }}>Notes: {order.notes}</p>}
				</div>

				<div className="order-detail-card">
					<div className="cart-footer-label">Summary</div>
					<div style={{ display: "grid", gap: 6, marginTop: 8 }}>
						<div>Total price: ${order.totalPrice}</div>
						<div>Items: {order.cart.reduce((sum, item) => sum + item.quantity, 0)}</div>
						<div>Created: {new Date(order.createdAt).toLocaleString()}</div>
					</div>
				</div>
			</div>

			<div style={{ marginTop: 20 }}>
				<h3 className="menu-item-title">Items</h3>
				<ul className="cart-list">
					{order.cart.map((item) => (
						<li key={`${order.id}-${item.pizzaId}`} className="cart-row">
							<div>
								<div style={{ fontWeight: 800 }}>{item.name}</div>
								<div style={{ color: "var(--text-muted)" }}>
									{item.quantity} × ${item.unitPrice}
								</div>
							</div>
							<div style={{ fontWeight: 800 }}>${item.totalPrice}</div>
						</li>
					))}
				</ul>
			</div>

			<div className="cart-footer-actions order-links" style={{ marginTop: 18 }}>
				<LinkButton to="/menu">Back to menu</LinkButton>
				<LinkButton to="/cart" className="secondary-btn">
					Open cart
				</LinkButton>
			</div>
		</section>
	);
}