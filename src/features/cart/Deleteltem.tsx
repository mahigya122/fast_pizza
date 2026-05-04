import { useApp } from "../../store.tsx";

type DeleteItemProps = {
	id: number;
};

export default function Deleteltem({ id }: DeleteItemProps) {
	const { dispatch } = useApp();

	return (
		<button
			onClick={() => dispatch({ type: "cart/deleteItem", payload: id })}
			className="delete-btn"
		>
			Delete
		</button>
	);
}
