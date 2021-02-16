export interface UserEdit {
  id: string;
  edits: Edit[];
}

export interface Edit {
  goalType: number;
  stepData: string[];
  changes: string;
}
