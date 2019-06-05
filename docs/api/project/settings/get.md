# Get project settings

**URL** : `/v1/{project}/settings`

**Method** : `GET`

**Auth required** :

**Data type** : `ids: String[] | undefined`

## Success response

**Code** : `200 OK`

**Data content** : [`Project`](project.md)`[]`

## Error response

**Condition** : Project not found

**Code** : `404 NOT FOUND`
