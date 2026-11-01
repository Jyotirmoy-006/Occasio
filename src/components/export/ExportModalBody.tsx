'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Printer,
  FileSpreadsheet,
  Calendar,
  FileCode,
  Upload,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { ExportOptionItem } from './ExportOptionItem';

interface ExportModalBodyProps {
  onClose: () => void;
  importStatus: { success: boolean; message: string } | null;
  onPrint: () => void;
  onDownloadBudgetCsv: () => void;
  onDownloadChecklistCsv: () => void;
  onDownloadIcs: () => void;
  onDownloadJson: () => void;
  onFileImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function ExportModalBody({
  onClose,
  importStatus,
  onPrint,
  onDownloadBudgetCsv,
  onDownloadChecklistCsv,
  onDownloadIcs,
  onDownloadJson,
  onFileImport,
  fileInputRef,
}: ExportModalBodyProps) {
  return (
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

      <div className="space-y-3">
        <ExportOptionItem
          icon={<Printer className="w-5 h-5 text-[var(--color-accent)]" />}
          title="Print-Friendly PDF"
          description="Formatted editorial sheet optimized for browser printing & PDF save"
          badge="Print"
          onClick={onPrint}
        />
        <ExportOptionItem
          icon={<FileSpreadsheet className="w-5 h-5 text-success" />}
          title="Budget CSV"
          description="Compatible with Excel, Google Sheets, Numbers"
          badge=".CSV"
          onClick={onDownloadBudgetCsv}
        />
        <ExportOptionItem
          icon={<FileSpreadsheet className="w-5 h-5 text-warning" />}
          title="Checklist CSV"
          description="Vendor pipeline, questions to ask, and recorded quotes"
          badge=".CSV"
          onClick={onDownloadChecklistCsv}
        />
        <ExportOptionItem
          icon={<Calendar className="w-5 h-5 text-[var(--color-accent)]" />}
          title="Timeline Calendar (.ICS)"
          description="Import into Apple Calendar, Google Calendar, Outlook"
          badge=".ICS"
          onClick={onDownloadIcs}
        />
        <ExportOptionItem
          icon={<FileCode className="w-5 h-5 text-ink" />}
          title="Complete JSON Backup"
          description="Full plan state for backup or transfer to another device"
          badge=".JSON"
          onClick={onDownloadJson}
        />
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-ink block">Restore from Backup</span>
          <span className="text-[11px] text-ink-muted">Upload a valid Occasio JSON file</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={onFileImport}
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
  );
}
