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
				<div style={{ textAlign: "center", paddingTop: 20, paddingBottom: 20 }}>
					<h2 className="section-title">📭 Order not found</h2>
					<p className="section-subtitle" style={{ marginTop: 12 }}>We could not find an order with that ID on this device.</p>
					<div className="cart-footer-actions order-links" style={{ marginTop: 28, justifyContent: "center" }}>
						<LinkButton to="/menu">Back to menu</LinkButton>
						<LinkButton to="/order/new" className="secondary-btn">
							Place a new order
						</LinkButton>
					</div>
				</div>
			</section>
		);
	}
	// what is shown in the ui when order is shown/found.
	const itemCount = order.cart.reduce((sum, item) => sum + item.quantity, 0);
	const timeRemaining = formatTimeRemaining(order.estimatedDeliveryAt);
	const isDelivered = timeRemaining === "Out for delivery or arriving any moment";

	return ( 
		<section className="content-section"> 
			{/* Order Header */}
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
				<div>
					<h2 className="section-title" style={{ marginBottom: 4 }}>Order #{order.id}</h2>
					<p className="section-subtitle">Saved locally • Placed {new Date(order.createdAt).toLocaleDateString()}</p>
				</div>
				<div style={{
					display: "inline-block",
					padding: "8px 14px",
					backgroundColor: isDelivered ? "#d1fae5" : "#fef3c7",
					color: isDelivered ? "#065f46" : "#92400e",
					borderRadius: 8,
					fontWeight: 700,
					fontSize: "0.85rem"
				}}>
					{isDelivered ? "🚗 Out for delivery" : "🍕 Preparing"}
				</div>
			</div>

			{/* Delivery Status Card */}
			<div style={{
				border: "1px solid var(--border)",
				borderRadius: 14,
				background: "linear-gradient(135deg, rgba(31, 111, 120, 0.08), rgba(240, 163, 74, 0.06))",
				padding: 20,
				marginBottom: 20
			}}>
				<div className="cart-footer-label" style={{ marginBottom: 8 }}>⏱️ Delivery Status</div>
				<div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", marginBottom: 12 }}>
					{timeRemaining}
				</div>
				<div style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: 16,
					marginTop: 12,
					padding: "12px 0",
					borderTop: "1px solid rgba(31, 111, 120, 0.1)"
				}}>
					<div>
						<p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>Arrival Time</p>
						<p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--text-strong)" }}>
							{new Date(order.estimatedDeliveryAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
						</p>
					</div>
					<div>
						<p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>Last Updated</p>
						<p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--text-strong)" }}>
							{new Date(now).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
						</p>
					</div>
				</div>
			</div>

			{/* Details Grid */}
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
				{/* Customer Info */}
				<div style={{
					border: "1px solid var(--border)",
					borderRadius: 12,
					padding: 18,
					background: "var(--surface)"
				}}>
					<div className="cart-footer-label" style={{ marginBottom: 10 }}>👤 Customer Info</div>
					<div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: "var(--text-strong)" }}>{order.customer}</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
						<div>
							<p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Address</p>
							<p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-strong)", lineHeight: 1.4 }}>{order.address}</p>
						</div>
						{order.phone && (
							<div>
								<p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Phone</p>
								<p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-strong)" }}>{order.phone}</p>
							</div>
						)}
						{order.notes && (
							<div>
								<p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Notes</p>
								<p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-strong)", fontStyle: "italic" }}>"{order.notes}"</p>
							</div>
						)}
					</div>
				</div>

				{/* Order Summary */}
				<div style={{
					border: "1px solid var(--border)",
					borderRadius: 12,
					padding: 18,
					background: "var(--surface)"
				}}>
					<div className="cart-footer-label" style={{ marginBottom: 10 }}>📦 Order Summary</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>Total Items</p>
							<p style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "var(--text-strong)" }}>{itemCount}</p>
						</div>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>Total Price</p>
							<p style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "var(--primary-strong)" }}>${order.totalPrice}</p>
						</div>
						<div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
							<p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Placed At</p>
							<p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-strong)" }}>{new Date(order.createdAt).toLocaleString()}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Order Items */}
			<div style={{ marginBottom: 24 }}>
				<h3 className="menu-item-title" style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>🍕 Order Items</h3>
				<ul className="cart-list">
					{order.cart.map((item) => (
						<li key={`${order.id}-${item.pizzaId}`} className="cart-row" style={{ background: "linear-gradient(180deg, var(--surface), var(--surface-tint))" }}>
							<div>
								<div style={{ fontWeight: 800, fontSize: "1.02rem", marginBottom: 6 }}>{item.name}</div>
								<div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
									{item.quantity} × ${item.unitPrice.toFixed(2)}
								</div>
							</div>
							<div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--primary-strong)" }}>${item.totalPrice.toFixed(2)}</div>
						</li>
					))}
				</ul>
			</div>

			{/* Action Buttons */}
			<div className="cart-footer-actions order-links" style={{ marginTop: 24, justifyContent: "center", gap: 12 }}>
				<LinkButton to="/menu" style={{ flex: "0 1 auto" }}>← Back to menu</LinkButton> 
			</div>
		</section>
	);
}