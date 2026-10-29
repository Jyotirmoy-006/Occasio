import asyncio
import os
import subprocess
import edge_tts

SAMPLE_TEXT = (
    "Planning a wedding, a birthday or a community festival means juggling budgets, "
    "deadlines and vendors. Occasio brings it all into one clear plan."
)

VOICES = {
    "en-US-AndrewNeural": "sample_andrew.mp3",
    "en-US-AriaNeural": "sample_aria.mp3",
    "en-GB-SoniaNeural": "sample_sonia.mp3",
}

OUT_DIR = os.path.join("demo-out", "voice-samples")


async def generate_samples():
    os.makedirs(OUT_DIR, exist_ok=True)
    results = []

    for voice, filename in VOICES.items():
        out_path = os.path.join(OUT_DIR, filename)
        print(f"Generating voice sample for {voice} -> {out_path}...")
        communicate = edge_tts.Communicate(SAMPLE_TEXT, voice, rate="-5%")
        await communicate.save(out_path)

        # Measure duration with ffprobe
        cmd = [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            out_path,
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        duration = float(res.stdout.strip())
        results.append((voice, out_path, duration))
        print(f"  [OK] {voice}: {duration:.2f}s")

    print("\nAll voice samples generated successfully:")
    for v, p, d in results:
        print(f"  - {v}: {p} ({d:.2f} seconds)")


if __name__ == "__main__":
    asyncio.run(generate_samples())
