import * as React from "react";

import { Markdown } from "@/components/ui/markdown";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ui/reasoning";

export const meta = { name: "Reasoning", group: "AI" };

/* Ask again: the thinking opens on its own and streams with a light passing through "Thinking…",
   then closes into "Thought for 5s" as the answer starts. */
export const play = [
  { wait: 600 },
  { click: '[data-play="ask"]', wait: 12000 },
];

export const controls = {
  autoClose: { type: "switch", label: "Close when done", default: true },
  defaultOpen: { type: "switch", label: "Open at first", default: false },
  timing: {
    type: "select",
    label: "Duration",
    options: ["measured", "given"],
    default: "measured",
  },
  thinkingLabel: {
    type: "text",
    label: "Thinking label",
    default: "Thinking…",
  },
  doneLabel: {
    type: "text",
    label: "Done label ({s} = seconds)",
    default: "Thought for {s}s",
  },
  themeInk: {
    type: "color",
    label: "Trigger text",
    default: "",
    group: "Colours",
  },
  themeText: {
    type: "color",
    label: "Thinking text",
    default: "",
    group: "Colours",
  },
  themeRule: { type: "color", label: "Rule", default: "", group: "Colours" },
  themeFont: {
    type: "slider",
    label: "Thinking size",
    min: 11,
    max: 16,
    step: 0.5,
    default: 13,
    unit: "px",
    group: "Layout",
  },
  themeIndent: {
    type: "slider",
    label: "Thinking indent",
    min: 6,
    max: 28,
    step: 1,
    default: 14,
    unit: "px",
    group: "Layout",
  },
  themeMaxHeight: {
    type: "slider",
    label: "Tallest before scrolling",
    min: 96,
    max: 400,
    step: 8,
    default: 288,
    unit: "px",
    group: "Layout",
  },
} as const;

const question =
  "Alfama flat at €148 a night (4th floor, no lift) or Príncipe Real at €171 (ground floor)? Mum is coming with us.";

const thinking = `**Weighing the stairs against the price.** Alfama is €23 a night cheaper, so €69 over three nights.

It is a fourth floor with no lift, though, and the streets around it are steep cobbles. With Mum along, that counts every time they go out.

Príncipe Real:
- ground floor, no stairs at all
- flatter streets, five minutes from the Rato metro
- the extra €69 split four ways is about €17 each

That is an easy trade. Recommend Príncipe Real, and keep Alfama only as the budget option.`;

const answer = `Book **Príncipe Real**. It costs about **€17 more each** for the three nights, but it is on the ground floor and the streets around it are flat, which Mum will thank you for by day two.

Alfama only wins if the budget is tight.`;

const words = (text: string) => text.match(/\s*\S+/g) ?? [];

type Phase = "done" | "thinking" | "answering";

export default function ReasoningDemo({
  autoClose = true,
  defaultOpen = false,
  timing = "measured",
  thinkingLabel = "Thinking…",
  doneLabel = "Thought for {s}s",
  themeInk = "",
  themeText = "",
  themeRule = "",
  themeFont = 13,
  themeIndent = 14,
  themeMaxHeight = 288,
}: {
  autoClose?: boolean;
  defaultOpen?: boolean;
  timing?: "measured" | "given";
  thinkingLabel?: string;
  doneLabel?: string;
  themeInk?: string;
  themeText?: string;
  themeRule?: string;
  themeFont?: number;
  themeIndent?: number;
  themeMaxHeight?: number;
}) {
  const [phase, setPhase] = React.useState<Phase>("done");
  const [thought, setThought] = React.useState(thinking);
  const [said, setSaid] = React.useState(answer);
  const [runs, setRuns] = React.useState(0);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  /* Stream a text a few words at a time, then call `done`. */
  const stream = (
    text: string,
    set: (s: string) => void,
    speed: number,
    done: () => void,
  ) => {
    const all = words(text);
    let at = 0;
    const tick = () => {
      at = Math.min(all.length, at + 1 + (at % 4 === 0 ? 1 : 0));
      set(all.slice(0, at).join(""));
      if (at >= all.length) {
        done();
        return;
      }
      timer.current = setTimeout(tick, (42 + (at % 5) * 9) * speed);
    };
    tick();
  };

  const ask = (e: React.MouseEvent<HTMLButtonElement>) => {
    const speed =
      parseFloat(
        getComputedStyle(e.currentTarget).getPropertyValue("--kf-speed"),
      ) || 1;
    clearTimeout(timer.current);
    setRuns((r) => r + 1);
    setThought("");
    setSaid("");
    setPhase("thinking");
    timer.current = setTimeout(
      () =>
        stream(thinking, setThought, speed * 1.6, () => {
          timer.current = setTimeout(() => {
            setPhase("answering");
            timer.current = setTimeout(
              () => stream(answer, setSaid, speed, () => setPhase("done")),
              420 * speed,
            );
          }, 300 * speed);
        }),
      500 * speed,
    );
  };

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeInk ? { "--reasoning-ink": themeInk } : null),
    ...(themeText ? { "--reasoning-text": themeText } : null),
    ...(themeRule ? { "--reasoning-rule": themeRule } : null),
    ...(themeFont !== 13 ? { "--reasoning-font": `${themeFont}px` } : null),
    ...(themeIndent !== 14
      ? { "--reasoning-indent": `${themeIndent}px` }
      : null),
    ...(themeMaxHeight !== 288
      ? { "--reasoning-max-height": `${themeMaxHeight}px` }
      : null),
  } as React.CSSProperties;

  /* Before the first run there is nothing measured yet, so the demo starts from a known time. */
  const duration = timing === "given" ? 12 : runs === 0 ? 5 : undefined;

  return (
    <div
      style={theme}
      className="@container flex h-[440px] w-full max-w-[480px] flex-col"
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [mask-image:linear-gradient(to_bottom,black_calc(100%-24px),transparent)]">
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-muted px-3.5 py-2.5 text-[13px] leading-snug">
            {question}
          </div>
        </div>

        <Reasoning
          key={`${defaultOpen}`}
          className="mt-5"
          streaming={phase === "thinking"}
          duration={duration}
          autoClose={autoClose}
          defaultOpen={defaultOpen}
        >
          <ReasoningTrigger
            thinkingLabel={thinkingLabel}
            doneLabel={(seconds) =>
              seconds === undefined
                ? "Thought for a few seconds"
                : doneLabel.replace("{s}", String(seconds))
            }
          />
          <ReasoningContent>{thought}</ReasoningContent>
        </Reasoning>

        <Markdown
          className="mt-3"
          streaming={phase === "answering"}
          aria-label="Answer"
        >
          {said}
        </Markdown>
      </div>

      <div className="flex shrink-0 items-center justify-end pt-3">
        <button
          type="button"
          data-play="ask"
          onClick={ask}
          disabled={phase !== "done"}
          className="inline-flex h-7 items-center gap-1.5 rounded-[8px] px-2.5 text-[12px] leading-none font-medium text-muted-foreground outline-none transition-[scale,color,background-color,opacity] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:bg-foreground/[0.045] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[calc(1-0.04*var(--kf-flourish,1))] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="size-3.5"
          >
            <path d="M13.25 8a5.25 5.25 0 1 1-1.54-3.71M13.25 2.75v2.5h-2.5" />
          </svg>
          Ask again
        </button>
      </div>
    </div>
  );
}
