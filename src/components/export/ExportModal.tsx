'use client';

import React, { useState, useRef } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { exportBudgetCsv, exportChecklistCsv } from '@/domain/export/csv';
import { generateICS } from '@/domain/timeline/ics';
import { exportPlanJSON, importPlanJSON } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Upload,
  Printer,
  FileSpreadsheet,
  Calendar,
  FileCode,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export function ExportModal({ isOpen, onClose }: { isOpen?: boolean; onClose: () => void }) {
  const { plan, setPlan } = usePlan();
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isOpen === false || !plan) return null;

  // Print-friendly view
  const handlePrint = () => {
    window.print();
  };

  // CSV Budget
  const handleDownloadBudgetCsv = () => {
    const csv = exportBudgetCsv(plan.budget, plan.currency);
    downloadFile(csv, `${slugify(plan.eventName)}-budget.csv`, 'text/csv');
  };

  // CSV Checklist
  const handleDownloadChecklistCsv = () => {
    const csv = exportChecklistCsv(plan.checklist, plan.currency);
    downloadFile(csv, `${slugify(plan.eventName)}-checklist.csv`, 'text/csv');
  };

  // ICS Timeline
  const handleDownloadIcs = () => {
    const ics = generateICS(plan.timeline, plan.eventName);
    downloadFile(ics, `${slugify(plan.eventName)}-timeline.ics`, 'text/calendar');
  };

  // JSON Backup
  const handleDownloadJson = () => {
    const json = exportPlanJSON(plan);
    downloadFile(json, `${slugify(plan.eventName)}-backup.json`, 'application/json');
  };

  // Safe JSON Import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 512 * 1024) {
      setImportStatus({ success: false, message: 'File exceeds maximum 512 KB limit.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importPlanJSON(text);
        setPlan(imported);
        setImportStatus({ success: true, message: `Successfully loaded "${imported.eventName}"!` });
      } catch (err) {
        setImportStatus({
          success: false,
          message: err instanceof Error ? err.message : 'Invalid plan backup file.',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
    >
      <Card className="w-full max-w-lg bg-paper border border-border shadow-2xl p-6 space-y-6 text-left animate-slide-up">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-xs font-mono uppercase text-ink-muted">Data Portability</span>
            <h2 id="export-dialog-title" className="text-xl font-serif text-ink">Export & Backup</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ink-muted hover:text-ink rounded min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close export dialog"
          >
            ✕
          </button>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-md text-xs flex items-center gap-2 ${
              importStatus.success ? 'bg-success-bg text-success' : 'bg-error-bg text-error'
            }`}
          >
            {importStatus.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{importStatus.message}</span>
          </div>
        )}

        {/* Options Grid */}
        <div className="space-y-3">
          {/* Print PDF View */}
          <button
            onClick={handlePrint}
            className="w-full p-3.5 rounded-md border border-border hover:bg-surface flex items-center justify-between text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Printer className="w-5 h-5 text-[var(--color-accent)]" />
              <div>
                <span className="text-sm font-medium text-ink block">Print-Friendly PDF</span>
                <span className="text-xs text-ink-muted">Formatted editorial sheet optimized for browser printing & PDF save</span>
              </div>
            </div>
            <span className="text-xs font-mono text-ink-muted group-hover:text-ink">Print</span>
          </button>

          {/* Budget CSV */}
          <button
            onClick={handleDownloadBudgetCsv}
            className="w-full p-3.5 rounded-md border border-border hover:bg-surface flex items-center justify-between text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-success" />
              <div>
                <span className="text-sm font-medium text-ink block">Budget CSV</span>
                <span className="text-xs text-ink-muted">Compatible with Excel, Google Sheets, Numbers</span>
              </div>
            </div>
            <span className="text-xs font-mono text-ink-muted group-hover:text-ink">.CSV</span>
          </button>

          {/* Checklist CSV */}
          <button
            onClick={handleDownloadChecklistCsv}
            className="w-full p-3.5 rounded-md border border-border hover:bg-surface flex items-center justify-between text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-warning" />
              <div>
                <span className="text-sm font-medium text-ink block">Checklist CSV</span>
                <span className="text-xs text-ink-muted">Vendor pipeline, questions to ask, and recorded quotes</span>
              </div>
            </div>
            <span className="text-xs font-mono text-ink-muted group-hover:text-ink">.CSV</span>
          </button>

          {/* Timeline ICS */}
          <button
            onClick={handleDownloadIcs}
            className="w-full p-3.5 rounded-md border border-border hover:bg-surface flex items-center justify-between text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[var(--color-accent)]" />
              <div>
                <span className="text-sm font-medium text-ink block">Timeline Calendar (.ICS)</span>
                <span className="text-xs text-ink-muted">Import into Apple Calendar, Google Calendar, Outlook</span>
              </div>
            </div>
            <span className="text-xs font-mono text-ink-muted group-hover:text-ink">.ICS</span>
          </button>

          {/* JSON Full Backup */}
          <button
            onClick={handleDownloadJson}
            className="w-full p-3.5 rounded-md border border-border hover:bg-surface flex items-center justify-between text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <FileCode className="w-5 h-5 text-ink" />
              <div>
                <span className="text-sm font-medium text-ink block">Complete JSON Backup</span>
                <span className="text-xs text-ink-muted">Full plan state for backup or transfer to another device</span>
              </div>
            </div>
            <span className="text-xs font-mono text-ink-muted group-hover:text-ink">.JSON</span>
          </button>
        </div>

        {/* Restore / Import Section */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-ink block">Restore from Backup</span>
            <span className="text-[11px] text-ink-muted">Upload a valid Occasio JSON file</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
            aria-label="Upload JSON backup"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2 min-h-[44px]"
          >
            <Upload className="w-4 h-4" />
            <span>Import JSON</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}
