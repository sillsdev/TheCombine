export interface UserEdit {
  id: string;
  edits: Edit[];
}

export interface Edit {
  guid: string;
  goalType: number;
  stepData: string[];
  changes: string;
}
