# Combine API docs

> **The `{project}` element of these routes in not currently functional, to use a route with this field, remove it completely.**  
> /v1/projects/{project}/words/frontier → /v1/projects/words/frontier

## User

- [Add user](users/post.md) : `POST /v1/users`
- [Get all users](users/get_all.md) : `GET /v1/users`
- [Update user info](users/put.md) : `PUT /v1/users/{id}`
- [Get user](users/get.md) : `GET /v1/users/{id}`

## Project

- [Add language project](projects/post.md) : `POST: /v1/projects/`
- [Get all projects](projects/get_all.md) : `GET: /v1/projects`
- [Get one project](projects/get.md) : `GET: /v1/projects/{id}`
- [Update a project](projects/put.md) : `PUT: /v1/projects/{id}`

### Word

- [Add word](projects/words/post.md) : `POST: /v1/projects/{project}/words`
- [Merge words](projects/words/put.md) : `PUT: /v1/projects/{project}/words`
- [Get all words](projects/words/get.md) : `GET: /v1/projects/{project}/words`
- [Get word](projects/words/get_id.md) : `GET: /v1/projects/{project}/words/{id}`
- [Update word](projects/words/put_id.md) : `PUT: /v1/projects/{project}/words/{id}`
- [Delete word](projects/words/delete_id.md) : `DELETE: /v1/projects/{project}/words/{id}`
- [Merge words](projects/words/put.md) : `PUT: /v1/projects/{project}/words`
- [Get frontier words](projects/words/frontier.md) : `GET: /v1/projects/{project}/words/frontier`
- [Upload Lift File](projects/words/post_upload.md) : `POST: /v1/projects/{project}/words/upload`

### User Role

- [Add user role](projects/user_roles/post.md) : `POST /v1/projects/userroles`
- [Get all users](projects/user_roles/get_all.md) : `GET /v1/projects/userroles`
- [Update user info](projects/user_roles/put.md) : `PUT /v1/projects/userroles/{id}`
- [Get user](projects/user_roles/get.md) : `GET /v1/projects/userroles/{id}`