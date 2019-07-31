# Update UserRole of user on a project

**URL** : `/v1/projects/{projectId}/users/{userId}`

**Method** : `PUT`

**Auth required** : Project Admin

**Data type** : `int[]`

## Success response

**Code** : `200 OK`

**Data Content** : `string` projectId

## Redirect response

**Condition** : No content changed

**Code** : `304 NOT MODIFIED`

## Error response

**Condition** : Project not found

**Code** : `404 NOT FOUND`
