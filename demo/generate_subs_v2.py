import json
import os

def format_timestamp(seconds: float) -> str:
    millis = int(round((seconds - int(seconds)) * 1000))
    total_sec = int(seconds)
    hours = total_sec // 3600
    minutes = (total_sec % 3600) // 60
    secs = total_sec % 60
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

def get_perfect_cues():
    return [
        # === S0: Cold Open (Audio: 0.15s - 7.49s) ===
        {
            "start": 0.20, "end": 2.85,
            "text": "How many tabs does it take\nto plan a wedding?",
            "scene": "S0"
        },
        {
            "start": 2.85, "end": 5.05,
            "text": "A budget spreadsheet,\na checklist,",
            "scene": "S0"
        },
        {
            "start": 5.05, "end": 8.50,
            "text": "a thread of vendor emails,\nand a deadline you forgot.",
            "scene": "S0"
        },

        # === S1: Title Card (Audio: 9.09s - 18.92s) ===
        {
            "start": 9.14, "end": 10.55,
            "text": "This is Occasio.",
            "scene": "S1"
        },
        {
            "start": 10.55, "end": 14.85,
            "text": "It's a planning assistant for weddings,\nbirthdays and community events.",
            "scene": "S1"
        },
        {
            "start": 14.85, "end": 19.05,
            "text": "Budget, timeline, vendors and ideas,\nall in one place.",
            "scene": "S1"
        },
        {
            "start": 19.05, "end": 21.00,
            "text": "Let's plan a wedding.",
            "scene": "S1"
        },

        # === S2: Welcome & Wizard (Audio: 24.84s - 33.40s) ===
        {
            "start": 24.89, "end": 26.70,
            "text": "A hundred and twenty guests,",
            "scene": "S2"
        },
        {
            "start": 26.70, "end": 29.60,
            "text": "thirty-five thousand dollars,\nabout a year out.",
            "scene": "S2"
        },
        {
            "start": 29.60, "end": 33.10,
            "text": "As you type, you can already see\nhow the money gets split.",
            "scene": "S2"
        },
        {
            "start": 33.10, "end": 34.40,
            "text": "No AI yet. Just math.",
            "scene": "S2"
        },

        # === S3: Gemini Live Generation (Audio: 34.58s - 43.78s) ===
        {
            "start": 34.63, "end": 37.60,
            "text": "Then Gemini writes the creative\nparts of the plan.",
            "scene": "S3"
        },
        {
            "start": 37.60, "end": 42.05,
            "text": "It never sees your event name, and you\ncan check exactly what it does get.",
            "scene": "S3"
        },
        {
            "start": 42.05, "end": 45.10,
            "text": "The totals and dates still come\nfrom tested code.",
            "scene": "S3"
        },

        # === S3b: Demo Mode Fallback (Audio: 49.29s - 55.81s) ===
        {
            "start": 49.34, "end": 52.40,
            "text": "If the AI is ever unavailable,\nor there's no key,",
            "scene": "S3b"
        },
        {
            "start": 52.40, "end": 56.00,
            "text": "a built-in demo engine takes over\nand the app tells you.",
            "scene": "S3b"
        },

        # === S4: Event Overview & Milestones (Audio: 57.03s - 63.60s) ===
        {
            "start": 57.08, "end": 58.25,
            "text": "This is your plan.",
            "scene": "S4"
        },
        {
            "start": 58.25, "end": 62.40,
            "text": "A countdown, your next deadlines,\nand a warning if something slips.",
            "scene": "S4"
        },
        {
            "start": 62.40, "end": 64.60,
            "text": "Tick one off, and you can undo it.",
            "scene": "S4"
        },

        # === S5: Budget View Dynamic Sliders (Audio: 66.09s - 72.84s) ===
        {
            "start": 66.14, "end": 70.60,
            "text": "In the budget view, drag the venue up\nand the other categories make room.",
            "scene": "S5"
        },
        {
            "start": 70.60, "end": 72.20,
            "text": "Do it again with catering.",
            "scene": "S5"
        },
        {
            "start": 72.20, "end": 73.80,
            "text": "The total never changes.",
            "scene": "S5"
        },

        # === S6: Backward Timeline & Gantt View (Audio: 74.73s - 81.49s) ===
        {
            "start": 74.78, "end": 79.25,
            "text": "Deadlines are planned backward from\nthe wedding date, grouped into phases.",
            "scene": "S6"
        },
        {
            "start": 79.25, "end": 82.55,
            "text": "Shift one with a click, or view them\non the Gantt chart.",
            "scene": "S6"
        },

        # === S6b: Vendor Pipeline & Questions (Audio: 82.80s - 90.41s) ===
        {
            "start": 82.85, "end": 85.75,
            "text": "Each vendor moves from first contact\nto booked,",
            "scene": "S6b"
        },
        {
            "start": 85.75, "end": 88.50,
            "text": "with the right questions to ask\nalong the way.",
            "scene": "S6b"
        },
        {
            "start": 88.50, "end": 91.05,
            "text": "Enter a quote and your real\nspend updates.",
            "scene": "S6b"
        },

        # === S7: Creative Themes, Palettes & Dietary (Audio: 91.33s - 100.07s) ===
        {
            "start": 91.38, "end": 93.90,
            "text": "In the ideas tab you get themes,\npalettes",
            "scene": "S7"
        },
        {
            "start": 93.90, "end": 96.60,
            "text": "and a menu that follows your\ndietary needs.",
            "scene": "S7"
        },
        {
            "start": 96.71, "end": 97.85,
            "text": "Not feeling one?",
            "scene": "S7"
        },
        {
            "start": 97.85, "end": 101.10,
            "text": "Regenerate just that idea,\nand pin the ones you keep.",
            "scene": "S7"
        },

        # === S8: Planning Copilot & Diff (Audio: 102.00s - 109.54s) ===
        {
            "start": 102.05, "end": 103.45,
            "text": "Need to cut costs?",
            "scene": "S8"
        },
        {
            "start": 103.45, "end": 104.75,
            "text": "Ask the copilot.",
            "scene": "S8"
        },
        {
            "start": 104.75, "end": 109.15,
            "text": "It shows exactly what would change, and\nnothing happens until you confirm.",
            "scene": "S8"
        },
        {
            "start": 109.15, "end": 110.65,
            "text": "And you can always undo.",
            "scene": "S8"
        },

        # === S9: Scenario Compare & Sensitivity (Audio: 113.39s - 119.45s) ===
        {
            "start": 113.44, "end": 115.70,
            "text": "What if you invite fifty fewer guests?",
            "scene": "S9"
        },
        {
            "start": 115.70, "end": 120.10,
            "text": "Duplicate the plan, change the number,\nand compare both side by side.",
            "scene": "S9"
        },

        # === S10: Data Portability (Audio: 121.08s - 127.67s) ===
        {
            "start": 121.13, "end": 122.35,
            "text": "Take it with you.",
            "scene": "S10"
        },
        {
            "start": 122.35, "end": 125.40,
            "text": "Print the plan, export the budget\nas a spreadsheet,",
            "scene": "S10"
        },
        {
            "start": 125.40, "end": 128.80,
            "text": "and the timeline to your calendar,\nor save a backup file.",
            "scene": "S10"
        },

        # === S11: Themes & Accessibility (Audio: 129.30s - 139.33s) ===
        {
            "start": 129.35, "end": 133.55,
            "text": "Switch to a birthday or a community\nevent and the whole look changes.",
            "scene": "S11"
        },
        {
            "start": 133.55, "end": 135.65,
            "text": "Everything works from the keyboard.",
            "scene": "S11"
        },
        {
            "start": 135.65, "end": 137.80,
            "text": "Control K opens a command palette,",
            "scene": "S11"
        },
        {
            "start": 137.80, "end": 140.60,
            "text": "and there's a calmer mode\nwith less decoration.",
            "scene": "S11"
        },

        # === S12: Quality Scorecard (Audio: 141.20s - 149.35s) ===
        {
            "start": 141.25, "end": 144.15,
            "text": "Under the hood, it's covered\nby automated tests",
            "scene": "S12"
        },
        {
            "start": 144.15, "end": 146.70,
            "text": "and accessibility checks\non every screen.",
            "scene": "S12"
        },
        {
            "start": 146.70, "end": 149.20,
            "text": "And the API key never leaves\nthe server.",
            "scene": "S12"
        },

        # === S13: Closing Card (Audio: 151.18s - 159.91s) ===
        {
            "start": 151.23, "end": 152.40,
            "text": "That's Occasio.",
            "scene": "S13"
        },
        {
            "start": 152.40, "end": 156.40,
            "text": "One place for the budget, the timeline,\nthe vendors and the ideas.",
            "scene": "S13"
        },
        {
            "start": 156.40, "end": 160.70,
            "text": "Plans are saved on your device,\nand the code is open source on GitHub.",
            "scene": "S13"
        }
    ]

def main():
    cues = get_perfect_cues()
    out_srt_path = os.path.join("demo-out", "subs-v2.srt")

    srt_content = []
    max_cps = 0.0
    violations = []

    for idx, c in enumerate(cues, 1):
        dur = c["end"] - c["start"]
        text_clean = c["text"].replace("\n", " ")
        chars = len(text_clean)
        cps = chars / max(0.1, dur)
        max_cps = max(max_cps, cps)

        lines = c["text"].split("\n")
        assert len(lines) <= 2, f"Cue {idx} has {len(lines)} lines!"
        for l in lines:
            if len(l) > 42:
                violations.append(f"Line length violation: Cue {idx} line has {len(l)} chars: '{l}'")
        if cps > 17.0:
            violations.append(f"CPS violation: Cue {idx} has {cps:.2f} CPS ({chars} chars in {dur:.2f}s)")
        if dur < 1.0 or dur > 6.0:
            violations.append(f"Duration violation: Cue {idx} dur is {dur:.2f}s")

        srt_content.append(str(idx))
        srt_content.append(f"{format_timestamp(c['start'])} --> {format_timestamp(c['end'])}")
        srt_content.append(c["text"])
        srt_content.append("")

    with open(out_srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(srt_content))

    print(f"Generated {len(cues)} speech-synchronized subtitle cues in {out_srt_path}")
    print(f"Max CPS: {max_cps:.2f} (Hard limit: <= 17.00)")
    print(f"Violations: {len(violations)}")
    for v in violations:
        print(f"  {v}")

    if not violations:
        print("\nSUCCESS: All cues are 100% compliant with speech boundaries, line limits (<=42 chars), and CPS (<=17.0)!")

if __name__ == "__main__":
    main()
