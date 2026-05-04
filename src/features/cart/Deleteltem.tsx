import { useCart } from "../../context/CartContext";                                   //Gives access to state and dispatch function to update state

type DeleteItemProps = {                                        //This component expects: an id of the cart item to delete
	id: number;
};

export default function Deleteltem({ id }: DeleteItemProps) {                   //Receives id directly via props
	const { dispatch } = useCart();                                          //Used to send actions to reducer

	return (
		<button
			onClick={() => dispatch({ type: "cart/delete", payload: id })}                          //When clicked: Sends action: type: "cart/delete",payload: id, when Reducer receives it, it will Removes item with matching id from cart
			className="delete-btn"
		>
			Delete
		</button>
	);
}
