'use client';

interface StepIndicatorProps {
  current: number; // 1-indexed
  total: number;
  label: string;
}

const STEP_LABELS = ['Colors', 'Style', 'Frame', 'Text', 'Logo'];

export default function StepIndicator({ current, total, label }: StepIndicatorProps) {
  return (
    <div className="mb-8 animate-fade-in-up">
      {/* Step label */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-secondary)]">
          Step {current} of {total}
        </span>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
          {label}
        </span>
      </div>

      {/* Progress bar track */}
      <div className="relative h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${(current / total) * 100}%`,
            background: 'linear-gradient(90deg, #FF7000, #FFC300)',
          }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-2">
        {STEP_LABELS.slice(0, total).map((name, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < current;
          const isActive = stepNum === current;
          return (
            <div key={name} className="group relative flex flex-col items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isDone
                    ? 'bg-[var(--color-secondary)] scale-110'
                    : isActive
                    ? 'bg-[var(--color-tertiary)] ring-2 ring-[var(--color-tertiary)]/40 scale-125'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
              {/* Tooltip */}
              <span className="absolute -top-7 text-[10px] font-semibold text-[var(--color-text)] bg-[var(--color-background)] border border-[var(--color-border)] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm">
                {name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
