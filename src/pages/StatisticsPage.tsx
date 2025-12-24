/**
 * Statistics Page Component
 * Displays comprehensive session statistics with overview and timeline views
 * Refactored following OOP, DRY, and clean code principles
 */

import { createSignal, Show } from "solid-js";
import { useSessionTracking } from "../contexts/SessionTrackingContext";
import { useStatistics } from "../hooks/useStatistics";
import { getDateString } from "../utils/dateUtils";
import SessionTimeline from "../components/SessionTimeline";
import {
  TodaySummaryCard,
  WeeklyOverviewCard,
  AllTimeStatsCard,
} from "../components/StatisticsCards";
import { BreakActivitiesCard } from "../components/BreakActivitiesCard";
import { TimerRunningAlert } from "../components/TimerRunningAlert";
import SettingsComparisonView from "../components/SettingsComparisonView";

function StatisticsPage() {
  const {
    todayStats,
    streakInfo,
    isLoading: contextLoading,
  } = useSessionTracking();

  const { weeklyStats, allTimeStats, todaySessions, isLoading } = useStatistics();
  const [activeTab, setActiveTab] = createSignal<"overview" | "timeline" | "settings">("overview");

  // Refresh data on mount (already handled in hooks)
  // The useStatistics hook handles loading on mount

  return (
    <div class="container mx-auto p-4 max-w-6xl">
      <TimerRunningAlert />
      
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Statistics</h1>

        {/* Tab Navigation */}
        <div class="tabs tabs-boxed">
          <button
            class={`tab ${activeTab() === "overview" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <i class="ri-dashboard-line mr-2"></i>
            Overview
          </button>
          <button
            class={`tab ${activeTab() === "timeline" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            <i class="ri-time-line mr-2"></i>
            Timeline
          </button>
          <button
            class={`tab ${activeTab() === "settings" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <i class="ri-settings-3-line mr-2"></i>
            By Settings
          </button>
        </div>
      </div>

      <Show
        when={!isLoading() && !contextLoading()}
        fallback={
          <div class="flex justify-center items-center h-64">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
        }
      >
        {/* Timeline View */}
        <Show when={activeTab() === "timeline"}>
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
        <Show when={activeTab() === "overview"}>
          {/* Today's Summary */}
          <TodaySummaryCard todayStats={todayStats()} streakInfo={streakInfo()} />

          {/* Weekly Overview */}
          <WeeklyOverviewCard weeklyStats={weeklyStats()} />

          {/* Break Activities */}
          <BreakActivitiesCard todayStats={todayStats()} />

          {/* All-Time Stats */}
          <AllTimeStatsCard allTimeStats={allTimeStats()} streakInfo={streakInfo()} />
        </Show>

        {/* By Settings Tab */}
        <Show when={activeTab() === "settings"}>
          <SettingsComparisonView />
        </Show>
      </Show>
    </div>
  );
}

export default StatisticsPage;
