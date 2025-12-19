# Stand Clock - Architecture Documentation

## Technology Stack

- **Frontend**: Solid.js + TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **Backend**: Rust (Tauri 2)
- **Database**: SQLite
- **Build Tool**: Vite
- **Router**: @solidjs/router

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   HomePage   │  │TimerSettings │  │SettingsPage  │      │
│  │  Component   │  │    Page      │  │  (Theme)     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
└─────────┼─────────────────┼──────────────────┼───────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────┐  ┌──────────────────────┐    │
│  │ TimerSettingsContext     │  │   ThemeContext       │    │
│  │  (State Management)      │  │  (State Management)  │    │
│  └──────────┬───────────────┘  └──────────┬───────────┘    │
│             │                              │                 │
└─────────────┼──────────────────────────────┼─────────────────┘
              │                              │
              ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
│  ┌─────────────────────────┐          ┌──────────────┐     │
│  │   Unit of Work          │          │ localStorage │     │
│  │  (SqliteUnitOfWork)     │          │              │     │
│  └───────────┬─────────────┘          └──────────────┘     │
│              │                                               │
│    ┌─────────┼─────────────────┐                           │
│    ▼         ▼                 ▼                            │
│  ┌────────────────┐  ┌─────────────┐                       │
│  │ TimerSettings  │  │   Future:   │                       │
│  │  Repository    │  │  - History  │                       │
│  └────────┬───────┘  │  - Stats    │                       │
│           │          └─────────────┘                        │
└───────────┼──────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│  ┌──────────────────────────────────────────────────┐       │
│  │              SQLite Database                      │       │
│  │  ┌──────────────────┐  ┌──────────────────┐     │       │
│  │  │ timer_settings   │  │   users (demo)   │     │       │
│  │  └──────────────────┘  └──────────────────┘     │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Design Patterns

### 1. Repository Pattern
**Purpose**: Abstract data access logic

**Implementation**:
```typescript
interface ITimerSettingsRepository {
  load(): Promise<TimerSettings>;
  save(settings: TimerSettings): Promise<void>;
  reset(): Promise<void>;
}
```

**Benefits**:
- Testable (easy to mock)
- Flexible (swap SQLite for API)
- Clean separation of concerns

### 2. Unit of Work Pattern
**Purpose**: Manage transactions and coordinate repositories

**Implementation**:
```typescript
interface IUnitOfWork {
  timerSettings: ITimerSettingsRepository;
  getDatabase(): Promise<Database>;
  executeInTransaction<T>(work: () => Promise<T>): Promise<T>;
  dispose(): Promise<void>;
}
```

**Benefits**:
- Single database connection
- Transaction support
- Centralized resource management

### 3. Dependency Injection
**Purpose**: Enable testing and flexibility

**Implementation**:
```typescript
<TimerSettingsProvider unitOfWork={mockUow}>
  <App />
</TimerSettingsProvider>
```

**Benefits**:
- Easy unit testing
- Loose coupling
- Runtime flexibility

### 4. Context API (State Management)
**Purpose**: Share state across components

**Implementation**:
```typescript
const { settings, updateSettings } = useTimerSettings();
```

**Benefits**:
- No prop drilling
- Reactive updates
- Clean API

## Data Flow

### Reading Settings
```
User opens page
     ↓
TimerSettingsPage renders
     ↓
useTimerSettings() hook called
     ↓
Context loads from UnitOfWork
     ↓
UnitOfWork.timerSettings.load()
     ↓
Repository queries SQLite
     ↓
Data returned to component
     ↓
UI updates with settings
```

### Saving Settings
```
User changes slider
     ↓
Local state updates (instant feedback)
     ↓
User clicks "Save"
     ↓
Context.updateSettings() called
     ↓
UnitOfWork.timerSettings.save()
     ↓
Repository executes UPDATE query
     ↓
SQLite persists data
     ↓
Context state updates
     ↓
"Unsaved changes" alert disappears
```

## Project Structure

```
stand-clock/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── ThemeSelector.tsx
│   │
│   ├── contexts/            # State management
│   │   ├── ThemeContext.tsx
│   │   └── TimerSettingsContext.tsx
│   │
│   ├── pages/               # Route pages
│   │   ├── HomePage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── TimerSettingsPage.tsx
│   │
│   ├── repositories/        # Data access layer
│   │   ├── IUnitOfWork.ts
│   │   ├── SqliteUnitOfWork.ts
│   │   ├── TimerSettingsRepository.ts
│   │   └── README.md
│   │
│   ├── App.tsx             # Router & Layout
│   ├── App.css             # Global styles
│   └── index.tsx           # Entry point
│
├── src-tauri/              # Rust backend
│   └── src/
│       └── lib.rs          # DB migrations & commands
│
└── index.html              # HTML template
```

## Key Features

### 1. Theme System
- **Storage**: localStorage
- **Themes**: 32 DaisyUI themes
- **FOUC Prevention**: Inline script loads theme before app
- **Context**: ThemeContext manages state

### 2. Timer Settings
- **Storage**: SQLite database
- **Pattern**: Repository + Unit of Work
- **Features**:
  - Work duration (5-120 min)
  - Short break (1-15 min)
  - Long break (10-30 min)
  - Sessions before long break (2-8)
  - Preset buttons
  - Range sliders
  - Unsaved changes detection
  - Reset to defaults

### 3. Routing
- **Library**: @solidjs/router v0.15.x
- **Pattern**: Nested routes with Layout component
- **Routes**:
  - `/` - Home page
  - `/timer-settings` - Timer configuration
  - `/settings` - Theme selection

## Database Schema

### timer_settings
```sql
CREATE TABLE timer_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),  -- Singleton pattern
  work_duration INTEGER NOT NULL DEFAULT 25,
  short_break_duration INTEGER NOT NULL DEFAULT 5,
  long_break_duration INTEGER NOT NULL DEFAULT 15,
  sessions_before_long_break INTEGER NOT NULL DEFAULT 4,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Future Enhancements

### Planned Features
- [ ] Pomodoro timer implementation
- [ ] Session history tracking
- [ ] Statistics dashboard
- [ ] Exercise recommendations
- [ ] Desktop notifications
- [ ] System tray integration
- [ ] Sound notifications
- [ ] Break exercises library

### Technical Improvements
- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Connection pooling
- [ ] Query caching
- [ ] Error boundaries
- [ ] Loading skeletons
- [ ] Offline support
- [ ] Data export/import

## Testing Strategy

### Unit Tests (Planned)
```typescript
describe('TimerSettingsRepository', () => {
  it('should load settings from database', async () => {
    const mockUow = createMockUnitOfWork();
    const repo = new SqliteTimerSettingsRepository(mockUow);
    const settings = await repo.load();
    expect(settings.workDuration).toBe(25);
  });
});
```

### Integration Tests (Planned)
```typescript
describe('TimerSettingsContext', () => {
  it('should save and load settings', async () => {
    const { updateSettings, settings } = renderWithProvider();
    await updateSettings({ workDuration: 30 });
    expect(settings().workDuration).toBe(30);
  });
});
```

## Performance Considerations

1. **Lazy Loading**: Repositories created on first access
2. **Single Connection**: One DB connection per UnitOfWork
3. **Reactive Updates**: Solid.js fine-grained reactivity
4. **Optimistic UI**: Local state updates immediately
5. **Theme Caching**: localStorage for instant theme load

## Security

1. **SQL Injection**: Parameterized queries ($1, $2, etc.)
2. **Input Validation**: Min/max ranges on sliders
3. **Error Handling**: Try/catch with fallbacks
4. **Sanitization**: DaisyUI escapes HTML automatically

## Developer Notes

### Adding a New Repository

1. Create interface in `repositories/I{Name}Repository.ts`
2. Create implementation in `repositories/{Name}Repository.ts`
3. Add to SqliteUnitOfWork as lazy-loaded property
4. Create migration in `src-tauri/src/lib.rs`
5. Create context in `contexts/{Name}Context.tsx`
6. Use in components via `use{Name}()` hook

### Debugging

- **Database**: Check `standclock.db` with SQLite browser
- **Context**: Look for `[ContextName]` logs in console
- **Repository**: Look for `[RepositoryName]` logs in console
- **Transactions**: Look for `[SqliteUnitOfWork]` logs

## Conclusion

This architecture provides:
- ✅ Clean separation of concerns
- ✅ Testable components
- ✅ Flexible data access
- ✅ Scalable structure
- ✅ Type safety
- ✅ Best practices
