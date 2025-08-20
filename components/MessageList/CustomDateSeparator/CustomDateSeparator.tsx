import { DateSeparatorProps } from "stream-chat-react";

export default function CustomDateSeparator(
  props: DateSeparatorProps
): JSX.Element {
  const { date } = props;

  function formatDate(date: Date): string {
    return `${date.toLocaleDateString("en-US", { dateStyle: "long" })}`;
  }

  return (
    <div className="relative flex items-center justify-center my-6 partial-bottom-border">
      <span className="absolute left-auto right-auto text-xs font-semibold bg-white text-dark  dark:text-white dark:bg-[var(--gray-normal)] px-2">
        {formatDate(date)}
      </span>
    </div>
  );
}
