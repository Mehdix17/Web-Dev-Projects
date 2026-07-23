import { AlertTriangle } from "lucide-react";

type CompletionIndicatorProps = {
  percentage: number;
  missingFields: string[];
};

export function CompletionIndicator({ percentage, missingFields }: CompletionIndicatorProps) {
  // If the profile is 100% complete, we don't need to display this banner
  if (percentage === 100) return null;

  // SVG circular progress properties
  const radius = 36;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex items-center justify-between">
      <div className="flex items-start gap-4">
        <div className="mt-1 bg-accent-light p-2 rounded-full text-accent">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <h2 className="text-text-primary text-[16px] font-semibold leading-6">
            Profile needs attention
          </h2>
          <p className="text-text-secondary text-sm">
            Complete the missing fields to improve your chance of getting tailored matches and generating quality resumes.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {missingFields.map((field) => (
              <span
                key={field}
                className="bg-accent-light text-accent text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Circular Progress Indicator */}
      <div className="relative flex items-center justify-center h-20 w-20">
        <svg className="w-full h-full transform -rotate-90">
          {/* Gray Track */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="text-border-light"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
          />
          {/* Colored Progress Ring */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="text-accent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        <span className="absolute text-[16px] font-bold text-text-primary">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
