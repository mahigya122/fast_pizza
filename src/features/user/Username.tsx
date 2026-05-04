import { useUser } from "../../context/UserContext";                                //useUser → access user state to display username

type UsernameProps = {
	className?: string;
	prefix?: string;
};

export default function Username({ className = "user-chip", prefix = "👤" }: UsernameProps) {
	const { state } = useUser();
	const username = state.username;

	if (!username) return null;

	return (
		<span className={className}>
			{prefix ? `${prefix} ${username}` : username}
		</span>
	);
}
