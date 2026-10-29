import asyncio
import json
import os
import subprocess
import edge_tts

SCRIPT_PATH = os.path.join("demo", "script.json")
OUT_DIR = os.path.join("demo-out", "audio")
TIMINGS_PATH = os.path.join("demo-out", "timings.json")


async def generate_scene_voices():
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    voice = data.get("voice", "en-US-AndrewNeural")
    rate = data.get("rate", "-5%")
    scenes = data.get("scenes", [])

    timings = {}
    total_audio_duration = 0.0

    print(f"Generating voice clips using {voice} at {rate} rate...")

    for scene in scenes:
        scene_id = scene["id"]
        spoken = scene["spokenText"]
        out_file = os.path.join(OUT_DIR, f"{scene_id}.mp3")

        communicate = edge_tts.Communicate(spoken, voice, rate=rate)
        await communicate.save(out_file)

        # Measure duration with ffprobe
        cmd = [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            out_file,
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        duration = float(res.stdout.strip())

        timings[scene_id] = {
            "title": scene.get("title", ""),
            "file": out_file,
            "duration": duration,
            "minDuration": scene.get("minDuration", duration),
            "spokenText": spoken,
            "subtitleText": scene.get("subtitleText", spoken),
        }
        total_audio_duration += duration
        print(f"  [OK] {scene_id} ({scene.get('title')}): {duration:.2f}s")

    with open(TIMINGS_PATH, "w", encoding="utf-8") as f:
        json.dump(
            {
                "voice": voice,
                "rate": rate,
                "totalAudioDuration": total_audio_duration,
                "scenes": timings,
            },
            f,
            indent=2,
        )

    print(f"\nTotal narration audio duration: {total_audio_duration:.2f} seconds")
    print(f"Timings saved to {TIMINGS_PATH}")


if __name__ == "__main__":
    asyncio.run(generate_scene_voices())

