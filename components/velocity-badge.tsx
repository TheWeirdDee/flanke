"use client";

interface Props {
  score: number;
}

export default function VelocityBadge({ score }: Props) {
  const { color, label } = velocityLevel(score);
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-[11px] tabular-nums" style={{ color }}>
        {score}
      </span>
    </span>
  );
}

function velocityLevel(score: number): { color: string; label: string } {
  if (score === 0) return { color: "var(--signal-unknown)", label: "quiet" };
  if (score <= 3) return { color: "var(--signal-hiring)", label: "low" };
  if (score <= 7) return { color: "var(--signal-pricing-up)", label: "active" };
  return { color: "#ef4444", label: "hot" };
}
