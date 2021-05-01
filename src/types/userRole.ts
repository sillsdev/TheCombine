export interface UserRole {
  id: string;
  projectId: string;

  /** Use the `Permission` `enum` for comparisons against these values. */
  permissions: number[];
}

/**The definition of a particular permission `number`.
 *
 * @remarks
 * This must be kept in sync with the Backend `enum` definition.
 * */
export enum Permission {
  DatabaseAdmin = 6,
  DeleteEditSettingsAndUsers = 5,
  ImportExport = 4,
  MergeAndCharSet = 3,
  Unused = 2,
  WordEntry = 1,
}
