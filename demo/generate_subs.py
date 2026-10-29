import json
import os
import sys

def format_timestamp(seconds: float) -> str:
    millis = int(round((seconds - int(seconds)) * 1000))
    total_sec = int(seconds)
    hours = total_sec // 3600
    minutes = (total_sec % 3600) // 60
    secs = total_sec % 60
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

def split_cue_text(text: str, max_line_len: int = 42) -> list[str]:
    words = text.split()
    lines = []
    current_line = []
    current_len = 0

    for word in words:
        if current_len + len(word) + (1 if current_line else 0) <= max_line_len:
            current_line.append(word)
            current_len += len(word) + (1 if len(current_line) > 1 else 0)
        else:
            if current_line:
                lines.append(" ".join(current_line))
            current_line = [word]
            current_len = len(word)
    if current_line:
        lines.append(" ".join(current_line))
    return lines

def main():
    timings_path = os.path.join("demo-out", "timings.json")
    scene_times_path = os.path.join("demo-out", "scene-times.json")
    out_srt_path = os.path.join("demo-out", "subs.srt")

    if not os.path.exists(timings_path):
        print(f"Error: {timings_path} not found")
        sys.exit(1)
    if not os.path.exists(scene_times_path):
        print(f"Error: {scene_times_path} not found")
        sys.exit(1)

    with open(timings_path, "r", encoding="utf-8") as f:
        timings = json.load(f)
    with open(scene_times_path, "r", encoding="utf-8") as f:
        scene_times = json.load(f)

    cues = []
    cue_idx = 1

    for st in scene_times:
        scene_id = st["id"]
        scene_start = st["start"]
        scene_duration = st["duration"]

        scene_info = timings["scenes"].get(scene_id)
        if not scene_info:
            continue

        subtitle_text = scene_info.get("subtitleText", scene_info.get("spokenText", ""))
        audio_dur = scene_info["duration"]

        # Subtitle appears 0.2s into the scene and disappears when narration stops (plus 0.3s)
        cue_start = scene_start + 0.2
        cue_end = min(scene_start + audio_dur + 0.3, scene_start + scene_duration - 0.1)

        # Break long subtitle into 2 segments if long (>70 chars) and duration > 5s
        if len(subtitle_text) > 75 and audio_dur > 6.0:
            words = subtitle_text.split()
            mid = len(words) // 2
            half1 = " ".join(words[:mid])
            half2 = " ".join(words[mid:])
            half_dur = (cue_end - cue_start) / 2

            # Segment 1
            lines1 = split_cue_text(half1)
            cues.append({
                "index": cue_idx,
                "start": cue_start,
                "end": cue_start + half_dur - 0.1,
                "text": "\n".join(lines1[:2])
            })
            cue_idx += 1

            # Segment 2
            lines2 = split_cue_text(half2)
            cues.append({
                "index": cue_idx,
                "start": cue_start + half_dur,
                "end": cue_end,
                "text": "\n".join(lines2[:2])
            })
            cue_idx += 1
        else:
            lines = split_cue_text(subtitle_text)
            cues.append({
                "index": cue_idx,
                "start": cue_start,
                "end": cue_end,
                "text": "\n".join(lines[:2])
            })
            cue_idx += 1

    with open(out_srt_path, "w", encoding="utf-8") as f:
        for cue in cues:
            f.write(f"{cue['index']}\n")
            f.write(f"{format_timestamp(cue['start'])} --> {format_timestamp(cue['end'])}\n")
            f.write(f"{cue['text']}\n\n")

    print(f"Generated {len(cues)} subtitle cues in {out_srt_path}")

if __name__ == "__main__":
    main()
