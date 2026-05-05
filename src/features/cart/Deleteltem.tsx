import { useDispatch } from "react-redux";
import { deleteItem } from "../../redux/cartSlice";

type DeleteItemProps = {
	id: number;
};

export default function Deleteltem({ id }: DeleteItemProps) {
	const dispatch = useDispatch();

	return (
		<button
			onClick={() => dispatch(deleteItem(id))}
			className="delete-btn"
		>
			Delete
		</button>
	);
}
