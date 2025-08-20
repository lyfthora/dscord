import { DateSeparatorProps } from "stream-chat-react";

export default function CustomDateSeparator(
  props: DateSeparatorProps
): JSX.Element {
  const { date } = props;

  function formatDate(date: Date): string {
    return `${date.toLocaleDateString("en-US", { dateStyle: "long" })}`;
  }

  return (
    <div className="relative flex items-center justify-center my-6 border-l border-white partial-bottom-border">
      <span className="absolute left-auto right-auto text-xs font-semibold text-white bg-[var(--gray-normal)] px-2 border border-white rounded">
        {formatDate(date)}
      </span>
    </div>
  );
}
