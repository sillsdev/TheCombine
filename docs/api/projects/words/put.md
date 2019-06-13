# Merge words

Merge words into a parent

**URL** : `/v1/projects/{project}/words`

**Method** : `PUT`

**Auth required** :

**Data type** :

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
