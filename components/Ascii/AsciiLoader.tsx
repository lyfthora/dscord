"use client";

export default function AsciiLoader() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <pre
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "24px",
          lineHeight: "1",
          whiteSpace: "pre",
          overflow: "visible",
        }}
        className="ascii-loading"
      >
        {`
   _____            __
  / ___/__  _______/ /____  ____ ___
  \\__ \\/ / / / ___/ __/ _ \\/ __  __ \\
 ___/ / /_/ (__  ) /_/  __/ / / / / /
/____/\\__, /____/\\__/\\___/_/ /_/ /_/
     /____/
        `}
      </pre>
      <p className="mt-4 text-purple-300 font-mono">Loading server...</p>
    </div>
  );
}
