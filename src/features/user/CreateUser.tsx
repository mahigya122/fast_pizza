import { useState } from "react";
import { useUser } from "../../context/UserContext";                         //useUser → access user state and dispatch

type CreateUserProps = {
	buttonLabel?: string;
	placeholder?: string;
	onCreated?: () => void;
};

export default function CreateUser({
	buttonLabel = "Start Ordering",
	placeholder = "Enter your name",
	onCreated,
}: CreateUserProps) {
	const [name, setName] = useState("");
	const { dispatch } = useUser();                                   //dispatch → send action to update username

	function handleCreateUser() {
		if (!name.trim()) return;

		dispatch({
			type: "user/setUsername",
			payload: name.trim(),
		});

		onCreated?.();
	}

	return (
		<div className="hero-form">
			<input
				type="text"
				placeholder={placeholder}
				value={name}
				onChange={(e) => setName(e.target.value)}
				className="hero-input"
			/>

			{name && (
				<button onClick={handleCreateUser} className="primary-btn">
					{buttonLabel}
				</button>
			)}
		</div>
	);
}
