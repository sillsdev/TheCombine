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
import { Edit } from "../models";
// @ts-ignore
import { User } from "../models";
// @ts-ignore
import { UserEdit } from "../models";
// @ts-ignore
import { UserEditStepWrapper } from "../models";
/**
 * UserEditApi - axios parameter creator
 * @export
 */
export const UserEditApiAxiosParamCreator = function (
  configuration?: Configuration
) {
  return {
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createUserEdit: async (
      projectId: string,
      options: any = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'projectId' is not null or undefined
      assertParamExists("createUserEdit", "projectId", projectId);
      const localVarPath = `/v1/projects/{projectId}/useredits`.replace(
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
     * @param {string} userEditId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteUserEdit: async (
      projectId: string,
      userEditId: string,
      options: any = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'projectId' is not null or undefined
      assertParamExists("deleteUserEdit", "projectId", projectId);
      // verify required parameter 'userEditId' is not null or undefined
      assertParamExists("deleteUserEdit", "userEditId", userEditId);
      const localVarPath = `/v1/projects/{projectId}/useredits/{userEditId}`
        .replace(`{${"projectId"}}`, encodeURIComponent(String(projectId)))
        .replace(`{${"userEditId"}}`, encodeURIComponent(String(userEditId)));
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: "DELETE",
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
    getProjectUserEdits: async (
      projectId: string,
      options: any = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'projectId' is not null or undefined
      assertParamExists("getProjectUserEdits", "projectId", projectId);
      const localVarPath = `/v1/projects/{projectId}/useredits`.replace(
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
     * @param {string} userEditId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getUserEdit: async (
      projectId: string,
      userEditId: string,
      options: any = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'projectId' is not null or undefined
      assertParamExists("getUserEdit", "projectId", projectId);
      // verify required parameter 'userEditId' is not null or undefined
      assertParamExists("getUserEdit", "userEditId", userEditId);
      const localVarPath = `/v1/projects/{projectId}/useredits/{userEditId}`
        .replace(`{${"projectId"}}`, encodeURIComponent(String(projectId)))
        .replace(`{${"userEditId"}}`, encodeURIComponent(String(userEditId)));
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
     * @param {string} userEditId
     * @param {Edit} edit
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUserEditGoal: async (
      projectId: string,
      userEditId: string,
      edit: Edit,
      options: any = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'projectId' is not null or undefined
      assertParamExists("updateUserEditGoal", "projectId", projectId);
      // verify required parameter 'userEditId' is not null or undefined
      assertParamExists("updateUserEditGoal", "userEditId", userEditId);
      // verify required parameter 'edit' is not null or undefined
      assertParamExists("updateUserEditGoal", "edit", edit);
      const localVarPath = `/v1/projects/{projectId}/useredits/{userEditId}`
        .replace(`{${"projectId"}}`, encodeURIComponent(String(projectId)))
        .replace(`{${"userEditId"}}`, encodeURIComponent(String(userEditId)));
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

      localVarHeaderParameter["Content-Type"] = "application/json";

      setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        edit,
        localVarRequestOptions,
        configuration
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @param {string} projectId
     * @param {string} userEditId
     * @param {UserEditStepWrapper} userEditStepWrapper
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUserEditStep: async (
      projectId: string,
      userEditId: string,
      userEditStepWrapper: UserEditStepWrapper,
      options: any = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'projectId' is not null or undefined
      assertParamExists("updateUserEditStep", "projectId", projectId);
      // verify required parameter 'userEditId' is not null or undefined
      assertParamExists("updateUserEditStep", "userEditId", userEditId);
      // verify required parameter 'userEditStepWrapper' is not null or undefined
      assertParamExists(
        "updateUserEditStep",
        "userEditStepWrapper",
        userEditStepWrapper
      );
      const localVarPath = `/v1/projects/{projectId}/useredits/{userEditId}`
        .replace(`{${"projectId"}}`, encodeURIComponent(String(projectId)))
        .replace(`{${"userEditId"}}`, encodeURIComponent(String(userEditId)));
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: "PUT",
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      localVarHeaderParameter["Content-Type"] = "application/json";

      setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        userEditStepWrapper,
        localVarRequestOptions,
        configuration
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
  };
};

/**
 * UserEditApi - functional programming interface
 * @export
 */
export const UserEditApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = UserEditApiAxiosParamCreator(configuration);
  return {
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createUserEdit(
      projectId: string,
      options?: any
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<User>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createUserEdit(
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
     * @param {string} userEditId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteUserEdit(
      projectId: string,
      userEditId: string,
      options?: any
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteUserEdit(
        projectId,
        userEditId,
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
    async getProjectUserEdits(
      projectId: string,
      options?: any
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string
      ) => AxiosPromise<Array<UserEdit>>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getProjectUserEdits(projectId, options);
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
     * @param {string} userEditId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getUserEdit(
      projectId: string,
      userEditId: string,
      options?: any
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<UserEdit>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getUserEdit(
        projectId,
        userEditId,
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
     * @param {string} userEditId
     * @param {Edit} edit
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateUserEditGoal(
      projectId: string,
      userEditId: string,
      edit: Edit,
      options?: any
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updateUserEditGoal(
          projectId,
          userEditId,
          edit,
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
     * @param {string} userEditId
     * @param {UserEditStepWrapper} userEditStepWrapper
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateUserEditStep(
      projectId: string,
      userEditId: string,
      userEditStepWrapper: UserEditStepWrapper,
      options?: any
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<number>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updateUserEditStep(
          projectId,
          userEditId,
          userEditStepWrapper,
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
 * UserEditApi - factory interface
 * @export
 */
export const UserEditApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance
) {
  const localVarFp = UserEditApiFp(configuration);
  return {
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createUserEdit(projectId: string, options?: any): AxiosPromise<User> {
      return localVarFp
        .createUserEdit(projectId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} projectId
     * @param {string} userEditId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteUserEdit(
      projectId: string,
      userEditId: string,
      options?: any
    ): AxiosPromise<void> {
      return localVarFp
        .deleteUserEdit(projectId, userEditId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} projectId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getProjectUserEdits(
      projectId: string,
      options?: any
    ): AxiosPromise<Array<UserEdit>> {
      return localVarFp
        .getProjectUserEdits(projectId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} projectId
     * @param {string} userEditId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getUserEdit(
      projectId: string,
      userEditId: string,
      options?: any
    ): AxiosPromise<UserEdit> {
      return localVarFp
        .getUserEdit(projectId, userEditId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} projectId
     * @param {string} userEditId
     * @param {Edit} edit
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUserEditGoal(
      projectId: string,
      userEditId: string,
      edit: Edit,
      options?: any
    ): AxiosPromise<void> {
      return localVarFp
        .updateUserEditGoal(projectId, userEditId, edit, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} projectId
     * @param {string} userEditId
     * @param {UserEditStepWrapper} userEditStepWrapper
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUserEditStep(
      projectId: string,
      userEditId: string,
      userEditStepWrapper: UserEditStepWrapper,
      options?: any
    ): AxiosPromise<number> {
      return localVarFp
        .updateUserEditStep(projectId, userEditId, userEditStepWrapper, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * Request parameters for createUserEdit operation in UserEditApi.
 * @export
 * @interface UserEditApiCreateUserEditRequest
 */
export interface UserEditApiCreateUserEditRequest {
  /**
   *
   * @type {string}
   * @memberof UserEditApiCreateUserEdit
   */
  readonly projectId: string;
}

/**
 * Request parameters for deleteUserEdit operation in UserEditApi.
 * @export
 * @interface UserEditApiDeleteUserEditRequest
 */
export interface UserEditApiDeleteUserEditRequest {
  /**
   *
   * @type {string}
   * @memberof UserEditApiDeleteUserEdit
   */
  readonly projectId: string;

  /**
   *
   * @type {string}
   * @memberof UserEditApiDeleteUserEdit
   */
  readonly userEditId: string;
}

/**
 * Request parameters for getProjectUserEdits operation in UserEditApi.
 * @export
 * @interface UserEditApiGetProjectUserEditsRequest
 */
export interface UserEditApiGetProjectUserEditsRequest {
  /**
   *
   * @type {string}
   * @memberof UserEditApiGetProjectUserEdits
   */
  readonly projectId: string;
}

/**
 * Request parameters for getUserEdit operation in UserEditApi.
 * @export
 * @interface UserEditApiGetUserEditRequest
 */
export interface UserEditApiGetUserEditRequest {
  /**
   *
   * @type {string}
   * @memberof UserEditApiGetUserEdit
   */
  readonly projectId: string;

  /**
   *
   * @type {string}
   * @memberof UserEditApiGetUserEdit
   */
  readonly userEditId: string;
}

/**
 * Request parameters for updateUserEditGoal operation in UserEditApi.
 * @export
 * @interface UserEditApiUpdateUserEditGoalRequest
 */
export interface UserEditApiUpdateUserEditGoalRequest {
  /**
   *
   * @type {string}
   * @memberof UserEditApiUpdateUserEditGoal
   */
  readonly projectId: string;

  /**
   *
   * @type {string}
   * @memberof UserEditApiUpdateUserEditGoal
   */
  readonly userEditId: string;

  /**
   *
   * @type {Edit}
   * @memberof UserEditApiUpdateUserEditGoal
   */
  readonly edit: Edit;
}

/**
 * Request parameters for updateUserEditStep operation in UserEditApi.
 * @export
 * @interface UserEditApiUpdateUserEditStepRequest
 */
export interface UserEditApiUpdateUserEditStepRequest {
  /**
   *
   * @type {string}
   * @memberof UserEditApiUpdateUserEditStep
   */
  readonly projectId: string;

  /**
   *
   * @type {string}
   * @memberof UserEditApiUpdateUserEditStep
   */
  readonly userEditId: string;

  /**
   *
   * @type {UserEditStepWrapper}
   * @memberof UserEditApiUpdateUserEditStep
   */
  readonly userEditStepWrapper: UserEditStepWrapper;
}

/**
 * UserEditApi - object-oriented interface
 * @export
 * @class UserEditApi
 * @extends {BaseAPI}
 */
export class UserEditApi extends BaseAPI {
  /**
   *
   * @param {UserEditApiCreateUserEditRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserEditApi
   */
  public createUserEdit(
    requestParameters: UserEditApiCreateUserEditRequest,
    options?: any
  ) {
    return UserEditApiFp(this.configuration)
      .createUserEdit(requestParameters.projectId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {UserEditApiDeleteUserEditRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserEditApi
   */
  public deleteUserEdit(
    requestParameters: UserEditApiDeleteUserEditRequest,
    options?: any
  ) {
    return UserEditApiFp(this.configuration)
      .deleteUserEdit(
        requestParameters.projectId,
        requestParameters.userEditId,
        options
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {UserEditApiGetProjectUserEditsRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserEditApi
   */
  public getProjectUserEdits(
    requestParameters: UserEditApiGetProjectUserEditsRequest,
    options?: any
  ) {
    return UserEditApiFp(this.configuration)
      .getProjectUserEdits(requestParameters.projectId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {UserEditApiGetUserEditRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserEditApi
   */
  public getUserEdit(
    requestParameters: UserEditApiGetUserEditRequest,
    options?: any
  ) {
    return UserEditApiFp(this.configuration)
      .getUserEdit(
        requestParameters.projectId,
        requestParameters.userEditId,
        options
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {UserEditApiUpdateUserEditGoalRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserEditApi
   */
  public updateUserEditGoal(
    requestParameters: UserEditApiUpdateUserEditGoalRequest,
    options?: any
  ) {
    return UserEditApiFp(this.configuration)
      .updateUserEditGoal(
        requestParameters.projectId,
        requestParameters.userEditId,
        requestParameters.edit,
        options
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {UserEditApiUpdateUserEditStepRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserEditApi
   */
  public updateUserEditStep(
    requestParameters: UserEditApiUpdateUserEditStepRequest,
    options?: any
  ) {
    return UserEditApiFp(this.configuration)
      .updateUserEditStep(
        requestParameters.projectId,
        requestParameters.userEditId,
        requestParameters.userEditStepWrapper,
        options
      )
      .then((request) => request(this.axios, this.basePath));
  }
}
