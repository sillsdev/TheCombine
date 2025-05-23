/* tslint:disable */
/* eslint-disable */
/**
 * BackendFramework
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import globalAxios, { AxiosPromise, AxiosInstance } from "axios";
import { Configuration } from "../configuration";
// Some imports not used depending on template conditions
// @ts-ignore
import {
  DUMMY_BASE_URL,
  assertParamExists,
  setApiKeyToObject,
  setBasicAuthToObject,
  setBearerAuthToObject,
  setOAuthToObject,
  setSearchParams,
  serializeDataIfNeeded,
  toPathString,
  createRequestFunction,
} from "../common";
// @ts-ignore
import {
  BASE_PATH,
  COLLECTION_FORMATS,
  RequestArgs,
  BaseAPI,
  RequiredError,
} from "../base";
// @ts-ignore
import { WritingSystem } from "../models";
/**
 * LiftApi - axios parameter creator
 * @export
 */
export const LiftApiAxiosParamCreator = function (
  configuration?: Configuration
) {
  return {
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    canUploadLift: async (
      projectId: string,
      options: any = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'projectId' is not null or undefined
      assertParamExists("canUploadLift", "projectId", projectId);
      const localVarPath = `/v1/projects/{projectId}/lift/check`.replace(
        `{${"projectId"}}`,
        encodeURIComponent(String(projectId))
      );
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: "GET",
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    cancelLiftExport: async (
      projectId: string,
      options: any = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'projectId' is not null or undefined
      assertParamExists("cancelLiftExport", "projectId", projectId);
      const localVarPath = `/v1/projects/{projectId}/lift/cancelexport`.replace(
        `{${"projectId"}}`,
        encodeURIComponent(String(projectId))
      );
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: "GET",
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteLiftFile: async (
      projectId: string,
      options: any = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'projectId' is not null or undefined
      assertParamExists("deleteLiftFile", "projectId", projectId);
      const localVarPath = `/v1/projects/{projectId}/lift/deleteexport`.replace(
        `{${"projectId"}}`,
        encodeURIComponent(String(projectId))
      );
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: "GET",
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    downloadLiftFile: async (
      projectId: string,
      options: any = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'projectId' is not null or undefined
      assertParamExists("downloadLiftFile", "projectId", projectId);
      const localVarPath = `/v1/projects/{projectId}/lift/download`.replace(
        `{${"projectId"}}`,
        encodeURIComponent(String(projectId))
      );
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: "GET",
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    exportLiftFile: async (
      projectId: string,
      options: any = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'projectId' is not null or undefined
      assertParamExists("exportLiftFile", "projectId", projectId);
      const localVarPath = `/v1/projects/{projectId}/lift/export`.replace(
        `{${"projectId"}}`,
        encodeURIComponent(String(projectId))
      );
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: "GET",
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    finishUploadLiftFile: async (
      projectId: string,
      options: any = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'projectId' is not null or undefined
      assertParamExists("finishUploadLiftFile", "projectId", projectId);
      const localVarPath = `/v1/projects/{projectId}/lift/finishupload`.replace(
        `{${"projectId"}}`,
        encodeURIComponent(String(projectId))
      );
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: "POST",
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @param {string} projectId
     * @param {any} [file]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    uploadLiftFile: async (
      projectId: string,
      file?: any,
      options: any = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'projectId' is not null or undefined
      assertParamExists("uploadLiftFile", "projectId", projectId);
      const localVarPath = `/v1/projects/{projectId}/lift/upload`.replace(
        `{${"projectId"}}`,
        encodeURIComponent(String(projectId))
      );
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: "POST",
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;
      const localVarFormParams = new ((configuration &&
        configuration.formDataCtor) ||
        FormData)();

      if (file !== undefined) {
        localVarFormParams.append("file", file as any);
      }

      localVarHeaderParameter["Content-Type"] = "multipart/form-data";

      setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = localVarFormParams;

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @param {string} projectId
     * @param {any} [file]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    uploadLiftFileAndGetWritingSystems: async (
      projectId: string,
      file?: any,
      options: any = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'projectId' is not null or undefined
      assertParamExists(
        "uploadLiftFileAndGetWritingSystems",
        "projectId",
        projectId
      );
      const localVarPath =
        `/v1/projects/{projectId}/lift/uploadandgetwritingsystems`.replace(
          `{${"projectId"}}`,
          encodeURIComponent(String(projectId))
        );
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: "POST",
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;
      const localVarFormParams = new ((configuration &&
        configuration.formDataCtor) ||
        FormData)();

      if (file !== undefined) {
        localVarFormParams.append("file", file as any);
      }

      localVarHeaderParameter["Content-Type"] = "multipart/form-data";

      setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = localVarFormParams;

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
  };
};

/**
 * LiftApi - functional programming interface
 * @export
 */
export const LiftApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = LiftApiAxiosParamCreator(configuration);
  return {
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async canUploadLift(
      projectId: string,
      options?: any
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<boolean>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.canUploadLift(
        projectId,
        options
      );
      return createRequestFunction(
        localVarAxiosArgs,
        globalAxios,
        BASE_PATH,
        configuration
      );
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async cancelLiftExport(
      projectId: string,
      options?: any
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<boolean>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.cancelLiftExport(projectId, options);
      return createRequestFunction(
        localVarAxiosArgs,
        globalAxios,
        BASE_PATH,
        configuration
      );
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteLiftFile(
      projectId: string,
      options?: any
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<string>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteLiftFile(
        projectId,
        options
      );
      return createRequestFunction(
        localVarAxiosArgs,
        globalAxios,
        BASE_PATH,
        configuration
      );
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async downloadLiftFile(
      projectId: string,
      options?: any
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<any>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.downloadLiftFile(projectId, options);
      return createRequestFunction(
        localVarAxiosArgs,
        globalAxios,
        BASE_PATH,
        configuration
      );
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async exportLiftFile(
      projectId: string,
      options?: any
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<string>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.exportLiftFile(
        projectId,
        options
      );
      return createRequestFunction(
        localVarAxiosArgs,
        globalAxios,
        BASE_PATH,
        configuration
      );
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async finishUploadLiftFile(
      projectId: string,
      options?: any
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<number>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.finishUploadLiftFile(
          projectId,
          options
        );
      return createRequestFunction(
        localVarAxiosArgs,
        globalAxios,
        BASE_PATH,
        configuration
      );
    },
    /**
     *
     * @param {string} projectId
     * @param {any} [file]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async uploadLiftFile(
      projectId: string,
      file?: any,
      options?: any
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<number>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.uploadLiftFile(
        projectId,
        file,
        options
      );
      return createRequestFunction(
        localVarAxiosArgs,
        globalAxios,
        BASE_PATH,
        configuration
      );
    },
    /**
     *
     * @param {string} projectId
     * @param {any} [file]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async uploadLiftFileAndGetWritingSystems(
      projectId: string,
      file?: any,
      options?: any
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string
      ) => AxiosPromise<Array<WritingSystem>>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.uploadLiftFileAndGetWritingSystems(
          projectId,
          file,
          options
        );
      return createRequestFunction(
        localVarAxiosArgs,
        globalAxios,
        BASE_PATH,
        configuration
      );
    },
  };
};

/**
 * LiftApi - factory interface
 * @export
 */
export const LiftApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance
) {
  const localVarFp = LiftApiFp(configuration);
  return {
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    canUploadLift(projectId: string, options?: any): AxiosPromise<boolean> {
      return localVarFp
        .canUploadLift(projectId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    cancelLiftExport(projectId: string, options?: any): AxiosPromise<boolean> {
      return localVarFp
        .cancelLiftExport(projectId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteLiftFile(projectId: string, options?: any): AxiosPromise<string> {
      return localVarFp
        .deleteLiftFile(projectId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    downloadLiftFile(projectId: string, options?: any): AxiosPromise<any> {
      return localVarFp
        .downloadLiftFile(projectId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    exportLiftFile(projectId: string, options?: any): AxiosPromise<string> {
      return localVarFp
        .exportLiftFile(projectId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    finishUploadLiftFile(
      projectId: string,
      options?: any
    ): AxiosPromise<number> {
      return localVarFp
        .finishUploadLiftFile(projectId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} projectId
     * @param {any} [file]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    uploadLiftFile(
      projectId: string,
      file?: any,
      options?: any
    ): AxiosPromise<number> {
      return localVarFp
        .uploadLiftFile(projectId, file, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} projectId
     * @param {any} [file]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    uploadLiftFileAndGetWritingSystems(
      projectId: string,
      file?: any,
      options?: any
    ): AxiosPromise<Array<WritingSystem>> {
      return localVarFp
        .uploadLiftFileAndGetWritingSystems(projectId, file, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * Request parameters for canUploadLift operation in LiftApi.
 * @export
 * @interface LiftApiCanUploadLiftRequest
 */
export interface LiftApiCanUploadLiftRequest {
  /**
   *
   * @type {string}
   * @memberof LiftApiCanUploadLift
   */
  readonly projectId: string;
}

/**
 * Request parameters for cancelLiftExport operation in LiftApi.
 * @export
 * @interface LiftApiCancelLiftExportRequest
 */
export interface LiftApiCancelLiftExportRequest {
  /**
   *
   * @type {string}
   * @memberof LiftApiCancelLiftExport
   */
  readonly projectId: string;
}

/**
 * Request parameters for deleteLiftFile operation in LiftApi.
 * @export
 * @interface LiftApiDeleteLiftFileRequest
 */
export interface LiftApiDeleteLiftFileRequest {
  /**
   *
   * @type {string}
   * @memberof LiftApiDeleteLiftFile
   */
  readonly projectId: string;
}

/**
 * Request parameters for downloadLiftFile operation in LiftApi.
 * @export
 * @interface LiftApiDownloadLiftFileRequest
 */
export interface LiftApiDownloadLiftFileRequest {
  /**
   *
   * @type {string}
   * @memberof LiftApiDownloadLiftFile
   */
  readonly projectId: string;
}

/**
 * Request parameters for exportLiftFile operation in LiftApi.
 * @export
 * @interface LiftApiExportLiftFileRequest
 */
export interface LiftApiExportLiftFileRequest {
  /**
   *
   * @type {string}
   * @memberof LiftApiExportLiftFile
   */
  readonly projectId: string;
}

/**
 * Request parameters for finishUploadLiftFile operation in LiftApi.
 * @export
 * @interface LiftApiFinishUploadLiftFileRequest
 */
export interface LiftApiFinishUploadLiftFileRequest {
  /**
   *
   * @type {string}
   * @memberof LiftApiFinishUploadLiftFile
   */
  readonly projectId: string;
}

/**
 * Request parameters for uploadLiftFile operation in LiftApi.
 * @export
 * @interface LiftApiUploadLiftFileRequest
 */
export interface LiftApiUploadLiftFileRequest {
  /**
   *
   * @type {string}
   * @memberof LiftApiUploadLiftFile
   */
  readonly projectId: string;

  /**
   *
   * @type {any}
   * @memberof LiftApiUploadLiftFile
   */
  readonly file?: any;
}

/**
 * Request parameters for uploadLiftFileAndGetWritingSystems operation in LiftApi.
 * @export
 * @interface LiftApiUploadLiftFileAndGetWritingSystemsRequest
 */
export interface LiftApiUploadLiftFileAndGetWritingSystemsRequest {
  /**
   *
   * @type {string}
   * @memberof LiftApiUploadLiftFileAndGetWritingSystems
   */
  readonly projectId: string;

  /**
   *
   * @type {any}
   * @memberof LiftApiUploadLiftFileAndGetWritingSystems
   */
  readonly file?: any;
}

/**
 * LiftApi - object-oriented interface
 * @export
 * @class LiftApi
 * @extends {BaseAPI}
 */
export class LiftApi extends BaseAPI {
  /**
   *
   * @param {LiftApiCanUploadLiftRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LiftApi
   */
  public canUploadLift(
    requestParameters: LiftApiCanUploadLiftRequest,
    options?: any
  ) {
    return LiftApiFp(this.configuration)
      .canUploadLift(requestParameters.projectId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {LiftApiCancelLiftExportRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LiftApi
   */
  public cancelLiftExport(
    requestParameters: LiftApiCancelLiftExportRequest,
    options?: any
  ) {
    return LiftApiFp(this.configuration)
      .cancelLiftExport(requestParameters.projectId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {LiftApiDeleteLiftFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LiftApi
   */
  public deleteLiftFile(
    requestParameters: LiftApiDeleteLiftFileRequest,
    options?: any
  ) {
    return LiftApiFp(this.configuration)
      .deleteLiftFile(requestParameters.projectId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {LiftApiDownloadLiftFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LiftApi
   */
  public downloadLiftFile(
    requestParameters: LiftApiDownloadLiftFileRequest,
    options?: any
  ) {
    return LiftApiFp(this.configuration)
      .downloadLiftFile(requestParameters.projectId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {LiftApiExportLiftFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LiftApi
   */
  public exportLiftFile(
    requestParameters: LiftApiExportLiftFileRequest,
    options?: any
  ) {
    return LiftApiFp(this.configuration)
      .exportLiftFile(requestParameters.projectId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {LiftApiFinishUploadLiftFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LiftApi
   */
  public finishUploadLiftFile(
    requestParameters: LiftApiFinishUploadLiftFileRequest,
    options?: any
  ) {
    return LiftApiFp(this.configuration)
      .finishUploadLiftFile(requestParameters.projectId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {LiftApiUploadLiftFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LiftApi
   */
  public uploadLiftFile(
    requestParameters: LiftApiUploadLiftFileRequest,
    options?: any
  ) {
    return LiftApiFp(this.configuration)
      .uploadLiftFile(
        requestParameters.projectId,
        requestParameters.file,
        options
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {LiftApiUploadLiftFileAndGetWritingSystemsRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LiftApi
   */
  public uploadLiftFileAndGetWritingSystems(
    requestParameters: LiftApiUploadLiftFileAndGetWritingSystemsRequest,
    options?: any
  ) {
    return LiftApiFp(this.configuration)
      .uploadLiftFileAndGetWritingSystems(
        requestParameters.projectId,
        requestParameters.file,
        options
      )
      .then((request) => request(this.axios, this.basePath));
  }
}
