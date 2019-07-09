# Accessibility State

Acccessibility state is an enum representing one of four states

**Active** : Standard Node type

**Deleted** : Node has been deleted

**Sense** : Node has been merged with another node as an alternate definition

**Duplicate** : Node has been merged with another node as a duplicate node

**Separate** : Node has been made into a new node

## Raw type

```typescript
enum {
    active,
    deleted,
    sense,
    duplicate,
    separate
}
```
