'use client';

import React, { useRef, useState } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { exportBudgetCsv, exportChecklistCsv } from '@/domain/export/csv';
import { generateICS } from '@/domain/timeline/ics';
import { exportPlanJSON, importPlanJSON } from '@/lib/storage';
import { ExportModalBody } from './ExportModalBody';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { plan, setPlan } = usePlan();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen || !plan) return null;

  const handlePrint = () => window.print();

  const handleDownloadBudgetCsv = () => {
    const csv = exportBudgetCsv(plan.budget, plan.currency);
    downloadFile(csv, `${slugify(plan.eventName)}-budget.csv`, 'text/csv');
  };

  const handleDownloadChecklistCsv = () => {
    const csv = exportChecklistCsv(plan.checklist, plan.currency);
    downloadFile(csv, `${slugify(plan.eventName)}-checklist.csv`, 'text/csv');
  };

  const handleDownloadIcs = () => {
    const ics = generateICS(plan.timeline, plan.eventName);
    downloadFile(ics, `${slugify(plan.eventName)}-timeline.ics`, 'text/calendar');
  };

  const handleDownloadJson = () => {
    const json = exportPlanJSON(plan);
    downloadFile(json, `${slugify(plan.eventName)}-backup.json`, 'application/json');
  };

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
        const text = event.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Could not read file as text.');
        }
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
      <ExportModalBody
        onClose={onClose}
        importStatus={importStatus}
        onPrint={handlePrint}
        onDownloadBudgetCsv={handleDownloadBudgetCsv}
        onDownloadChecklistCsv={handleDownloadChecklistCsv}
        onDownloadIcs={handleDownloadIcs}
        onDownloadJson={handleDownloadJson}
        onFileImport={handleFileImport}
        fileInputRef={fileInputRef}
      />
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
