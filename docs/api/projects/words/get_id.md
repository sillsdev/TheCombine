# Get word by ID

**URL** : `/v1/projects/{projectId}/words/{wordId}`

**Method** : `GET`

**Auth required** :

## Success response

**Code** : `200 OK`

**Data content** : [`Word`](word.md)

## Error response

**Condition** : If word ID doesn't exist

**Code** `404 NOT FOUND`
