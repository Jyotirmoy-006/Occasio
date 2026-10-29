import asyncio
import json
import os
import subprocess
import edge_tts

SCRIPT_PATH = os.path.join("demo", "script.json")
OUT_DIR = os.path.join("demo-out", "audio")
TIMINGS_PATH = os.path.join("demo-out", "timings.json")
os.makedirs(OUT_DIR, exist_ok=True)

FILTER_CLEAN = (
    "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-35dB:"
    "stop_periods=-1:stop_duration=0.15:stop_threshold=-35dB:stop_silence=0.10,"
    "loudnorm=I=-16:TP=-1.5:LRA=11"
)

async def main():
    with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)

    voice = config["voice"]
    rate = config.get("rate", "+0%")
    print(f"Synthesizing voiceover for 16 scenes with {voice} (rate: {rate})...")

    timings = {
        "voice": voice,
        "rate": rate,
        "scenes": {}
    }

    total_dur = 0.0

    for scene in config["scenes"]:
        scene_id = scene["id"]
        spoken = scene["spokenText"]
        raw_path = os.path.join(OUT_DIR, f"{scene_id}_raw.mp3")
        clean_path = os.path.join(OUT_DIR, f"{scene_id}.mp3")

        print(f"  [{scene_id}] Generating: \"{spoken[:45]}...\"")
        
        # Retry loop for robust edge-tts generation
        max_retries = 4
        for attempt in range(1, max_retries + 1):
            try:
                communicate = edge_tts.Communicate(spoken, voice, rate=rate)
                await communicate.save(raw_path)
                break
            except Exception as e:
                if attempt == max_retries:
                    raise
                print(f"    [Retry {attempt}/{max_retries}] error: {e}, waiting 1.5s...")
                await asyncio.sleep(1.5)

        # Apply silenceremove + loudnorm
        subprocess.run([
            "ffmpeg", "-y", "-i", raw_path,
            "-af", FILTER_CLEAN,
            clean_path
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

        try: os.unlink(raw_path)
        except: pass

        probe = subprocess.run([
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", clean_path
        ], stdout=subprocess.PIPE, text=True, check=True)
        duration = float(probe.stdout.strip())
        total_dur += duration

        timings["scenes"][scene_id] = {
            "title": scene["title"],
            "file": clean_path,
            "duration": duration,
            "minDuration": scene.get("minDuration", duration + 0.4),
            "spokenText": spoken,
            "subtitleText": scene.get("subtitleText", spoken)
        }
        print(f"    -> {duration:.2f}s (file: {clean_path})")

    timings["totalAudioDuration"] = round(total_dur, 3)
    with open(TIMINGS_PATH, "w", encoding="utf-8") as f:
        json.dump(timings, f, indent=2)

    print(f"\nAll 16 scenes synthesized successfully! Total audio duration: {total_dur:.2f}s")
    print(f"Timings saved to {TIMINGS_PATH}")

if __name__ == "__main__":
    asyncio.run(main())
