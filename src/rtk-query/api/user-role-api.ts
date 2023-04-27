import { emptySplitApi as api } from "./emptyApi";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({}),
  overrideExisting: false,
});
export { injectedRtkApi as enhancedApi };
export const {} = injectedRtkApi;
