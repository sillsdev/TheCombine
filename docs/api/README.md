# Combine API docs

## User

- [Add user](users/post.md) : `POST /v1/users`
- [Get all users](users/get_all.md) : `GET /v1/users`
- [Update user info](users/put.md) : `PUT /v1/users/{id}`
- [Get user](users/get.md) : `GET /v1/users/{id}`

## Project

- [Add language project](project/post.md) : `POST: /v1/projects/{project}`
- [Get all projects](project/get.md) : `GET: /v1/projects`
- [Update settings](project/settings/put.md) : `PUT: /v1/projects/{project}/settings`
- [Get settings](project/settings/get.md) : `GET: /v1/projects/{project}/settings`

### Words

- [Add word](project/words/post.md) : `POST: /v1/projects/{project}/words`
- [Merge words](project/words/put.md) : `PUT: /v1/projects/{project}/words`
- [Get all words](project/words/get.md) : `GET: /v1/projects/{project}/words`
- [Get word](project/words/get_id.md) : `GET: /v1/projects/{project}/words/{id}`
- [Update word](project/words/put_id.md) : `PUT: /v1/projects/{project}/words/{id}`
- [Get frontier words](project/words/frontier.md) : `GET: /v1/projects/{project}/words/frontier`
