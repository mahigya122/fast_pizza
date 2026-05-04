import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type LinkButtonProps = {
	to: string;
	className?: string;
	children: ReactNode;
};

export default function LinkButton({ to, className = "secondary-btn", children }: LinkButtonProps) {
	return (
		<Link to={to} className={className}>
			{children}
		</Link>
	);
}
