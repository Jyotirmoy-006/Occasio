import json
import os
import sys

def format_chapter_time(seconds: float) -> str:
    total_sec = int(seconds)
    minutes = total_sec // 60
    secs = total_sec % 60
    return f"{minutes:02d}:{secs:02d}"

CHAPTER_TITLES = {
    "S0": "Cold Open: The Planning Chaos",
    "S1": "Introducing Occasio: Event Arts & Planning",
    "S2": "New Plan Wizard: Instant Budget Split",
    "S3": "Live Gemini AI Generation & Privacy Disclosure",
    "S3b": "Demo Mode Fallback Engine",
    "S4": "Event Overview & Milestone Countdown",
    "S5": "Zero-Sum Realtime Budget Sliders",
    "S6": "Timeline Backward Scheduling & Gantt View",
    "S6b": "Vendor Pipeline, Questions & Quote Ledger",
    "S7": "Creative Themes, Palettes & Dietary Menus",
    "S8": "Planning Copilot with Visual Diff Confirmation",
    "S9": "Sensitivity Analysis & Scenario Comparison",
    "S10": "Data Portability: PDF, CSV, Calendar & Backup",
    "S11": "Keyboard Accessibility & Multi-Theme Switching",
    "S12": "Engineering Quality & Security Scorecard",
    "S13": "Open Source Closing & Tech Stack"
}

def main():
    scene_times_path = os.path.join("demo-out", "scene-times-v2.json")
    out_desc_path = os.path.join("demo-out", "youtube-description-v2.txt")

    if not os.path.exists(scene_times_path):
        print(f"Error: {scene_times_path} not found")
        sys.exit(1)

    with open(scene_times_path, "r", encoding="utf-8") as f:
        scene_times = json.load(f)

    repo_url = os.environ.get("DEMO_REPO_URL", "https://github.com/Jyotirmoy-006/Occasio")

    lines = [
        "Occasio is an artisanal, AI-powered event planning companion for weddings, birthdays, and community festivals. It combines tested deterministic calculations for budgets and schedules with Google Gemini for rich creative ideas, ensuring every dollar and deadline adds up.",
        "",
        f"Repository: {repo_url}",
        "Stack: Next.js 16 (App Router), Google Gemini 3.5 Flash Lite, Tailwind CSS, Radix UI, Vitest",
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
        "Key Engineering Highlights:",
        "- Deterministic zero-sum budget rebalancer (integer cents, zero floating-point drift)",
        "- Backward milestone scheduling anchored to target celebration date with Gantt chart",
        "- Local-first privacy: Event names and personal data never leave your device",
        "- Realtime Gemini generative AI with explicit provenance attribution & payload disclosure",
        "- Graceful demo mode fallback when API key is unset or offline",
        "- Sensitive scenario comparisons: experiment with guest counts side-by-side",
        "- Comprehensive export portability: Print PDF, Budget CSV, Timeline .ICS, and JSON backup",
        "- Full keyboard navigation (Ctrl+K), WCAG AAA high-contrast theme, under 3.1 MB footprint",
        "",
        "#GenAI #NextJS #GoogleGemini #EventPlanning #OpenSource #TypeScript #Accessibility #Hackathon"
    ])

    with open(out_desc_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    print(f"YouTube description generated at {out_desc_path}")
    print("\n--- Description Preview ---")
    print("\n".join(lines[:22]))

if __name__ == "__main__":
    main()

