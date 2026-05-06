import { useDispatch } from "react-redux";
import { increaseQty, decreaseQty } from "../../redux/cartSlice";
import type { CartItem } from "../../types";
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
				disabled={item.quantity <= 1}                          //This disables the "−" button when quantity is 1 or less, preventing the quantity from going to 0 or negative. The user would have to click "Delete" to remove the item instead.
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
