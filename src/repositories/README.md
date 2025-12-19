# Repository Pattern with Unit of Work

This directory implements the **Repository Pattern** with **Unit of Work** for data access.

## Architecture

```
┌─────────────────────┐
│  Context/Component  │
└──────────┬──────────┘
           │
           ▼
    ┌─────────────┐
    │ Unit of Work│ ◄─── Manages DB connection & transactions
    └──────┬──────┘
           │
           ├──► TimerSettingsRepository
           ├──► (Future: UserRepository)
           └──► (Future: HistoryRepository)
```

## Files

- **IUnitOfWork.ts** - Interface for Unit of Work pattern
- **SqliteUnitOfWork.ts** - SQLite implementation with transaction support
- **TimerSettingsRepository.ts** - Repository for timer settings
- **README.md** - This file

## Usage Examples

### Basic Usage (Single Operation)

```typescript
import { createUnitOfWork } from './repositories/SqliteUnitOfWork';

const uow = createUnitOfWork();

// Load settings
const settings = await uow.timerSettings.load();

// Save settings
await uow.timerSettings.save({
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4
});

// Cleanup
await uow.dispose();
```

### Transaction Usage (Multiple Operations)

```typescript
const uow = createUnitOfWork();

try {
  await uow.executeInTransaction(async () => {
    // All these operations will be in one transaction
    await uow.timerSettings.save(newSettings);
    // await uow.history.addSession(session);
    // await uow.user.updateStats(stats);

    // If any operation fails, ALL will be rolled back
  });
} catch (error) {
  console.error('Transaction failed:', error);
}

await uow.dispose();
```

### Manual Transaction Control

```typescript
const uow = createUnitOfWork();

try {
  await uow.beginTransaction();

  // Do multiple operations
  await uow.timerSettings.save(settings);
  // await uow.otherRepo.doSomething();

  await uow.commit();
} catch (error) {
  await uow.rollback();
  throw error;
} finally {
  await uow.dispose();
}
```

### Dependency Injection (Testing)

```typescript
// Create mock Unit of Work for tests
const mockUow: IUnitOfWork = {
  timerSettings: {
    load: async () => ({ workDuration: 25, ... }),
    save: async () => {},
    reset: async () => {}
  },
  getDatabase: async () => mockDb,
  beginTransaction: async () => {},
  commit: async () => {},
  rollback: async () => {},
  executeInTransaction: async (work) => work(),
  dispose: async () => {}
};

// Inject into context
<TimerSettingsProvider unitOfWork={mockUow}>
  <App />
</TimerSettingsProvider>
```

## Benefits

### 1. Single Database Connection
- One connection shared across all repositories
- Better performance
- Easier connection pooling

### 2. Transaction Support
```typescript
// Atomic operations - all succeed or all fail
await uow.executeInTransaction(async () => {
  await uow.timerSettings.save(settings);
  await uow.userStats.increment('sessions_completed');
});
```

### 3. Testability
```typescript
// Easy to mock entire data layer
const mockUow = createMockUnitOfWork();
render(<App unitOfWork={mockUow} />);
```

### 4. Centralized Access
```typescript
// Access all repositories from one place
const uow = createUnitOfWork();
const settings = await uow.timerSettings.load();
const history = await uow.history.getRecent();
```

### 5. Resource Management
```typescript
// Automatic cleanup
onCleanup(async () => {
  await unitOfWork.dispose();
});
```

## Adding New Repositories

### 1. Create Repository Interface

```typescript
// repositories/IUserRepository.ts
export interface IUserRepository {
  getById(id: number): Promise<User>;
  save(user: User): Promise<void>;
}
```

### 2. Create Implementation

```typescript
// repositories/UserRepository.ts
export class SqliteUserRepository implements IUserRepository {
  constructor(private unitOfWork: IUnitOfWork) {}

  async getById(id: number): Promise<User> {
    const db = await this.unitOfWork.getDatabase();
    // ... implementation
  }
}
```

### 3. Add to Unit of Work

```typescript
// SqliteUnitOfWork.ts
export class SqliteUnitOfWork implements IUnitOfWork {
  private _userRepository?: IUserRepository;

  get users(): IUserRepository {
    if (!this._userRepository) {
      this._userRepository = new SqliteUserRepository(this);
    }
    return this._userRepository;
  }
}
```

### 4. Use in Context

```typescript
const user = await unitOfWork.users.getById(1);
```

## Best Practices

1. **Always dispose** - Call `dispose()` when done
2. **Use transactions** - For multiple related operations
3. **Handle errors** - Wrap in try/catch, rollback on error
4. **Inject for tests** - Use dependency injection for testability
5. **One UoW per request** - Don't share across multiple operations
6. **Keep it simple** - Don't over-engineer, add features as needed

## Future Enhancements

- [ ] Add HistoryRepository for session tracking
- [ ] Add UserRepository for user preferences
- [ ] Add StatisticsRepository for analytics
- [ ] Add connection pooling
- [ ] Add query caching
- [ ] Add migration versioning
