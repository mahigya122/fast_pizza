import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setUsername } from "../../redux/userSlice";                // setUsername → action creator to update username in Redux state                  

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

	const dispatch = useDispatch();                                   //dispatch → send action to update username
	const navigate = useNavigate();                                              //navigate → used to redirect to another page

	function handleCreateUser() {
		if (!name.trim()) return;

		// save username in Redux
		dispatch(setUsername(name.trim()));

		// optional callback (still supported)
		onCreated?.();

		// navigation happens here
		navigate("/menu");
	}

	return (
		<div className="hero-form">
			<input
				type="text"
				placeholder={placeholder}
				value={name}
				onChange={(e) => setName(e.target.value)}                        //value → comes from state, onChange → updates state when user types
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
