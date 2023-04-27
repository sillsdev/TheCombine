import { emptySplitApi as api } from "./emptyApi";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBanner: build.query<GetBannerApiResponse, GetBannerApiArg>({
      query: (queryArg) => ({
        url: `/v1/banner`,
        params: { type: queryArg["type"] },
      }),
    }),
    updateBanner: build.mutation<UpdateBannerApiResponse, UpdateBannerApiArg>({
      query: (queryArg) => ({
        url: `/v1/banner`,
        method: "PUT",
        body: queryArg.siteBanner,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as enhancedApi };
export type GetBannerApiResponse = /** status 200 Success */ SiteBanner;
export type GetBannerApiArg = {
  type?: BannerType;
};
export type UpdateBannerApiResponse = /** status 200 Success */ boolean;
export type UpdateBannerApiArg = {
  siteBanner: SiteBanner;
};
export type BannerType = "None" | "Login" | "Announcement";
export type SiteBanner = {
  type: BannerType;
  text: string;
};
export const { useGetBannerQuery, useUpdateBannerMutation } = injectedRtkApi;
