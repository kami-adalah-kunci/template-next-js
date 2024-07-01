import { isInRange } from "@/utils";
import Axios, { AxiosError } from "axios";

export const CLIENT_ERROR = "CLIENT_ERROR";
export const SERVER_ERROR = "SERVER_ERROR";
export const TIMEOUT_ERROR = "TIMEOUT_ERROR";
export const CONNECTION_ERROR = "CONNECTION_ERROR";
export const NETWORK_ERROR = "NETWORK_ERROR";
export const UNKNOWN_ERROR = "UNKNOWN_ERROR";
export const CANCEL_ERROR = "CANCEL_ERROR";

const TIMEOUT_ERROR_CODES = ["ECONNABORTED"];
const NODEJS_CONNECTION_ERROR_CODES = [
	"ENOTFOUND",
	"ECONNREFUSED",
	"ECONNRESET",
];
const STATUS_ERROR_CODES = ["ERR_BAD_REQUEST", "ERR_BAD_RESPONSE"];
const in200s = (n: number): boolean => isInRange(200, 299, n);
const in400s = (n: number): boolean => isInRange(400, 499, n);
const in500s = (n: number): boolean => isInRange(500, 599, n);

export type GeneralApiProblem =
	/**
	 * Times up.
	 */
	| { kind: "timeout"; temporary: true }
	/**
	 * Cannot connect to the server for some reason.
	 */
	| { kind: "cannot-connect"; temporary: true }
	/**
	 * The server experienced a problem. Any 5xx error.
	 */
	| { kind: "server" }
	/**
	 * We're not allowed because we haven't identified ourself. This is 401.
	 */
	| { kind: "unauthorized" }
	/**
	 * We don't have access to perform that request. This is 403.
	 */
	| { kind: "forbidden" }
	/**
	 * Unable to find that resource.  This is a 404.
	 */
	| { kind: "not-found" }
	/**
	 * All other 4xx series errors.
	 */
	| { kind: "rejected" }
	/**
	 * Something truly unexpected happened. Most likely can try again. This is a catch all.
	 */
	| { kind: "unknown"; temporary: true }
	/**
	 * The data we received is not in the expected format.
	 */
	| { kind: "bad-data" };

/**
 * Attempts to get a common cause of problems from an api response.
 *
 * @param response The api response.
 */
export function getGeneralApiProblem(
	problem: string,
	status: number
): GeneralApiProblem | null {
	switch (problem) {
		case "CONNECTION_ERROR":
			return { kind: "cannot-connect", temporary: true };
		case "NETWORK_ERROR":
			return { kind: "cannot-connect", temporary: true };
		case "TIMEOUT_ERROR":
			return { kind: "timeout", temporary: true };
		case "SERVER_ERROR":
			return { kind: "server" };
		case "UNKNOWN_ERROR":
			return { kind: "unknown", temporary: true };
		case "CLIENT_ERROR":
			switch (status) {
				case 401:
					return { kind: "unauthorized" };
				case 403:
					return { kind: "forbidden" };
				case 404:
					return { kind: "not-found" };
				default:
					return { kind: "rejected" };
			}
		case "CANCEL_ERROR":
			return null;
	}

	return null;
}

/**
 * What's the problem for this axios response?
 */
export function getProblemFromError(error: AxiosError) {
	// first check if the error message is Network Error (set by axios at 0.12) on platforms other than NodeJS.
	if (error.message === "Network Error") return NETWORK_ERROR;
	if ("Cancel" in error && Axios.isCancel(error)) return CANCEL_ERROR;

	// then check the specific error code
	if (!error.code)
		return getProblemFromStatus(error.response ? error.response.status : null);
	if (STATUS_ERROR_CODES.includes(error.code))
		return getProblemFromStatus(error.response?.status);
	if (TIMEOUT_ERROR_CODES.includes(error.code)) return TIMEOUT_ERROR;
	if (NODEJS_CONNECTION_ERROR_CODES.includes(error.code))
		return CONNECTION_ERROR;
	return UNKNOWN_ERROR;
}

/**
 * Given a HTTP status code, return back the appropriate problem enum.
 */
export const getProblemFromStatus = (status?: number | null) => {
	if (!status) return UNKNOWN_ERROR;
	if (in200s(status)) return null;
	if (in400s(status)) return CLIENT_ERROR;
	if (in500s(status)) return SERVER_ERROR;
	return UNKNOWN_ERROR;
};
