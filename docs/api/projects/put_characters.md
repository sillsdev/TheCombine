# Update character set

**URL** : `/v1/projects/{projectId}/characters`

**Method** : `PUT`

**Auth required** : MergeNCharSet

**Data type** : [`Project`](project.md)

## Success response

**Code** : `200 OK`

**Data Content** : `string` userId

## Redirect response

**Condition** : No content changed

**Code** : `304 NOT MODIFIED`

## Error response

**Condition** : Project not found

**Code** : `404 NOT FOUND`
