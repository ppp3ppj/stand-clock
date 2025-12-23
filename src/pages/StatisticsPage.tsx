import { createSignal, onMount, For, Show } from "solid-js";
import { useSessionTracking } from "../contexts/SessionTrackingContext";
import { DailyStats, Session } from "../repositories/SessionTrackingRepository";
import { createUnitOfWork } from "../repositories/SqliteUnitOfWork";
import SessionTimeline from "../components/SessionTimeline";

function StatisticsPage() {
  const {
    todayStats,
    streakInfo,
    refreshTodayStats,
    refreshStreak,
    isLoading: contextLoading,
  } = useSessionTracking();

  const [weeklyStats, setWeeklyStats] = createSignal<DailyStats[]>([]);
  const [allTimeStats, setAllTimeStats] = createSignal({
    totalSessions: 0,
    totalFocusHours: 0,
    bestFocusScore: 0,
  });
  const [todaySessions, setTodaySessions] = createSignal<Session[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [activeTab, setActiveTab] = createSignal<'overview' | 'timeline'>('overview');

  // Get date string in YYYY-MM-DD format
  const getDateString = (daysAgo: number = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format time in hours and minutes
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Load statistics on mount
  onMount(async () => {
    try {
      await refreshTodayStats();
      await refreshStreak();

      // Load weekly stats (last 7 days)
      const unitOfWork = createUnitOfWork();
      const startDate = getDateString(6); // 6 days ago
      const endDate = getDateString(0);   // today
      const stats = await unitOfWork.sessionTracking.getDateRangeStats(startDate, endDate);
      setWeeklyStats(stats);

      // Load all-time stats
      const allTime = await unitOfWork.sessionTracking.getAllTimeStats();
      setAllTimeStats(allTime);

      // Load today's sessions for timeline
      const sessions = await unitOfWork.sessionTracking.getSessionsForDate(getDateString(0));
      setTodaySessions(sessions);

      await unitOfWork.dispose();
    } catch (error) {
      console.error("[StatisticsPage] Failed to load statistics:", error);
    } finally {
      setIsLoading(false);
    }
  });

  // Calculate weekly totals
  const weeklyTotals = () => {
    const stats = weeklyStats();
    return {
      sessions: stats.reduce((sum, day) => sum + day.workSessionsCompleted, 0),
      workTime: stats.reduce((sum, day) => sum + day.totalWorkTime, 0),
      avgDuration: stats.length > 0
        ? stats.reduce((sum, day) => sum + day.totalWorkTime, 0) / stats.reduce((sum, day) => sum + day.workSessionsCompleted, 0) || 0
        : 0,
      mostProductiveDay: stats.reduce((max, day) =>
        day.workSessionsCompleted > max.workSessionsCompleted ? day : max,
        stats[0] || { date: '', workSessionsCompleted: 0 }
      ),
    };
  };

  // Calculate break activity distribution
  const breakActivities = () => {
    const today = todayStats();
    const total = today.standingBreaks + today.walkingBreaks + today.stretchingBreaks + today.otherBreaks;
    if (total === 0) return [];

    return [
      { name: 'Standing', count: today.standingBreaks, icon: 'ri-user-line', percent: (today.standingBreaks / total) * 100 },
      { name: 'Walking', count: today.walkingBreaks, icon: 'ri-walk-line', percent: (today.walkingBreaks / total) * 100 },
      { name: 'Stretching', count: today.stretchingBreaks, icon: 'ri-body-scan-line', percent: (today.stretchingBreaks / total) * 100 },
      { name: 'Other', count: today.otherBreaks, icon: 'ri-more-2-line', percent: (today.otherBreaks / total) * 100 },
    ].filter(activity => activity.count > 0);
  };

  return (
    <div class="container mx-auto p-4 max-w-6xl">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Statistics</h1>

        {/* Tab Navigation */}
        <div class="tabs tabs-boxed">
          <button
            class={`tab ${activeTab() === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i class="ri-dashboard-line mr-2"></i>
            Overview
          </button>
          <button
            class={`tab ${activeTab() === 'timeline' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <i class="ri-time-line mr-2"></i>
            Timeline
          </button>
        </div>
      </div>

      <Show when={!isLoading() && !contextLoading()} fallback={
        <div class="flex justify-center items-center h-64">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
      }>
        {/* Timeline View */}
        <Show when={activeTab() === 'timeline'}>
          <div class="card bg-base-200 shadow-xl mb-6">
            <div class="card-body">
              <h2 class="card-title text-2xl mb-4">
                <i class="ri-calendar-line"></i>
                Today's Timeline
              </h2>
              <p class="text-sm opacity-70 mb-4">
                Chronological view of all your sessions today
              </p>
              <SessionTimeline sessions={todaySessions()} date={getDateString(0)} />
            </div>
          </div>
        </Show>

        {/* Overview Tab */}
        <Show when={activeTab() === 'overview'}>
        {/* Today's Summary */}
        <div class="card bg-base-200 shadow-xl mb-6">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">
              <i class="ri-calendar-line"></i>
              Today's Summary
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="stat bg-base-300 rounded-lg">
                <div class="stat-figure text-primary">
                  <i class="ri-checkbox-circle-line text-3xl"></i>
                </div>
                <div class="stat-title">Completed</div>
                <div class="stat-value text-primary">{todayStats().workSessionsCompleted}</div>
                <div class="stat-desc">work sessions</div>
              </div>

              <div class="stat bg-base-300 rounded-lg">
                <div class="stat-figure text-secondary">
                  <i class="ri-time-line text-3xl"></i>
                </div>
                <div class="stat-title">Focus Time</div>
                <div class="stat-value text-secondary">{formatTime(todayStats().totalWorkTime)}</div>
                <div class="stat-desc">total work time</div>
              </div>

              <div class="stat bg-base-300 rounded-lg">
                <div class="stat-figure text-accent">
                  <i class="ri-percent-line text-3xl"></i>
                </div>
                <div class="stat-title">Completion</div>
                <div class="stat-value text-accent">{todayStats().completionRate}%</div>
                <div class="stat-desc">of started sessions</div>
              </div>

              <div class="stat bg-base-300 rounded-lg">
                <div class="stat-figure text-warning">
                  <i class="ri-fire-line text-3xl"></i>
                </div>
                <div class="stat-title">Streak</div>
                <div class="stat-value text-warning">{streakInfo().currentStreak}</div>
                <div class="stat-desc">consecutive days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Overview */}
        <div class="card bg-base-200 shadow-xl mb-6">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">
              <i class="ri-calendar-week-line"></i>
              Last 7 Days
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="stat bg-base-300 rounded-lg">
                <div class="stat-title">Total Sessions</div>
                <div class="stat-value text-primary">{weeklyTotals().sessions}</div>
                <div class="stat-desc">this week</div>
              </div>

              <div class="stat bg-base-300 rounded-lg">
                <div class="stat-title">Total Work Time</div>
                <div class="stat-value text-secondary">{formatTime(weeklyTotals().workTime)}</div>
                <div class="stat-desc">focus hours</div>
              </div>

              <div class="stat bg-base-300 rounded-lg">
                <div class="stat-title">Most Productive</div>
                <div class="stat-value text-accent text-2xl">
                  {formatDate(weeklyTotals().mostProductiveDay.date)}
                </div>
                <div class="stat-desc">{weeklyTotals().mostProductiveDay.workSessionsCompleted} sessions</div>
              </div>
            </div>

            {/* Weekly Chart */}
            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sessions</th>
                    <th>Work Time</th>
                    <th>Breaks</th>
                    <th>Completion</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={weeklyStats()}>
                    {(day) => (
                      <tr>
                        <td class="font-medium">{formatDate(day.date)}</td>
                        <td>
                          <div class="flex items-center gap-2">
                            <span class="font-bold text-primary">{day.workSessionsCompleted}</span>
                            <Show when={day.workSessionsSkipped > 0}>
                              <span class="text-xs opacity-50">({day.workSessionsSkipped} skipped)</span>
                            </Show>
                          </div>
                        </td>
                        <td>{formatTime(day.totalWorkTime)}</td>
                        <td>{day.breakSessionsCompleted}</td>
                        <td>
                          <div class="flex items-center gap-2">
                            <progress
                              class="progress progress-primary w-20"
                              value={day.completionRate}
                              max="100"
                            ></progress>
                            <span class="text-sm">{day.completionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Break Activities */}
        <Show when={breakActivities().length > 0}>
          <div class="card bg-base-200 shadow-xl mb-6">
            <div class="card-body">
              <h2 class="card-title text-2xl mb-4">
                <i class="ri-cup-line"></i>
                Today's Break Activities
              </h2>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <For each={breakActivities()}>
                  {(activity) => (
                    <div class="card bg-base-300">
                      <div class="card-body items-center text-center p-4">
                        <i class={`${activity.icon} text-4xl text-primary`}></i>
                        <h3 class="font-bold">{activity.name}</h3>
                        <div class="stat-value text-2xl">{activity.count}</div>
                        <div class="text-xs opacity-60">{Math.round(activity.percent)}%</div>
                      </div>
                    </div>
                  )}
                </For>
              </div>

              <div class="mt-4">
                <div class="flex items-center gap-2 text-sm">
                  <i class="ri-time-line"></i>
                  <span>Standing/Walking: {formatTime(todayStats().totalStandingTime)}</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <i class="ri-body-scan-line"></i>
                  <span>Exercise/Stretching: {formatTime(todayStats().totalExerciseTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </Show>

        {/* All-Time Stats */}
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">
              <i class="ri-trophy-line"></i>
              All-Time Statistics
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="stat bg-base-300 rounded-lg">
                <div class="stat-figure text-primary">
                  <i class="ri-checkbox-circle-line text-3xl"></i>
                </div>
                <div class="stat-title">Total Sessions</div>
                <div class="stat-value text-primary">{allTimeStats().totalSessions}</div>
                <div class="stat-desc">completed ever</div>
              </div>

              <div class="stat bg-base-300 rounded-lg">
                <div class="stat-figure text-secondary">
                  <i class="ri-time-line text-3xl"></i>
                </div>
                <div class="stat-title">Total Focus Hours</div>
                <div class="stat-value text-secondary">{allTimeStats().totalFocusHours}h</div>
                <div class="stat-desc">all-time work time</div>
              </div>

              <div class="stat bg-base-300 rounded-lg">
                <div class="stat-figure text-warning">
                  <i class="ri-fire-line text-3xl"></i>
                </div>
                <div class="stat-title">Longest Streak</div>
                <div class="stat-value text-warning">{streakInfo().longestStreak}</div>
                <div class="stat-desc">consecutive days</div>
              </div>
            </div>
          </div>
        </div>
        </Show>
        {/* End Overview Tab */}

      </Show>
      {/* End Loading Show */}
    </div>
  );
}

export default StatisticsPage;
