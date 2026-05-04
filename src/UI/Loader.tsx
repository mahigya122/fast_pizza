type LoaderProps = {
	label?: string;
};

export default function Loader({ label = "Loading..." }: LoaderProps) {
	return (
		<div className="loader-wrap" role="status" aria-live="polite">
			<span className="loader-dot" />
			<span className="loader-text">{label}</span>
		</div>
	);
}
