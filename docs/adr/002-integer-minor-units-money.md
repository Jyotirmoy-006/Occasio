# ADR 002: Integer Minor Units for Monetary Representation

## Status
Accepted

## Context
Event planning involves complex budget operations: category allocation, multi-variable proportional slider rebalancing, currency conversion, and expense tracking. In IEEE 754 floating-point arithmetic (standard JavaScript `Number`), binary floating-point representation yields precision loss (e.g., `0.1 + 0.2 === 0.30000000000000004`). In budget rebalancing where the sum of category allocations must strictly equal the total budget, rounding errors cause off-by-one penny drift.

## Decision
All monetary values in Occasio domain logic, database schemas, API contracts, and state management are strictly represented as integers in minor currency units (e.g. cents for USD/EUR, paise for INR, whole yen for JPY). Floating-point values are only generated at the final display layer via `Intl.NumberFormat`.

Furthermore, when proportional rebalancing generates fractional minor units, remainder distribution uses the Largest Remainder Method (Hamilton method) to distribute leftover minor units to the categories with the largest fractional remainder.

## Consequences
- **Positive**: Guaranteed mathematical invariant: `sum(categories.allocatedMinorUnits) === totalMinorUnits`.
- **Positive**: Zero floating-point drift across repeated slider adjustments or undo/redo actions.
- **Positive**: Locale-aware formatting is decoupled from internal arithmetic.
- **Tradeoff**: Requires conversions (`minorToMajor`, `majorToMinor`) when accepting user text input or serializing to CSV. Handled by pure tested functions in `src/domain/budget/format.ts`.
