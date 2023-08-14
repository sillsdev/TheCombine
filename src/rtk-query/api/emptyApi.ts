import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { RuntimeConfig } from "types/runtimeConfig";

const baseUrl = RuntimeConfig.getInstance().baseUrl();

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptySplitApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  endpoints: () => ({}),
});
