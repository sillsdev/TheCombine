import { StoreStateDispatch } from "Redux/rootReduxTypes";
import { WritingSystem } from "api/models";
import { createProject, finishUploadLift, getProject } from "backend";
import { asyncCreateUserEdits } from "components/GoalTimeline/Redux/GoalActions";
import { setNewCurrentProject } from "components/Project/ProjectActions";
import router from "router/browserRouter";
import { Path } from "types/path";
import { newProject } from "types/project";

// Dispatch Functions

/** Create a project without an import. */
export function asyncCreateProject(
  name: string,
  vernacularWritingSystem: WritingSystem,
  analysisWritingSystems: WritingSystem[]
) {
  return async (dispatch: StoreStateDispatch) => {
    const project = newProject(name);
    project.vernacularWritingSystem = vernacularWritingSystem;
    project.analysisWritingSystems = analysisWritingSystems;

    const createdProject = await createProject(project);
    dispatch(setNewCurrentProject(createdProject));

    // Manually pause so they have a chance to see the success message.
    setTimeout(() => {
      dispatch(asyncCreateUserEdits());
      router.navigate(Path.ProjSettings);
    }, 1000);
  };
}

/** Create a project with a pre-uploaded import. */
export function asyncFinishProject(
  name: string,
  vernacularWritingSystem: WritingSystem
) {
  return async (dispatch: StoreStateDispatch) => {
    const project = newProject(name);
    project.vernacularWritingSystem = vernacularWritingSystem;

    const projId = (await createProject(project)).id;
    await finishUploadLift(projId);
    const createdProject = await getProject(projId);
    dispatch(setNewCurrentProject(createdProject));

    // Manually pause so they have a chance to see the success message.
    setTimeout(() => {
      dispatch(asyncCreateUserEdits());
      router.navigate(Path.ProjSettings);
    }, 1000);
  };
}
