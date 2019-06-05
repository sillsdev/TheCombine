# Update word

**URL** : `/v1/projects/{project}/words/{id}`

**Method** : `PUT`

**Auth required** :

**Data type** : [`Word`](word.md)

## Success response

**Code** : `200 OK`

**Data content** : `id: string`

## Error response

**Condition** : If project or id is not found

**Code** : `404 NOT FOUND`

**Data content** : `missingItem: string`
