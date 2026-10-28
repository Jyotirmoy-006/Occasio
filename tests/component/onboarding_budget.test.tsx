import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlanProvider } from '@/lib/context/PlanContext';
import { BudgetView } from '@/components/budget/BudgetView';
import { ChecklistView } from '@/components/checklist/ChecklistView';
import { CopilotView } from '@/components/copilot/CopilotView';

function renderWithPlan(ui: React.ReactElement) {
  return render(<PlanProvider>{ui}</PlanProvider>);
}

describe('Component Tests: Budget, Checklist & Copilot Interactions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders BudgetView with allocation sliders and total budget', async () => {
    renderWithPlan(<BudgetView />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Budget & Allocation/i })).toBeInTheDocument();
      expect(screen.getAllByText(/Total Budget/i).length).toBeGreaterThan(0);
    });

    // Check that categories are rendered
    expect(screen.getAllByText('Venue').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Catering & Bar').length).toBeGreaterThan(0);

    // Range sliders exist
    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThan(0);
  });

  it('toggles category lock in BudgetView', async () => {
    renderWithPlan(<BudgetView />);

    await waitFor(() => {
      expect(screen.getAllByText('Venue').length).toBeGreaterThan(0);
    });

    const lockButtons = screen.getAllByLabelText(/Lock Venue/i);
    expect(lockButtons.length).toBeGreaterThan(0);
    fireEvent.click(lockButtons[0]!);

    await waitFor(() => {
      expect(screen.getAllByText(/Locked/i).length).toBeGreaterThan(0);
    });
  });

  it('renders ChecklistView with pipeline stages and question prompts', async () => {
    renderWithPlan(<ChecklistView />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Vendor Pipeline & Checklist/i })).toBeInTheDocument();
      expect(screen.getByText(/Responsible AI Policy/i)).toBeInTheDocument();
    });

    // Pipeline tabs
    const allStagesTab = screen.getByRole('tab', { name: /All Stages/i });
    expect(allStagesTab).toBeInTheDocument();
  });

  it('renders CopilotView with chat interface and suggested prompts', async () => {
    renderWithPlan(<CopilotView />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Planning Copilot/i })).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/Cut the total budget by 10%/i)).toBeInTheDocument();
    expect(screen.getByText('Cut total budget by 10%')).toBeInTheDocument();
  });
});
