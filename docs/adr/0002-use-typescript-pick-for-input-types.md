# 2. Use TypeScript Utility Types (Pick/Omit) over Duplicate Input Types

Date: 2026-06-08

## Status

Accepted

## Context

When defining TypeScript models for entities (e.g., `ArmyRulebook`, `Player`, `Mission`), we often need to define matching "Input" types for creating or updating those entities (e.g., `ArmyRulebookInput`, `PlayerInput`). Historically, these Input types were explicitly defined as separate type declarations.

This practice leads to redundant code, violates the DRY (Don't Repeat Yourself) principle, and increases the risk of the main entity type and the input type falling out of sync when schemas change.

## Decision

We will use TypeScript utility types, specifically `Pick` and `Omit`, to derive our input types dynamically from our main entity types. 

For example, instead of:

```typescript
export type ArmyRulebook = {
  id: number;
  name: string;
  description: string;
  created_at: string;
};

export type ArmyRulebookInput = {
  name: string;
  description: string;
};
```

We will simply define the main entity and use `Pick` where the input is required:

```typescript
export type ArmyRulebook = {
  id: number;
  name: string;
  description: string;
  created_at: string;
};

// Use directly in function signatures:
function createArmyRulebook(input: Pick<ArmyRulebook, 'name' | 'description'>) { ... }
```

## Consequences

- **Pros:** Reduces boilerplate type definitions, ensures that inputs are strictly tied to the entity properties, and allows the compiler to enforce synchronicity between entity models and their creation inputs.
- **Cons:** Long `Pick<...>` statements in function signatures can sometimes feel slightly more verbose than a short `Input` alias, though aliases like `export type ArmyRulebookInput = Pick<ArmyRulebook, 'name' | 'description'>;` can be used to mitigate this if needed.
