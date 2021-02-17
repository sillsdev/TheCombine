// This script will delete a Combine project from the database
// Assumptions:
//   - The Javascript is run with the variable "projectName" defined
//     and set to the name of the project to be deleted.
//
// To delete a project, we need to delete:
//  1. documents in the
//      - FrontierCollection,
//      - WordsCollection,
//      - UserEditsCollection, and
//      - UserRolesCollection
//     with a projectId field that matches the project being deleted;
//  2. entries in the workedProject and projectRoles arrays in
//     the UsersCollection that reference the project being deleted.
//  3. the project document from the ProjectsCollection;

let conn = new Mongo();
let db = conn.getDB("CombineDatabase");
let myCursor = db.ProjectsCollection.findOne({ name: projectName }, { _id: 1 });

if (typeof myCursor != "undefined" && myCursor != null) {
  let projId = myCursor["_id"].str;

  // 1. Remove project documents from
  //    - FrontierCollection,
  //    - WordsCollection,
  //    - UserEditsCollection, and
  //    - UserRolesCollection
  db.FrontierCollection.deleteMany({ projectId: projId });
  db.WordsCollection.deleteMany({ projectId: projId });
  db.UserEditsCollection.deleteMany({ projectId: projId });
  db.UserRolesCollection.deleteMany({ projectId: projId });

  // 2. Remove project from "workedProject" and "projectRoles" objects
  //    in the UsersCollection
  let fieldList = ["workedProjects", "projectRoles"];
  let field = {};
  for (let fieldName of fieldList) {
    field = {};
    field[fieldName + "." + projId] = "";
    db.UsersCollection.updateMany({}, { $unset: field });
  }

  // 3. Remove the project from the ProjectsCollection
  db.ProjectsCollection.deleteOne({ _id: ObjectId(projId) });
}
