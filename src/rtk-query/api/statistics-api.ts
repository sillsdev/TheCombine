import { emptySplitApi as api } from "./emptyApi";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSemanticDomainCounts: build.query<
      GetSemanticDomainCountsApiResponse,
      GetSemanticDomainCountsApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/statistics/GetSemanticDomainCounts`,
        params: { lang: queryArg.lang },
      }),
    }),
    getWordsPerDayPerUserCounts: build.query<
      GetWordsPerDayPerUserCountsApiResponse,
      GetWordsPerDayPerUserCountsApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/statistics/GetWordsPerDayPerUserCounts`,
      }),
    }),
    getProgressEstimationLineChartRoot: build.query<
      GetProgressEstimationLineChartRootApiResponse,
      GetProgressEstimationLineChartRootApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/statistics/GetProgressEstimationLineChartRoot`,
      }),
    }),
    getLineChartRootData: build.query<
      GetLineChartRootDataApiResponse,
      GetLineChartRootDataApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/statistics/GetLineChartRootData`,
      }),
    }),
    getSemanticDomainUserCounts: build.query<
      GetSemanticDomainUserCountsApiResponse,
      GetSemanticDomainUserCountsApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/statistics/GetSemanticDomainUserCounts`,
        params: { lang: queryArg.lang },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as enhancedApi };
export type GetSemanticDomainCountsApiResponse =
  /** status 200 Success */ SemanticDomainCount[];
export type GetSemanticDomainCountsApiArg = {
  projectId: string;
  lang?: string;
};
export type GetWordsPerDayPerUserCountsApiResponse =
  /** status 200 Success */ WordsPerDayPerUserCount[];
export type GetWordsPerDayPerUserCountsApiArg = {
  projectId: string;
};
export type GetProgressEstimationLineChartRootApiResponse =
  /** status 200 Success */ ChartRootData;
export type GetProgressEstimationLineChartRootApiArg = {
  projectId: string;
};
export type GetLineChartRootDataApiResponse =
  /** status 200 Success */ ChartRootData;
export type GetLineChartRootDataApiArg = {
  projectId: string;
};
export type GetSemanticDomainUserCountsApiResponse =
  /** status 200 Success */ SemanticDomainUserCount[];
export type GetSemanticDomainUserCountsApiArg = {
  projectId: string;
  lang?: string;
};
export type SemanticDomain = {
  mongoId?: string | null;
  guid: string;
  name: string;
  id: string;
  lang: string;
  userId?: string | null;
  created?: string | null;
};
export type SemanticDomainTreeNode = {
  mongoId?: string | null;
  lang: string;
  guid: string;
  name: string;
  id: string;
  previous?: SemanticDomain;
  next?: SemanticDomain;
  parent?: SemanticDomain;
  children: SemanticDomain[];
};
export type SemanticDomainCount = {
  semanticDomainTreeNode: SemanticDomainTreeNode;
  count: number;
};
export type WordsPerDayPerUserCount = {
  dateTime: string;
  userNameCountDictionary: {
    [key: string]: number;
  };
};
export type Dataset = {
  userName: string;
  data: number[];
};
export type ChartRootData = {
  dates: string[];
  datasets: Dataset[];
};
export type SemanticDomainUserCount = {
  id: string;
  username?: string | null;
  domainSet: string[];
  domainCount?: number;
  wordCount?: number;
};
export const {
  useGetSemanticDomainCountsQuery,
  useGetWordsPerDayPerUserCountsQuery,
  useGetProgressEstimationLineChartRootQuery,
  useGetLineChartRootDataQuery,
  useGetSemanticDomainUserCountsQuery,
} = injectedRtkApi;
