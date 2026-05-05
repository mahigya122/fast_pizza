import { Link } from "react-router-dom";                    //This is React Router’s navigation component (no page reload)
import type { ReactNode } from "react";

export type LinkButtonProps = {                          // cudtome type that defines the props that LinkButton component will accept. It has three properties: to, className, and children.
	to: string;
	className?: string;
	children: ReactNode;
	style?: React.CSSProperties;
};

export default function LinkButton({ to, className = "secondary-btn", children, style }: LinkButtonProps) {
	return (
		<Link to={to} className={className} style={style}>
			{children}
		</Link>
	);
}
