import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useCart } from "../../context/CartContext";
import CreateUser from "../user/CreateUser";
import { createOrder } from "../../services/apiRestaurant";
import { saveOrder } from "../../services/orderStorage";
// Using React Hook Form + zod for validation
// Install if missing: `npm install react-hook-form zod @hookform/resolvers`
import { useForm } from "react-hook-form";
import { z } from "zod";
// apiGeocoding is a small JS helper; suppress implicit any for now
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getUserAddress } from "../../services/apiGeocoding.js";

export default function CreateOrder() {
	const navigate = useNavigate();                    // useNavigate → used to redirect to another page (e.g., after order is placed, you might want to navigate to order confirmation page or back to menu)
	const { state: userState, dispatch: userDispatch } = useUser();                     //userState.username → stored name and userDispatch → update username globally
	const { state: cartState, dispatch: cartDispatch } = useCart();                     //cartState.cart → all pizzas user selected and cartDispatch → clear cart after order

	// Form inputs are now managed by React Hook Form with zod validation.
	// This replaces the previous useState-based fields so validation is unified and simpler.

	const orderSchema = z.object({
		// customer: Required field. Must have at least 1 character (after trimming)
		customer: z.string().trim().min(1, "❌ Please fill in your name."),
		// address: Required field. Must have at least 1 character (after trimming)
		address: z.string().trim().min(1, "❌ Please fill in delivery address."),
		// phone: Required field. Must be digits only (0-9)
		phone: z.string()
			.trim()
			.min(1, "❌ Please fill in your phone number.")
			.refine(
				/^\d+$/.test.bind(/^\d+$/),
				"❌ Phone must contain only numbers (0-9). Please use correct format."
			),
		// notes: Optional field
		notes: z.string().optional(),
	});

	type OrderFormValues = z.infer<typeof orderSchema>;

	const { register, handleSubmit, reset, getValues, formState: { errors }, setError } = useForm<OrderFormValues>({
		// Removed resolver to handle validation manually in the submit handler
		// This ensures handlePlaceOrder is always called, allowing us to display field-level errors
		mode: "onSubmit",
		reValidateMode: "onSubmit",
		defaultValues: {
			customer: userState.username || "",
			address: "",
			phone: "",
			notes: "",
		},
	});
	const [loading, setLoading] = useState(false);
	const [autofillLoading, setAutofillLoading] = useState(false);
	const [success, setSuccess] = useState<null | { id: string }>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	// Helper function to display error messages
	const getErrorMessage = (fieldName: keyof OrderFormValues): string | null => {
		const error = errors[fieldName];
		if (!error) return null;
		
		// Handle different error structures
		if (typeof error === 'object' && 'message' in error) {
			return String(error.message);
		}
		if (typeof error === 'string') {
			return error;
		}
		return null;
	};
	async function tryAutofillAddress() {
		try {
			setAutofillLoading(true);
			const result = await getUserAddress();
			// preserve other form values while updating address
			const current = getValues();
			reset({ ...current, address: String(result.address ?? "") });
		} catch (err: unknown) {
			// ignore silently — user can type address manually
		} finally {
			setAutofillLoading(false);
		}
	}

	const total = cartState.cart.reduce((sum, item) => {
		const unitPrice = Number(item.price) || 0;
		const quantity = Number(item.quantity) || 0;
		return sum + unitPrice * quantity;
	}, 0);     // calculate total price from cart items (quantity × price for each item, then sum it all up)

	// handlePlaceOrder now receives form values and handles validation manually
	async function handlePlaceOrder(values: OrderFormValues) {
		setErrorMsg(null);
		
		// Manually validate with Zod to catch and display errors
		const validationResult = orderSchema.safeParse(values);
		if (!validationResult.success) {
			// Set field-level errors so they display in the form
			validationResult.error.issues.forEach((err: any) => {
				const fieldName = err.path[0] as keyof OrderFormValues;
				setError(fieldName, {
					type: "manual",
					message: err.message
				});
			});
			return;
		}
		
		// cart-level guards
		if (cartState.cart.length === 0) return setErrorMsg("Your cart is empty.");
		if (!Number.isFinite(total) || total <= 0) return setErrorMsg("Cart total is invalid. Please remove and re-add your items.");

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
		if (hasInvalidItem) return setErrorMsg("One or more cart items are invalid. Please remove and re-add them.");

		const payload = {
			customer: values.customer.trim(),
			address: values.address.trim(),
			phone: values.phone?.trim() ?? "",
			notes: values.notes?.trim() ?? "",
			orderPrice: total,
			totalPrice: total,
			cart: normalizedCart,
		} as const;

		try {
			setLoading(true);                                                     // ui shows "Placing order..." while this is running
			const created = await createOrder(payload);                                    //This is the API call: sends cart + user data to server and waits for the response. If successful, the server will create a new order and return its details (like order ID).
			// created usually contains order id or details
			const id = (created && (created as any).id) || (created && (created as any)._id) || String(Date.now());
			// persist order locally for lookup later
			saveOrder({
				id: String(id),
				customer: values.customer.trim(),
				address: values.address.trim(),
				phone: values.phone?.trim() ?? "",
				notes: values.notes?.trim() ?? "",
				orderPrice: total,
				totalPrice: total,
				cart: normalizedCart,
				createdAt: new Date().toISOString(),
				estimatedDeliveryAt: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
			});
			// clear cart and persist username
			cartDispatch({ type: "cart/clear" });                                               //empties cart after order is placed
			userDispatch({ type: "user/setUsername", payload: values.customer.trim() });
			// reset form so inputs reflect saved username where appropriate
			reset({ customer: values.customer.trim(), address: "", phone: "", notes: "" });
			setSuccess({ id });                                                          //this triggers the success UI that show order conformation and order ID.
			navigate(`/order/${id}`);
		} catch (err: unknown) {
			setErrorMsg((err as Error)?.message || String(err));
		} finally {
			setLoading(false);
		}
	}

	if (success) {            // when order is placed successfully, show confirmation message with order ID and a button to continue shopping (navigate back to menu)
		return (
			<section className="content-section">
				<div style={{ textAlign: "center", paddingTop: 20, paddingBottom: 20 }}>
					<div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
					<h2 className="section-title">Order Placed!</h2>
					<p className="section-subtitle" style={{ marginTop: 12 }}>Thank you for your order. Your pizza is being prepared and will arrive soon.</p>
					
					{/* Order ID Card */}
					<div style={{
						marginTop: 24,
						padding: 20,
						background: "linear-gradient(135deg, rgba(31, 111, 120, 0.08), rgba(240, 163, 74, 0.06))",
						border: "1px solid var(--border)",
						borderRadius: 14
					}}>
						<p style={{ margin: "0 0 8px", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em" }}>Your Order ID</p>
						<p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800, color: "var(--accent)", fontFamily: "monospace" }}>{success.id}</p>
						<p style={{ margin: "12px 0 0", fontSize: "0.9rem", color: "var(--text-muted)" }}>Save this ID to track your order</p>
					</div>

					<div style={{ marginTop: 28 }} className="cart-footer-actions order-links" style={{ justifyContent: "center" }}>
						<button
							className="primary-btn"
							onClick={() => navigate("/menu")}
						>
							🍕 Continue Shopping
						</button>
						<button
							className="secondary-btn"
							onClick={() => navigate(`/order/${success.id}`)}
						>
							Track Order
						</button>
					</div>
				</div>
			</section>
		);
	}

	return (                 //form to review order and enter delivery details.
		<section className="content-section">
			<h2 className="section-title">🛒 Checkout</h2>
			<p className="section-subtitle">Review your order and enter your delivery details below.</p>

			<form onSubmit={handleSubmit(handlePlaceOrder)} style={{ marginTop: 20, display: "grid", gap: 24 }}>
				{/* Delivery Information Section */}
				<div style={{
					border: "1px solid var(--border)",
					borderRadius: 14,
					padding: 20,
					background: "linear-gradient(135deg, rgba(240, 163, 74, 0.08), rgba(31, 111, 120, 0.04))"
				}}>
					<h3 className="menu-item-title" style={{ marginTop: 0, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>👤 Your Information</h3>

					{/* Name Field */}
					{!userState.username && (
						<div style={{ marginBottom: 18 }}>
							<CreateUser buttonLabel="Save name for this order" placeholder="Enter your name for order" onCreated={() => reset({ ...getValues(), customer: userState.username || "" })} />
						</div>
					)}

					<div style={{ marginBottom: 16 }}>
						<label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: "0.95rem" }}>
							Full Name <span style={{ color: "#d06c2f" }}>*</span>
						</label>
						<input 
							{...register("customer")} 
							className="order-search-input" 
							placeholder="Enter your full name"
							style={{
								width: "100%",
								padding: "12px 14px",
								fontSize: "1rem",
								border: getErrorMessage("customer") ? "2px solid #d06c2f" : "1px solid var(--border)",
								borderRadius: 10,
								background: "var(--surface)"
							}}
						/>
						{getErrorMessage("customer") && (
							<p style={{ color: "#d06c2f", marginTop: 8, fontWeight: 600, fontSize: "0.9rem" }}>
								{getErrorMessage("customer")}
							</p>
						)}
					</div>

					{/* Address Field */}
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: "0.95rem" }}>
							Delivery Address <span style={{ color: "#d06c2f" }}>*</span>
						</label>
						<div style={{ display: "flex", gap: 10 }}>
							<input 
								{...register("address")} 
								className="order-search-input" 
								placeholder="Enter delivery address"
								style={{
									flex: 1,
									padding: "12px 14px",
									fontSize: "1rem",
									border: getErrorMessage("address") ? "2px solid #d06c2f" : "1px solid var(--border)",
									borderRadius: 10,
									background: "var(--surface)"
								}}
							/>
							<button 
								type="button" 
								onClick={tryAutofillAddress} 
								disabled={autofillLoading} 
								className="secondary-btn"
								style={{ whiteSpace: "nowrap" }}
							>
								{autofillLoading ? "📍 Loading..." : "📍 Autofill"}
							</button>
						</div>
						{getErrorMessage("address") && (
							<p style={{ color: "#d06c2f", marginTop: 8, fontWeight: 600, fontSize: "0.9rem" }}>
								{getErrorMessage("address")}
							</p>
						)}
					</div>

					{/* Phone Field */}
					<div style={{ marginBottom: 12 }}>
						<label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: "0.95rem" }}>
							Phone Number <span style={{ color: "#d06c2f" }}>*</span>
						</label>
						<input 
							{...register("phone")} 
							className="order-search-input" 
							placeholder="Enter phone number (digits only)"
							style={{
								width: "100%",
								padding: "12px 14px",
								fontSize: "1rem",
								border: getErrorMessage("phone") ? "2px solid #d06c2f" : "1px solid var(--border)",
								borderRadius: 10,
								background: "var(--surface)"
							}}
						/>
						{getErrorMessage("phone") && (
							<p style={{ color: "#d06c2f", marginTop: 8, fontWeight: 600, fontSize: "0.9rem" }}>
								{getErrorMessage("phone")}
							</p>
						)}
					</div>

					{/* Notes Field */}
					<div>
						<label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: "0.95rem" }}>
							Delivery Notes <span style={{ color: "var(--text-muted)" }}>(optional)</span>
						</label>
						<textarea 
							{...register("notes")} 
							className="order-search-input"
							placeholder="Any special instructions? (e.g., Extra cheese, no onions, etc.)"
							style={{
								width: "100%",
								padding: "12px 14px",
								fontSize: "1rem",
								border: "1px solid var(--border)",
								borderRadius: 10,
								background: "var(--surface)",
								fontFamily: "inherit",
								minHeight: "80px",
								resize: "vertical"
							}}
						/>
					</div>
				</div>

				{/* Order Review Section */}
				<div style={{
					border: "1px solid var(--border)",
					borderRadius: 14,
					padding: 20,
					background: "var(--surface)"
				}}>
					<h3 className="menu-item-title" style={{ marginTop: 0, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>🍕 Order Summary</h3>
					<ul className="cart-list">
						{cartState.cart.map((it) => (
							<li key={it.id} className="cart-row" style={{ background: "linear-gradient(180deg, var(--surface), var(--surface-tint))" }}>
								<div>
									<div style={{ fontWeight: 800, fontSize: "1.02rem" }}>{it.name}</div>
									<div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 4 }}>{it.quantity} × ${it.price.toFixed(2)}</div>
								</div>
								<div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--primary-strong)" }}>${(it.price * it.quantity).toFixed(2)}</div>
							</li>
						))}
					</ul>

					{/* Total */}
					<div className="cart-total" style={{ marginTop: 16, paddingTop: 16, borderTop: "2px solid var(--border)" }}>
						<div>
							<div className="cart-footer-label">Total Amount</div>
							<div className="cart-footer-amount" style={{ fontSize: "1.4rem", color: "var(--primary-strong)" }}>${total.toFixed(2)}</div>
						</div>
					</div>
				</div>

				{/* Error Message Display */}
				{errorMsg && (
					<div style={{
						padding: 16,
						background: "#fee2e2",
						border: "1px solid #fca5a5",
						borderRadius: 10,
						color: "#991b1b",
						fontWeight: 600,
						fontSize: "0.95rem"
					}}>
						⚠️ {errorMsg}
					</div>
				)}

				{/* Action Buttons */}
				<div className="cart-footer-actions" style={{ gap: 12, justifyContent: "space-between" }}>
					<button 
						type="button"
						onClick={() => navigate("/cart")} 
						className="ghost-btn"
					>
						← Back to Cart
					</button>
					<button 
						type="submit" 
						disabled={loading || cartState.cart.length === 0} 
						className="primary-btn"
						style={{
							minWidth: 200,
							opacity: loading || cartState.cart.length === 0 ? 0.6 : 1,
							cursor: loading || cartState.cart.length === 0 ? "not-allowed" : "pointer"
						}}
					>
						{loading ? "⏳ Placing Order..." : "✓ Place Order"}
					</button>
				</div>
			</form>
		</section>
	);
}
