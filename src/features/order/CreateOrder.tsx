import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useCart } from "../../context/CartContext";
import CreateUser from "../user/CreateUser";
import { createOrder } from "../../services/apiRestaurant";
import { saveOrder } from "../../services/orderStorage";
// apiGeocoding is a small JS helper; suppress implicit any for now
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getUserAddress } from "../../services/apiGeocoding.js";

export default function CreateOrder() {
	const navigate = useNavigate();                    // useNavigate → used to redirect to another page (e.g., after order is placed, you might want to navigate to order confirmation page or back to menu)
	const { state: userState, dispatch: userDispatch } = useUser();                     //userState.username → stored name and userDispatch → update username globally
	const { state: cartState, dispatch: cartDispatch } = useCart();                     //cartState.cart → all pizzas user selected and cartDispatch → clear cart after order

    //this are form input
	const [name, setName] = useState(userState.username || "");          //name is prefilled from global user state, but can be edited here. setName → updates name state when user types in the input field.
	const [address, setAddress] = useState("");                                
	const [phone, setPhone] = useState("");
	const [notes, setNotes] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState<null | { id: string }>(null);
	const [error, setError] = useState<string | null>(null);

	// autofill address using browser geolocation.
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

	const total = cartState.cart.reduce((sum, item) => {
		const unitPrice = Number(item.price) || 0;
		const quantity = Number(item.quantity) || 0;
		return sum + unitPrice * quantity;
	}, 0);     // calculate total price from cart items (quantity × price for each item, then sum it all up)

	async function handlePlaceOrder() {
		setError(null);
		if (!name.trim()) return setError("Please provide your name.");
		if (!address.trim()) return setError("Please provide delivery address.");
		if (cartState.cart.length === 0) return setError("Your cart is empty.");
		if (!Number.isFinite(total) || total <= 0) return setError("Cart total is invalid. Please remove and re-add your items.");

		const normalizedCart = cartState.cart.map((item) => {                 //This transforms the cart items into a consistent format expected by the backend API. It ensures that each item has a valid pizzaId, name, quantity, price, and totalPrice. This step is important for data integrity and to prevent issues when the order is processed on the server.
			const pizzaId = Number(item.id);
			const quantity = Number(item.quantity);
			const unitPrice = Number(item.price);
			const totalPrice = quantity * unitPrice;

			return {
				pizzaId,
				id: pizzaId,
				name: item.name,
				pizzaName: item.name,
				quantity,
				price: unitPrice,
				unitPrice,
				totalPrice,
			};
		});

		const hasInvalidItem = normalizedCart.some(                         // validate each cart item to ensure it has valid pizzaId, name, quantity, price, and totalPrice. If any item is invalid, we set an error message and prevent the order from being placed.
			(item) =>
				!item.pizzaId ||
				!item.name.trim() ||
				!Number.isFinite(item.quantity) ||
				item.quantity <= 0 ||
				!Number.isFinite(item.price) ||
				item.price <= 0 ||
				!Number.isFinite(item.totalPrice)
		);
		if (hasInvalidItem) return setError("One or more cart items are invalid. Please remove and re-add them.");

		const payload = {
			customer: name.trim(),
			address: address.trim(),
			phone: phone.trim(),
			notes: notes.trim(),
			orderPrice: total,
			totalPrice: total,
			cart: normalizedCart,
		} as const;

		try {
			setLoading(true);                                                     // ui shows "Placing order..." while this is running
			const created = await createOrder(payload);                                    //This is the API call: sends cart + user data to server and waits for the response. If successful, the server will create a new order and return its details (like order ID).
			// created usually contains order id or details
			const id = (created && (created as any).id) || (created && (created as any)._id) || String(Date.now());         // this insure that order always has an ID so it use 3 different ways: created.id → normal API format, created._id → MongoDB style, fallback → Date.now() (backup ID)
			saveOrder({
				id: String(id),
				customer: name.trim(),
				address: address.trim(),
				phone: phone.trim(),
				notes: notes.trim(),
				orderPrice: total,
				totalPrice: total,
				cart: normalizedCart,
				createdAt: new Date().toISOString(),
				estimatedDeliveryAt: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
			});
			// clear cart and persist username
			cartDispatch({ type: "cart/clear" });                                               //empties cart after order is placed
			userDispatch({ type: "user/setUsername", payload: name.trim() });                     //username persists across pages and future orders, so we save it in global user state
			setSuccess({ id });                                                          //this triggers the success UI that show order conformation and order ID.
			navigate(`/order/${id}`);
		} catch (err: unknown) {
			setError((err as Error)?.message || String(err));
		} finally {
			setLoading(false);
		}
	}

	if (success) {            // when order is placed successfully, show confirmation message with order ID and a button to continue shopping (navigate back to menu)
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
					Phone
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
