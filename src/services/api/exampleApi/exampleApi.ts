import instanceApi from "../instance.api";

const getData = async () => {
	return await instanceApi.get("/example");
};

export const exampleApi = { getData };
