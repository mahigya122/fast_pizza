import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";

import { createOrder } from "../../services/apiRestaurant";
import { saveOrder } from "../../services/orderStorage";
// @ts-ignore
import { getUserAddress } from "../../services/apiGeocoding.js";

import CreateUser from "../user/CreateUser";

import { clearCart } from "../../redux/cartSlice.js";
import { setUsername } from "../../redux/userSlice.js";

// react-hook-form + zod
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function CreateOrder() {
	const navigate = useNavigate();   
	const dispatch = useDispatch();
	
	//redux state
	const username = useSelector((state: RootState) => state.user.name);                                            // useSelector → helper to read username from Redux state. This allows us to pre-fill the name field in the order form 
	const cart = useSelector((state: RootState) => state.cart.cart);                                                   // useSelector → helper to read cart items from Redux state. This allows us to display the order summary and calculate total price in the checkout page.

	// Validation schema
	const orderSchema = z.object({
		customer: z.string().trim().min(1, "❌ Please fill in your name."),                                       // customer: Required field. Must have at least 1 character (after trimming)
		address: z.string().trim().min(1, "❌ Please fill in delivery address."),                                  // address: Required field. Must have at least 1 character (after trimming)
		phone: z.string()                                                                                     
			.trim()
			.min(1, "❌ Please fill in your phone number.")
			.refine(
				(val) => /^[0-9()\-\s]+$/.test(val),
				"❌ Phone must contain only numbers (0-9). Please use correct format."
			),
		// notes: Optional field
		notes: z.string().optional(),
	});

	type OrderFormValues = z.infer<typeof orderSchema>;

	const { register, handleSubmit, reset, getValues, formState: { errors }, setError 
          } = useForm<OrderFormValues>({
		
		mode: "onSubmit",
		reValidateMode: "onSubmit",
		defaultValues: {
			customer: username || "",
			address: "",
			phone: "",
			notes: "",
		},
	});
	const [loading, setLoading] = useState(false);
	const [autofillLoading, setAutofillLoading] = useState(false);
	const [success, setSuccess] = useState<null | { id: string }>(null);                        // success state to show order confirmation after placing order successfully
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	// Style for the success message container - moved to top to prevent "used before declaration" errors
	const styles = {
		card: {
			marginTop: 24,
			padding: 20,
			borderRadius: 14,
			border: "1px solid var(--border)",
			background:
				"linear-gradient(135deg, rgba(31, 111, 120, 0.08), rgba(240, 163, 74, 0.06))",
		},

		label: {
			margin: "0 0 8px",
			fontSize: "0.75rem",
			color: "var(--text-muted)",
			textTransform: "uppercase" as const,
			fontWeight: 700,
			letterSpacing: "0.1em",
		},

		orderId: {
			margin: 0,
			fontSize: "1.8rem",
			fontWeight: 800,
			color: "var(--accent)",
			fontFamily: "monospace",
		},

		hint: {
			marginTop: 12,
			fontSize: "0.9rem",
			color: "var(--text-muted)",
		},

		actions: {
			marginTop: 28,
			justifyContent: "center",
		},
	} as const;

	const total = cart.reduce((sum, item) => {                                                 // calculate total price from cart items (quantity × price for each item, then sum it all up)
		return sum + Number(item.price) * Number(item.quantity);
	}, 0);

	async function tryAutofillAddress() {
		try {
			setAutofillLoading(true);
			const result = await getUserAddress();
			// preserve other form values while updating address
			const current = getValues();
			reset({ ...current, address: String(result.address ?? "") });
		} finally {
			setAutofillLoading(false);
		}
	}

	// handlePlaceOrder now receives form values and handles validation manually
	async function handlePlaceOrder(values: OrderFormValues) {
		setErrorMsg(null);
		
		// Manually validate with Zod to catch and display errors
	const validation = orderSchema.safeParse(values);
	if (!validation.success) {
			// Set field-level errors so they display in the form
		validation.error.issues.forEach((err: any) => {
				const field = err.path[0] as keyof OrderFormValues;
				setError(field, {
					type: "manual",
					message: err.message
				});
			});
			return;
		}
		
		// cart-level guards
		if (cart.length === 0) return setErrorMsg("Your cart is empty.");
		if (!Number.isFinite(total) || total <= 0) 
			return setErrorMsg("Cart total is invalid. Please remove and re-add your items.");

		const normalizedCart = cart.map((item: any) => ({
			pizzaId: Number(item.id),
			id: Number(item.id), 
			name: item.name,
			pizzaName: item.name,
			quantity: Number(item.quantity),
			price: Number(item.price), 
			unitPrice: Number(item.price),
			totalPrice: Number(item.price) * Number(item.quantity),
		}));

		const payload = {
			customer: values.customer.trim(),
			address: values.address.trim(),
			phone: values.phone.trim(),
			notes: values.notes?.trim() ?? "",
			orderPrice: total,
			totalPrice: total,
			cart: normalizedCart,
		};

		try {
			setLoading(true);                                                     // ui shows "Placing order..." while this is running

			const created = await createOrder(payload);                                    //This is the API call: sends cart + user data to server and waits for the response. If successful, the server will create a new order and return its details (like order ID).
			
			const id = (created as any)?.id;                        // we expect the server to return the new order's ID in the response. We extract it here to use for local storage and navigation.
			// persist order locally for lookup later
			saveOrder({
				id: String(id),
				customer: values.customer.trim(),
				address: values.address.trim(),
				phone: values.phone.trim(),
				notes: values.notes?.trim() ?? "",
				orderPrice: total,
				totalPrice: total,
				cart: normalizedCart,
				createdAt: new Date().toISOString(),
				estimatedDeliveryAt: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
			});

			// clear cart and persist username
			dispatch(clearCart()); 
			dispatch(setUsername(values.customer.trim()));                                                 
			
			reset({ 
				customer: values.customer.trim(), 
				address: "", 
				phone: "", 
				notes: "" 
			});

			setSuccess({ id });                                                          //this triggers the success UI that show order conformation and order ID.
			navigate(`/order/${id}`);
		} catch (err: any) {
			setErrorMsg((err.message || String(err)));
		} finally {
			setLoading(false);
		}
	}

	if (success) {            // when order is placed successfully.
		return (
			<section className="content-section">
				<div style={{ textAlign: "center", paddingTop: 20, paddingBottom: 20 }}>
					{/* Success Icon */}
					<div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
					{/* Title */}
					<h2 className="section-title">Order Placed!</h2>
						{/* Subtitle */}
					<p className="section-subtitle" style={{ marginTop: 12 }}>Thank you for your order. Your pizza is being prepared and will arrive soon.</p>
					
					{/* Order ID Card */}
					<div style={styles.card}>
					<p style={styles.label}>Your Order ID</p>
					<p style={styles.orderId}>{success.id}</p>
					<p style={styles.hint}>Save this ID to track your order</p>
				</div>
						{/* Actions */}
				<div className="cart-footer-actions order-links" style={styles.actions}>
					<button
						className="primary-btn"
						onClick={() => navigate("/menu", { replace: true })}
					>
						🍕 Continue Shopping
					</button>

					<button
						className="secondary-btn"
						onClick={() => navigate(`/order/${success.id}`)}
					>
						📦 Track Order
					</button>
				</div>
			</div>
		</section>
	);
}

//form to review order and enter delivery details.
return (                 
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
				{!username && (
					<div style={{ marginBottom: 18 }}>
						<CreateUser buttonLabel="Save name for this order" placeholder="Enter your name for order" onCreated={() => reset({ ...getValues(), customer: username || "" })} />
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
								border: errors.customer ? "2px solid #d06c2f" : "1px solid var(--border)",
								borderRadius: 10,
								background: "var(--surface)"
							}}
						/>
						{errors.customer && (
							<p style={{ color: "#d06c2f", marginTop: 8, fontWeight: 600, fontSize: "0.9rem" }}>
								{errors.customer.message}
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
									border: errors.address ? "2px solid #d06c2f" : "1px solid var(--border)",
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
						{errors.address && (
							<p style={{ color: "#d06c2f", marginTop: 8, fontWeight: 600, fontSize: "0.9rem" }}>
								{errors.address.message}
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
								border: errors.phone ? "2px solid #d06c2f" : "1px solid var(--border)",
								borderRadius: 10,
								background: "var(--surface)"
							}}
						/>
						{errors.phone && (
							<p style={{ color: "#d06c2f", marginTop: 8, fontWeight: 600, fontSize: "0.9rem" }}>
								{errors.phone.message}
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
						{cart.map((it) => (
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
						disabled={loading || cart.length === 0} 
						className="primary-btn"
						style={{
							minWidth: 200,
							opacity: loading || cart.length === 0 ? 0.6 : 1,
							cursor: loading || cart.length === 0 ? "not-allowed" : "pointer"
						}}
					>
						{loading ? "⏳ Placing Order..." : "✓ Place Order"}
					</button>
				</div>
			</form>
		</section>
	);
}
