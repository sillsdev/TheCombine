#! /usr/bin/env python3

from combine_app import CombineApp, Permission

if __name__ == "__main__":
    combine = CombineApp()
    backend_pods = combine.get_pod_id("backend")
    print(f"Backend Pods: {backend_pods}")
    db_result = combine.db_cmd("db.ProjectsCollection.find().pretty()")
    print(db_result)
    proj_id = combine.get_project_id("Deutsch")
    print(f"Project ID: {proj_id}")
    user_id = combine.get_user_id("jmg227")
    print(f"User Id: {user_id}")
    if proj_id is not None:
        proj_roles = combine.get_project_roles(proj_id, Permission.Owner)
        print(f"Project Roles:\n{proj_roles}")
