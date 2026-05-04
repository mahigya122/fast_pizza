import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useCart } from "../../context/CartContext";
import CreateUser from "../user/CreateUser";
import { createOrder } from "../../services/apiRestaurant";
// apiGeocoding is a small JS helper; suppress implicit any for now
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getUserAddress } from "../../services/apiGeocoding.js";

export default function CreateOrder() {
	const navigate = useNavigate();
	const { state: userState, dispatch: userDispatch } = useUser();
	const { state: cartState, dispatch: cartDispatch } = useCart();

	const [name, setName] = useState(userState.username || "");
	const [address, setAddress] = useState("");
	const [phone, setPhone] = useState("");
	const [notes, setNotes] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState<null | { id: string }>(null);
	const [error, setError] = useState<string | null>(null);

	// autofill address using browser geolocation (optional)
	async function tryAutofillAddress() {
		try {
			setLoading(true);
			const result = await getUserAddress();
			setAddress(String(result.address ?? ""));
		} catch (err: unknown) {
			// ignore silently — user can type address manually
		} finally {
			setLoading(false);
		}
	}

	const total = cartState.cart.reduce((s, i) => s + i.price * i.quantity, 0);

	async function handlePlaceOrder() {
		setError(null);
		if (!name.trim()) return setError("Please provide your name.");
		if (!address.trim()) return setError("Please provide delivery address.");
		if (cartState.cart.length === 0) return setError("Your cart is empty.");

		const payload = {
			customerName: name.trim(),
			address: address.trim(),
			phone: phone.trim(),
			notes: notes.trim(),
			items: cartState.cart.map((it) => ({ id: it.id, name: it.name, price: it.price, quantity: it.quantity })),
			total,
		} as const;

		try {
			setLoading(true);
			const created = await createOrder(payload);
			// created usually contains order id or details
			const id = (created && (created as any).id) || (created && (created as any)._id) || String(Date.now());
			// clear cart and persist username
			cartDispatch({ type: "cart/clear" });
			userDispatch({ type: "user/setUsername", payload: name.trim() });
			setSuccess({ id });
			// optionally navigate to order/:id if you add a route later
			// navigate(`/order/${id}`);
		} catch (err: unknown) {
			setError((err as Error)?.message || String(err));
		} finally {
			setLoading(false);
		}
	}

	if (success) {
		return (
			<section className="content-section">
				<h2 className="section-title">Order placed</h2>
				<p className="section-subtitle">Thanks — your order is confirmed.</p>
				<p style={{ marginTop: 12 }}>
					Order ID: <strong>{success.id}</strong>
				</p>
				<div style={{ marginTop: 18 }} className="cart-footer-actions order-links">
					<button
						className="primary-btn"
						onClick={() => {
							navigate("/menu");
						}}
					>
						Continue shopping
					</button>
				</div>
			</section>
		);
	}

	return (                 //form to review order and enter delivery details.
		<section className="content-section">
			<h2 className="section-title">Checkout</h2>
			<p className="section-subtitle">Review your order and enter delivery details.</p>

			{!userState.username && (
				<div style={{ marginTop: 12 }}>
					<CreateUser buttonLabel="Save name for this order" placeholder="Enter your name for order" onCreated={() => setName(userState.username)} />
				</div>
			)}

			<div style={{ marginTop: 14, display: "grid", gap: 10 }}>
				<label>
					Name
					<input value={name} onChange={(e) => setName(e.target.value)} className="order-search-input" />
				</label>

				<label>
					Address
					<div style={{ display: "flex", gap: 8 }}>
						<input value={address} onChange={(e) => setAddress(e.target.value)} className="order-search-input" />
						<button type="button" onClick={tryAutofillAddress} className="secondary-btn">
							Autofill
						</button>
					</div>
				</label>

				<label>
					Phone (optional)
					<input value={phone} onChange={(e) => setPhone(e.target.value)} className="order-search-input" />
				</label>

				<label>
					Notes
					<input value={notes} onChange={(e) => setNotes(e.target.value)} className="order-search-input" />
				</label>
			</div>

			<div style={{ marginTop: 18 }}>
				<h3 className="menu-item-title">Your items</h3>
				<ul className="cart-list">
					{cartState.cart.map((it) => (
						<li key={it.id} className="cart-row">
							<div>
								<div style={{ fontWeight: 800 }}>{it.name}</div>
								<div style={{ color: "var(--text-muted)" }}>{it.quantity} × ${it.price}</div>
							</div>
							<div style={{ fontWeight: 800 }}>${it.price * it.quantity}</div>
						</li>
					))}
				</ul>

				<div className="cart-total" style={{ marginTop: 12 }}>
					<div>
						<div className="cart-footer-label">Total</div>
						<div className="cart-footer-amount">${total}</div>
					</div>
					<div className="cart-footer-actions">
						<button onClick={handlePlaceOrder} disabled={loading} className="primary-btn">
							{loading ? "Placing order..." : "Place order"}
						</button>
						<button onClick={() => navigate("/cart")} className="ghost-btn">
							Back to cart
						</button>
					</div>
				</div>
				{error && <p style={{ color: "#a33", marginTop: 8 }}>{error}</p>}
			</div>
		</section>
	);
}
