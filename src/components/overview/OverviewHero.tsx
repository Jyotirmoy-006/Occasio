'use client';

import React from 'react';
import Image from 'next/image';
import type { Plan } from '@/domain/schemas/plan';
import { formatMoney, formatEventDate, pluralize } from '@/lib/format';
import { getHeroImage } from '@/content/images';
import {
  WeddingMotif,
  BirthdayMotif,
  CommunityMotif,
  CornerFlourish,
} from '@/components/icons/EventMotifs';
import { Calendar, Users, MapPin } from 'lucide-react';

interface OverviewHeroProps {
  plan: Plan;
  daysRemaining: number;
  totalBudgetMinor: number;
  provenanceLabel: string;
}

export function OverviewHero({
  plan,
  daysRemaining,
  totalBudgetMinor,
  provenanceLabel,
}: OverviewHeroProps) {
  const heroImg = getHeroImage(plan.eventType);

  const getEventIcon = () => {
    switch (plan.eventType) {
      case 'wedding':
        return <WeddingMotif className="w-8 h-8 text-[#FAF7F2]" />;
      case 'birthday':
        return <BirthdayMotif className="w-8 h-8 text-[#FAF7F2]" />;
      case 'community':
        return <CommunityMotif className="w-8 h-8 text-[#FAF7F2]" />;
    }
  };

  return (
    <section
      className="hero-surface rounded-2xl p-6 sm:p-10 relative overflow-hidden"
      aria-label="Event Summary"
    >
      {/* Corner Flourishes */}
      <CornerFlourish position="top-left" eventType={plan.eventType} className="w-7 h-7 absolute top-3 left-3 text-white/30" />
      <CornerFlourish position="top-right" eventType={plan.eventType} className="w-7 h-7 absolute top-3 right-3 text-white/30" />
      <CornerFlourish position="bottom-left" eventType={plan.eventType} className="w-7 h-7 absolute bottom-3 left-3 text-white/30" />
      <CornerFlourish position="bottom-right" eventType={plan.eventType} className="w-7 h-7 absolute bottom-3 right-3 text-white/30" />

      {/* Mobile 16:9 Banner Crop (0 CLS) */}
      <div className="md:hidden w-full aspect-[16/9] rounded-xl overflow-hidden relative mb-5 border border-white/20 shadow-inner">
        <Image
          src={heroImg.src}
          alt={heroImg.alt}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
          priority
          placeholder="blur"
          blurDataURL={heroImg.blurDataUrl}
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
        {/* Left Column: Title, Metadata, Ledger Line */}
        <div className="space-y-4 max-w-2xl flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            {getEventIcon()}
            <span className="text-[12px] font-sans font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-white/15 text-[#FAF7F2] border border-white/20">
              {plan.eventType}
            </span>
            <span className="text-[12px] font-sans text-[#FAF7F2]/90 px-2.5 py-0.5 rounded bg-black/30 border border-white/20">
              {provenanceLabel}
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF7F2] letterpress-dark leading-tight">
            {plan.eventName}
          </h2>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-[#FAF7F2]/90 pt-1">
            <span className="flex items-center gap-2 font-medium text-[#FAF7F2]">
              <Calendar className="w-4 h-4 stroke-[1.5] text-[#FAF7F2]/75 shrink-0" />
              {formatEventDate(plan.eventDate, { includeRelative: true })}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 stroke-[1.5] text-[#FAF7F2]/75 shrink-0" />
              {plan.city}
            </span>
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 stroke-[1.5] text-[#FAF7F2]/75 shrink-0" />
              {pluralize(plan.guestCount, 'guest')}
            </span>
          </div>

          {/* Total Budget Ledger Line in On-Dark Gold Foil */}
          <div className="pt-4 border-t border-white/15 flex flex-wrap items-baseline gap-3">
            <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-[#FAF7F2]/80">
              Total Planned Budget
            </span>
            <span className="font-serif text-2xl sm:text-4xl font-bold text-[#FAF7F2] tabular-nums foil-accent foil-accent-dark">
              {formatMoney(totalBudgetMinor, plan.currency, { hideZeroCents: true })}
            </span>
          </div>
        </div>

        {/* Right Column: Tall Arch Photo (4:5) + Countdown Medallion Seal (Desktop) */}
        <div className="hidden md:block relative shrink-0 w-64 lg:w-72">
          <div className="p-1.5 border border-white/25 rounded-t-[140px] rounded-b-xl bg-black/10">
            <div className="rounded-t-[136px] rounded-b-lg overflow-hidden relative aspect-[4/5] shadow-inner bg-black/20">
              <Image
                src={heroImg.src}
                alt={heroImg.alt}
                width={800}
                height={1000}
                className="w-full h-full object-cover"
                priority
                placeholder="blur"
                blurDataURL={heroImg.blurDataUrl}
              />
            </div>
          </div>

          {/* Circular Countdown Medallion Seal Overlapping Lower-Left Edge */}
          <div className="absolute -bottom-3 -left-3 w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-[var(--color-card,#FFFDF8)] text-ink border-2 border-[var(--color-foil-dark,#D9B65B)] shadow-xl flex flex-col items-center justify-center p-1.5 text-center select-none z-20">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[var(--color-accent)] leading-none tabular-nums">
              {daysRemaining > 0 ? daysRemaining : '★'}
            </span>
            <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted mt-0.5">
              {daysRemaining > 0 ? 'Days' : 'Today'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

