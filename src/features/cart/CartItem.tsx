import UpdateItemQuantity from "./UpdateItemQuantity";
import type { CartItem as CartItemType } from "../../types.ts";

type CartItemProps = {
	item: CartItemType;
};

export default function CartItem({ item }: CartItemProps) {
	return (
		<li className="cart-row">
			<div>
				<p className="menu-item-title">
					{item.quantity}x {item.name}
				</p>
				<p className="menu-item-meta">${item.price * item.quantity}</p>
			</div>
			<UpdateItemQuantity item={item} />
		</li>
	);
}
