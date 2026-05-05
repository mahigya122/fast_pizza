import { useSelector } from "react-redux";                               //useSelector → read data from Redux store

type UsernameProps = {
	className?: string;
	prefix?: string;
};

export default function Username({ 
	className = "user-chip", 
	prefix = "👤" 
}: UsernameProps) {
	const username = useSelector((state: any) => state.user.username);

	if (!username) return null;

	return (
		<span className={className}>
			{prefix ? `${prefix} ${username}` : username}
		</span>
	);
}
