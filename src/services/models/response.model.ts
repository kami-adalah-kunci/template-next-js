import { AxiosError } from "axios";
import { GeneralApiProblem } from "../api/apiProblem";

type OptionKey = string | number;
type OptionValue =
	| string
	| Array<string>
	| number
	| Array<number>
	| boolean
	| Blob
	| OptionRecord;

export interface ErrorRecord {
	[key: string]: string[];
}

export interface OptionRecord {
	[key: OptionKey]: OptionValue;
}

// Base Response
export interface BaseResponse<T> {
	message: string;
	status: string | number;
	data: T;
}

// Error Base Response
export interface ErrorResponse extends AxiosError {
	response: AxiosError["response"] &
		// FIXME: use this for all error response
		GeneralApiProblem & {
			data: {
				message?: string;
				errors?: ErrorRecord;
				data: {
					errors?: ErrorRecord;
				};
			};
		};
}

export interface BaseServiceOptions<
	P extends OptionRecord = OptionRecord,
	Q extends OptionRecord = OptionRecord,
	B extends OptionRecord = OptionRecord
> {
	params?: P;
	query?: Q;
	body?: B;
}

export interface PaginationMetadata {
	totalPage: number;
	dataCount: number;
	dataPerPage: number;
	currentPage: number;
}

export type QueryPagination = {
	page?: number;
};
