import { useCart } from "../../context/CartContext";                                    //useCart → access global dispatch
import type { CartItem } from "../../types.ts";                                     //CartItem → TypeScript type for item
import Deleteltem from "./Deleteltem";                                      //Deleteltem → button to remove item completely

type UpdateItemQuantityProps = {                                               //This component expects a full cart item: id, name, price, quantity
	item: CartItem;
};

export default function UpdateItemQuantity({ item }: UpdateItemQuantityProps) {                  //Receives one cart item and controls it
	const { dispatch } = useCart();                                                               //Used to update global cart state

	return (
		<div className="qty-controls">                                   {/*minus button, quantity display, plus button, and delete button are all in this div*/}
			<button
				onClick={() => dispatch({ type: "cart/decrease", payload: item.id })}
				className="qty-btn"
			>
				-
			</button>
			<span className="qty-value">{item.quantity}</span>
			<button
				onClick={() => dispatch({ type: "cart/increase", payload: item.id })}
				className="qty-btn"
			>
				+
			</button>
			<Deleteltem id={item.id} />
		</div>
	);
}
