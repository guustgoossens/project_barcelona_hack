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

  // Even distribution — same logic as gpu/server.py
  const chunks: string[] = [];
  for (let i = 0; i < T; i++) {
    const start = Math.round((i * textWords.length) / T);
    const end = Math.round(((i + 1) * textWords.length) / T);
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
                ? "text-gray-900 bg-blue-100 rounded px-0.5 transition-colors duration-200"
                : "text-gray-700 transition-colors duration-200"
              : "text-gray-300 transition-colors duration-200"
          }
        >
          {text}{" "}
        </span>
      ))}
    </div>
  );
}
