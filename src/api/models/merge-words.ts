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

import { MergeSourceWord } from "./merge-source-word";
import { Word } from "./word";

/**
 *
 * @export
 * @interface MergeWords
 */
export interface MergeWords {
  /**
   *
   * @type {Word}
   * @memberof MergeWords
   */
  parent: Word;
  /**
   *
   * @type {Array<MergeSourceWord>}
   * @memberof MergeWords
   */
  children: Array<MergeSourceWord>;
  /**
   *
   * @type {boolean}
   * @memberof MergeWords
   */
  deleteOnly: boolean;
}
