"use client";
import { AppConstant } from "@/core";
import Axios, { AxiosInstance } from "axios";

const instanceApi: AxiosInstance = Axios.create({
	baseURL: AppConstant.API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

instanceApi.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (!config.url?.includes("/auth") && token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

instanceApi.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		if (error.response && error.response.status === 401) {
			console.log("Token expired or unauthorized access");
		}
		return Promise.reject(error);
	}
);

export default instanceApi;
