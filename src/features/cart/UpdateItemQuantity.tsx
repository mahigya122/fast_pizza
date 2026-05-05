import { useDispatch } from "react-redux";
import { increaseQty, decreaseQty } from "../../redux/cartSlice";
import type { CartItem } from "../../types.ts";
import Deleteltem from "./Deleteltem";

type UpdateItemQuantityProps = {
	item: CartItem;
};

export default function UpdateItemQuantity({ item }: UpdateItemQuantityProps) {
	const dispatch = useDispatch();

	return (
		<div className="qty-controls">
			<button
				onClick={() => dispatch(decreaseQty(item.id))}
				className="qty-btn"
			>
				-
			</button>
			<span className="qty-value">{item.quantity}</span>
			<button
				onClick={() => dispatch(increaseQty(item.id))}
				className="qty-btn"
			>
				+
			</button>
			<Deleteltem id={item.id} />
		</div>
	);
}
