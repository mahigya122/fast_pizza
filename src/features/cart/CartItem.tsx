import UpdateItemQuantity from "./UpdateItemQuantity";                                  //UpdateItemQuantity → handles + / − / delete actions
import type { CartItem as CartItemType } from "../../types";                      //CartItemType → TypeScript type for a cart item, import type means:only used for type checking and not included in final JS

type CartItemProps = {
	item: CartItemType;                                                   //This says: component must receive an item and it must match CartItemType
};

export default function CartItem({ item }: CartItemProps) {  
     const total = item.price * item.quantity;     

	return (
		<li className="cart-row">                                          {/*One row in cart list*/}
			<div>
				<p className="menu-item-title">
					{item.quantity}x {item.name}                               {/*2x Margherita*/}
				</p>
				<p className="menu-item-meta">${total.toFixed(2)}</p>                  
			</div>
			<UpdateItemQuantity item={item} />                                    {/*This component handles: increasing, decreasing, and deleting the item from the cart. It receives the entire item as a prop so it knows which item to update when buttons are clicked.*/}
		</li>
	);
}
