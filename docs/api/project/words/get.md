# Get all words

Gets all words in the project

**URL** : `/v1/projects/{project}/words`

**Method** : `GET`

**Auth required** :

**Data type** : `ids: string[] | undefined`

> If `undefined` it will return all words

## Success Response

**Code** : `200 OK`

**Data Content** : [`Word`](word.md)`[]`

## Error response

**Condition** : If any ID in body is not found

**Code** : `404 NOT FOUND`

**Data content** : `missingIds: String[]`
