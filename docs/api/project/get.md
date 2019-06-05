# Get multiple projects

**URL** : `/v1/projects`

**Method** : `GET`

**Auth required** :

**Data type** : `ids: string[] | undefined`

> All projects with ids in `ids` will be returned.
> if the body is empty it will return all projects

## Success response

**Code** : `200 OK`

**Data Content** : [`Project`](project.md)`[]`

## Error response

**Condition** : If any ID in body is not found

**Code** : `404 NOT FOUND`

**Data content** : `missingIds: String[]`
