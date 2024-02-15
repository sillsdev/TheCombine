import { type WritingSystem } from "api/models";
import { createProject, finishUploadLift, getProject } from "backend";
import router from "browserRouter";
import { asyncCreateUserEdits } from "components/GoalTimeline/Redux/GoalActions";
import { asyncSetNewCurrentProject } from "components/Project/ProjectActions";
import { type StoreStateDispatch } from "types/Redux/actions";
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
    await dispatch(asyncSetNewCurrentProject(createdProject));

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
    await dispatch(asyncSetNewCurrentProject(createdProject));

    // Manually pause so they have a chance to see the success message.
    setTimeout(() => {
      dispatch(asyncCreateUserEdits());
      router.navigate(Path.ProjSettings);
    }, 1000);
  };
}
