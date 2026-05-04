import { Link, useRouteError } from "react-router-dom";                          //useRouteError() → gets the error that occurred during routing, Link → lets user navigate back safely (no page reload)

type RouteError = {
	message?: string;                                           //message → custom error message
	statusText?: string;                                        //statusText → HTTP-like message (e.g. “Not Found”)
};

export default function Error() {
	const error = useRouteError() as RouteError;                              //React Router gives you the error that happened, for example: API failed, wrong route (/abc), etc.

	return (
		<div className="error-card">
			<h2 className="section-title">Something went wrong</h2>
			<p className="section-subtitle">{error?.message ?? error?.statusText ?? "Unknown error"}</p>
			<Link to="/" className="primary-btn">
				Back to home
			</Link>
		</div>
	);
}
