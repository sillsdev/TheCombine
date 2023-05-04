import { emptySplitApi as api } from "./emptyApi";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSemanticDomainFull: build.query<
      GetSemanticDomainFullApiResponse,
      GetSemanticDomainFullApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/semanticdomain/domainFull`,
        params: { id: queryArg.id, lang: queryArg.lang },
      }),
    }),
    getSemanticDomainTreeNode: build.query<
      GetSemanticDomainTreeNodeApiResponse,
      GetSemanticDomainTreeNodeApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/semanticdomain/domainTreeNode`,
        params: { id: queryArg.id, lang: queryArg.lang },
      }),
    }),
    getSemanticDomainTreeNodeByName: build.query<
      GetSemanticDomainTreeNodeByNameApiResponse,
      GetSemanticDomainTreeNodeByNameApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/semanticdomain/domainByName`,
        params: { name: queryArg.name, lang: queryArg.lang },
      }),
    }),
    getAllSemanticDomainTreeNodes: build.query<
      GetAllSemanticDomainTreeNodesApiResponse,
      GetAllSemanticDomainTreeNodesApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/semanticdomain/domainGetAll`,
        params: { lang: queryArg.lang },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as enhancedApi };
export type GetSemanticDomainFullApiResponse =
  /** status 200 Success */ SemanticDomainFull;
export type GetSemanticDomainFullApiArg = {
  id?: string;
  lang?: string;
};
export type GetSemanticDomainTreeNodeApiResponse =
  /** status 200 Success */ SemanticDomainTreeNode;
export type GetSemanticDomainTreeNodeApiArg = {
  id?: string;
  lang?: string;
};
export type GetSemanticDomainTreeNodeByNameApiResponse =
  /** status 200 Success */ SemanticDomainTreeNode;
export type GetSemanticDomainTreeNodeByNameApiArg = {
  name?: string;
  lang?: string;
};
export type GetAllSemanticDomainTreeNodesApiResponse =
  /** status 200 Success */ SemanticDomainTreeNode;
export type GetAllSemanticDomainTreeNodesApiArg = {
  lang?: string;
};
export type SemanticDomainFull = {
  mongoId?: string | null;
  guid: string;
  name: string;
  id: string;
  lang: string;
  userId?: string | null;
  created?: string | null;
  description: string;
  questions: string[];
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
export const {
  useGetSemanticDomainFullQuery,
  useGetSemanticDomainTreeNodeQuery,
  useGetSemanticDomainTreeNodeByNameQuery,
  useGetAllSemanticDomainTreeNodesQuery,
} = injectedRtkApi;
