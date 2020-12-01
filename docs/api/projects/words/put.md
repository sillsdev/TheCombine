# Merge words

Merge words into a parent

**URL** : `/v1/projects/{projectId}/words`

**Method** : `PUT`

**Auth required** :

**Data type** : MergeWords

<pre>
{
    parent: <a href=word.md>Word</a>,
    children: <a href=word.md>Word</a>[],
    mergeType: <a href=state.md>State</a>,
    time: String
}
</pre>

## Success Response

**Code** : `200 OK`

**Data content** : `id: String`

## Error response

**Condition** : If any id is not found or if there are duplicates among the parent and children

**Code** : `404 NOT FOUND`
