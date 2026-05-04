import { useApp } from "../../store.tsx";

type UsernameProps = {
	className?: string;
	prefix?: string;
};

export default function Username({ className = "user-chip", prefix = "👤" }: UsernameProps) {
	const { state } = useApp();
	const username = state.user.username;

	if (!username) return null;

	return (
		<span className={className}>
			{prefix ? `${prefix} ${username}` : username}
		</span>
	);
}
