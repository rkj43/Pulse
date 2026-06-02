"use client";

interface ExerciseListProps {
  exercises: { name: string; sets: number; reps?: number }[];
}

export function ExerciseList({ exercises }: ExerciseListProps) {
  if (exercises.length === 0) {
    return <p className="text-sm text-muted-foreground">No exercises added yet.</p>;
  }

  return (
    <ul className="space-y-1">
      {exercises.map((ex, i) => (
        <li key={i} className="flex justify-between text-sm">
          <span className="text-foreground">{ex.name}</span>
          <span className="text-muted-foreground">
            {ex.sets} sets{ex.reps ? ` × ${ex.reps}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
