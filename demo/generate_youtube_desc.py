import json
import os
import sys

def format_chapter_time(seconds: float) -> str:
    total_sec = int(seconds)
    minutes = total_sec // 60
    secs = total_sec % 60
    return f"{minutes:02d}:{secs:02d}"

CHAPTER_TITLES = {
    "S1": "Introduction & Stationery Elegance",
    "S2": "New Plan Wizard & Instant Calculations",
    "S3": "Live Gemini AI Generation & Provenance",
    "S4": "Event Overview & Milestone Tracking",
    "S5": "Zero-Sum Realtime Budget Rebalancing",
    "S6": "Timeline Backward Scheduling & Vendor Pipeline",
    "S7": "Creative Themes, Color Palettes & Menus",
    "S8": "Conversational Planning Copilot with Visual Diff",
    "S9": "Command Palette & Triple Event Themes",
    "S10": "Open Source, Private & Accessible Architecture"
}

def main():
    scene_times_path = os.path.join("demo-out", "scene-times.json")
    out_desc_path = os.path.join("demo-out", "youtube-description.txt")

    if not os.path.exists(scene_times_path):
        print(f"Error: {scene_times_path} not found")
        sys.exit(1)

    with open(scene_times_path, "r", encoding="utf-8") as f:
        scene_times = json.load(f)

    lines = [
        "Occasio is an artisanal, AI-powered event planning companion for weddings, birthdays, and community festivals. It combines tested deterministic calculations for budgets and schedules with Google Gemini for rich creative ideas, ensuring every dollar and deadline adds up.",
        "",
        "Repository: https://github.com/your-username/occasio",
        "Stack: Next.js 16 (App Router), Google Gemini 2.5 Flash, Tailwind CSS, Radix UI",
        "Narration: AI-generated voice (en-US-AndrewNeural via Microsoft Edge Speech Synthesis)",
        "",
        "Chapters:",
    ]

    for st in scene_times:
        scene_id = st["id"]
        start_time = st["start"]
        title = CHAPTER_TITLES.get(scene_id, f"Scene {scene_id}")
        lines.append(f"{format_chapter_time(start_time)} {title}")

    lines.extend([
        "",
        "Key Highlights:",
        "- Deterministic zero-sum budget rebalancer (no floating-point rounding errors)",
        "- Backward milestone scheduling anchored to target celebration date",
        "- Privacy-first: Event names and guest lists never leave your device",
        "- Realtime Gemini generative AI with explicit provenance attribution",
        "- Full keyboard navigation, high-contrast accessible stationery palette, under 8 MB footprint",
        "",
        "#GenAI #NextJS #GoogleGemini #EventPlanning #OpenSource #TypeScript #Hackathon"
    ])

    with open(out_desc_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    print(f"YouTube description generated at {out_desc_path}")
    print("\n--- Description Preview ---")
    print("\n".join(lines[:16]))

if __name__ == "__main__":
    main()
