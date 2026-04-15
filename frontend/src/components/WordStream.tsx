/**
 * Displays message text word-by-word in sync with brain activation timestep.
 * Words up to the current timestep are highlighted; future words are dimmed.
 */
type Props = {
  message: string;
  T: number;
  timestep: number;
};

export default function WordStream({ message, T, timestep }: Props) {
  const textWords = message.split(/\s+/);
  if (T <= 0 || textWords.length === 0) {
    return <div className="text-xs text-neutral-300 whitespace-pre-wrap">{message}</div>;
  }

  // Same chunking logic as gpu/server.py
  const chunk = Math.max(1, Math.floor(textWords.length / T));
  const chunks: string[] = [];
  for (let i = 0; i < T; i++) {
    const start = i * chunk;
    const end = i < T - 1 ? start + chunk : textWords.length;
    chunks.push(textWords.slice(start, end).join(" "));
  }

  return (
    <div className="text-sm leading-relaxed">
      {chunks.map((text, i) => (
        <span
          key={i}
          className={
            i <= timestep
              ? i === timestep
                ? "text-white bg-emerald-500/20 rounded px-0.5 transition-colors duration-200"
                : "text-neutral-200 transition-colors duration-200"
              : "text-neutral-600 transition-colors duration-200"
          }
        >
          {text}{" "}
        </span>
      ))}
    </div>
  );
}
