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

import { Dataset } from "./dataset";

/**
 *
 * @export
 * @interface ChartRootData
 */
export interface ChartRootData {
  /**
   *
   * @type {Array<string>}
   * @memberof ChartRootData
   */
  dates: Array<string>;
  /**
   *
   * @type {Array<Dataset>}
   * @memberof ChartRootData
   */
  datasets: Array<Dataset>;
}
