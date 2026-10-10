# Test Strategy

## Unit Tests
- Framework: **Vitest**
- Scope: Backend services and simulation logic (`server/src/simulation/agents.test.ts`).
- Goal: Verify that individual agents correctly emit the appropriate events when given specific inputs, without requiring a full engine loop or database.

## Integration Tests
- Scope: End-to-end simulation cycle.
- Goal: Ensure that starting an exercise populates the SQLite database with a cohesive stream of telemetry, incidents, and a final score.

## Testing Execution
```bash
# Run backend tests
cd server
npm run test
```
