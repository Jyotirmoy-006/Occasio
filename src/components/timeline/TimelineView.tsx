'use client';

import React, { useState } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { daysUntilEvent, parseLocalDate, formatISODate } from '@/domain/timeline/generate';
import { generateICS } from '@/domain/timeline/ics';
import type { MilestoneStatus } from '@/domain/schemas/timeline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Calendar,
  Clock,
  Download,
  CheckCircle2,
  Circle,
  Clock3,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  List,
  BarChart2,
  AlertCircle,
} from 'lucide-react';

export function TimelineView() {
  const { plan, updatePlan } = usePlan();
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!plan) return null;

  const { timeline, eventDate, eventName } = plan;
  const daysRemaining = daysUntilEvent(eventDate);
  const isPast = daysRemaining < 0;

  // Status toggle handler
  const handleStatusChange = (milestoneId: string, nextStatus: MilestoneStatus) => {
    updatePlan((prev) => ({
      ...prev,
      timeline: {
        milestones: prev.timeline.milestones.map((m) =>
          m.id === milestoneId ? { ...m, status: nextStatus } : m,
        ),
      },
    }));
  };

  // Keyboard and button rescheduling (shifts due date by +/- 7 days)
  const handleShiftMilestone = (milestoneId: string, daysShift: number) => {
    updatePlan((prev) => ({
      ...prev,
      timeline: {
        milestones: prev.timeline.milestones
          .map((m) => {
            if (m.id !== milestoneId) return m;
            const current = parseLocalDate(m.dueDate);
            const shifted = new Date(current.getTime() + daysShift * 24 * 60 * 60 * 1000);
            return {
              ...m,
              dueDate: formatISODate(shifted),
            };
          })
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      },
    }));
  };

  // Export to .ics
  const handleExportIcs = () => {
    const ics = generateICS(timeline, eventName);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventName.toLowerCase().replace(/\s+/g, '-')}-timeline.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = ['all', ...Array.from(new Set(timeline.milestones.map((m) => m.category)))];
  const filteredMilestones =
    filterCategory === 'all'
      ? timeline.milestones
      : timeline.milestones.filter((m) => m.category === filterCategory);

  const completedCount = timeline.milestones.filter((m) => m.status === 'done').length;
  const totalCount = timeline.milestones.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'in-progress':
        return <Clock3 className="w-4 h-4 text-warning" />;
      case 'skipped':
        return <SkipForward className="w-4 h-4 text-ink-muted" />;
      default:
        return <Circle className="w-4 h-4 text-ink-muted" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-ink-muted">Milestone Roadmap</span>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink mt-1">Timeline & Milestones</h1>
          <p className="text-sm text-ink-muted mt-1">
            Backward-planned milestones from your event date with accessible rescheduling controls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-md overflow-hidden bg-surface">
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${
                viewMode === 'list' ? 'bg-paper text-ink font-medium shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              aria-label="Gantt chart view"
              className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${
                viewMode === 'gantt' ? 'bg-paper text-ink font-medium shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExportIcs} className="gap-2">
            <Download className="w-4 h-4" />
            <span>Export .ICS</span>
          </Button>
        </div>
      </div>

      {/* Countdown and Progress Hero Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Days Countdown */}
        <Card className="border-l-4 border-l-[var(--color-accent)]">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Event Countdown</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-serif text-ink tabular-nums">
              {isPast ? 'Event Passed' : `${daysRemaining}`}
            </span>
            {!isPast && <span className="text-sm font-sans text-ink-muted">days remaining</span>}
          </div>
          <span className="text-xs text-ink-muted mt-1 block flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {eventDate}
          </span>
        </Card>

        {/* Completion Progress */}
        <Card>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Milestones Completed</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl sm:text-4xl font-serif text-ink tabular-nums">
              {completedCount} <span className="text-base text-ink-muted font-sans">/ {totalCount}</span>
            </span>
            <span className="text-sm font-mono text-[var(--color-accent)] font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-surface h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-[var(--color-accent)] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-label="Milestone completion progress"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </Card>

        {/* Critical Path Notice */}
        <Card>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Critical Path</span>
          <p className="text-sm font-medium text-ink mt-1">
            {timeline.milestones.filter((m) => m.isCritical && m.status !== 'done').length} critical milestones pending
          </p>
          <p className="text-xs text-ink-muted mt-2">
            Venues, caterers, and key bookings require priority scheduling to guarantee availability.
          </p>
        </Card>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 pt-2" role="tablist" aria-label="Filter milestones by category">
        {categories.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={filterCategory === cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-full border transition-colors cursor-pointer select-none ${
              filterCategory === cat
                ? 'bg-ink text-paper border-ink'
                : 'bg-paper text-ink-muted border-border hover:bg-surface hover:text-ink'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Views: List or Horizontal Gantt */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredMilestones.map((milestone) => (
            <Card
              key={milestone.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-colors ${
                milestone.status === 'done' ? 'opacity-70 bg-surface/40' : 'bg-paper'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Status Toggle Menu */}
                <button
                  onClick={() => {
                    const nextMap: Record<MilestoneStatus, MilestoneStatus> = {
                      pending: 'in-progress',
                      'in-progress': 'done',
                      done: 'pending',
                      completed: 'pending',
                      skipped: 'pending',
                    };
                    handleStatusChange(milestone.id, nextMap[milestone.status]);
                  }}
                  className="mt-0.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md hover:bg-surface cursor-pointer text-ink"
                  aria-label={`Toggle status for ${milestone.label}, currently ${milestone.status}`}
                >
                  {getStatusIcon(milestone.status)}
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-medium text-sm text-ink ${
                        milestone.status === 'done' ? 'line-through text-ink-muted' : ''
                      }`}
                    >
                      {milestone.label}
                    </span>
                    {milestone.isCritical && (
                      <Badge variant="warning" icon={<AlertCircle className="w-3 h-3" />}>
                        Critical
                      </Badge>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded bg-surface border border-border text-ink-muted">
                      {milestone.category}
                    </span>
                  </div>
                  {milestone.description && (
                    <p className="text-xs text-ink-muted mt-1 max-w-xl">{milestone.description}</p>
                  )}
                </div>
              </div>

              {/* Due Date & Accessible Reschedule Steppers */}
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <div className="text-right">
                  <span className="text-xs font-mono font-medium text-ink tabular-nums flex items-center gap-1">
                    <Clock className="w-3 h-3 text-ink-muted" />
                    {milestone.dueDate}
                  </span>
                  <span className="text-xs text-ink-muted block font-mono">
                    {milestone.weeksBeforeEvent}w prior
                  </span>
                </div>

                {/* Reschedule Button Stepper (Accessible Keyboard Alternative to Drag) */}
                <div className="flex items-center border border-border rounded-md bg-surface">
                  <button
                    onClick={() => handleShiftMilestone(milestone.id, -7)}
                    aria-label={`Move ${milestone.label} 1 week earlier`}
                    className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-paper rounded-l text-ink-muted hover:text-ink cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleShiftMilestone(milestone.id, 7)}
                    aria-label={`Move ${milestone.label} 1 week later`}
                    className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-paper rounded-r text-ink-muted hover:text-ink cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Horizontal Gantt Chart View */
        <Card className="overflow-x-auto p-6">
          <div className="min-w-[640px] space-y-4">
            <div className="border-b border-border pb-2 flex justify-between text-xs font-mono text-ink-muted">
              <span>Weeks Before Event</span>
              <span>Event Date ({eventDate})</span>
            </div>
            {filteredMilestones.map((m) => {
              // Position relative to a 52-week max scale
              const maxWeeks = 52;
              const leftPercent = Math.max(5, Math.min(90, 100 - (m.weeksBeforeEvent / maxWeeks) * 100));

              return (
                <div key={m.id} className="relative py-2 flex items-center">
                  <div className="w-48 text-xs font-medium text-ink truncate pr-4">{m.label}</div>
                  <div className="flex-1 relative h-6 bg-surface/50 rounded-md flex items-center">
                    <div
                      className={`absolute px-2.5 py-1 rounded text-xs text-white font-mono flex items-center gap-1 shadow-sm ${
                        m.status === 'done'
                          ? 'bg-success'
                          : m.isCritical
                          ? 'bg-warning'
                          : 'bg-[var(--color-accent)]'
                      }`}
                      style={{ left: `${leftPercent}%` }}
                    >
                      <span>{m.dueDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
