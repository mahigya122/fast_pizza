import { useApp } from "../../store.tsx";
import type { CartItem } from "../../types.ts";
import Deleteltem from "./Deleteltem";

type UpdateItemQuantityProps = {
	item: CartItem;
};

export default function UpdateItemQuantity({ item }: UpdateItemQuantityProps) {
	const { dispatch } = useApp();

	return (
		<div className="qty-controls">
			<button
				onClick={() => dispatch({ type: "cart/decreaseQty", payload: item.id })}
				className="qty-btn"
			>
				-
			</button>
			<span className="qty-value">{item.quantity}</span>
			<button
				onClick={() => dispatch({ type: "cart/increaseQty", payload: item.id })}
				className="qty-btn"
			>
				+
			</button>
			<Deleteltem id={item.id} />
		</div>
	);
}
