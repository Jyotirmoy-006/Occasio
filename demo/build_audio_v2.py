import json
import os
import subprocess
import sys

SCENE_AUDIO_LEAD_OFFSETS = {
    "S0": 0.15,
    "S1": 0.15,
    "S2": 1.20,   # Wizard takes ~1.0s to open to Step 3 where 120 guests and $35k budget appear
    "S3": 0.15,
    "S3b": 0.15,
    "S4": 0.15,
    "S5": 0.60,   # Nav to budget takes 0.5s, speech starts as sliders render
    "S6": 0.60,   # Nav to timeline takes 0.5s
    "S6b": 0.60,  # Nav to vendor pipeline takes 0.5s
    "S7": 0.60,   # Nav to ideas takes 0.5s
    "S8": 0.60,   # Nav to copilot takes 0.5s
    "S9": 0.60,   # Nav to scenario compare takes 0.5s
    "S10": 0.60,  # Export modal opens at 0.5s
    "S11": 0.20,
    "S12": 0.20,
    "S13": 0.20,
}

def main():
    scene_times_path = os.path.join("demo-out", "scene-times-v2.json")
    timings_path = os.path.join("demo-out", "timings.json")
    audio_dir = os.path.join("demo-out", "audio")
    ambient_path = os.path.join("demo-out", "ambient_bed.wav")
    out_audio_m4a = os.path.join("demo-out", "narration-v2.m4a")

    if not os.path.exists(scene_times_path):
        print(f"Error: {scene_times_path} not found")
        sys.exit(1)
    if not os.path.exists(timings_path):
        print(f"Error: {timings_path} not found")
        sys.exit(1)

    with open(scene_times_path, "r", encoding="utf-8") as f:
        scene_times = json.load(f)
    with open(timings_path, "r", encoding="utf-8") as f:
        timings = json.load(f)

    total_video_dur = scene_times[-1]["end"]
    fade_out_start = max(0, total_video_dur - 0.8)

    # Use adelay + amix so each scene clip starts at exact timestamp
    inputs = []
    filter_parts = []
    mix_inputs = []

    print("\n--- Audio Headroom & Alignment Verification ---")
    current_audio_end = 0.0
    for idx, st in enumerate(scene_times):
        scene_id = st["id"]
        scene_start = st["start"]
        scene_end = st["end"]
        clip_dur = timings["scenes"][scene_id]["duration"]

        lead_offset = SCENE_AUDIO_LEAD_OFFSETS.get(scene_id, 0.15)
        desired_audio_start = max(scene_start + lead_offset, current_audio_end + 0.08)
        desired_offset_ms = int(round(desired_audio_start * 1000))
        current_audio_end = desired_audio_start + clip_dur
        headroom = scene_end - current_audio_end

        print(f"  [{scene_id:4s}] Scene: {scene_start:6.2f}s - {scene_end:6.2f}s ({st['duration']:5.2f}s) | "
              f"Audio: {desired_audio_start:6.2f}s - {current_audio_end:6.2f}s ({clip_dur:5.2f}s) | "
              f"Headroom: {headroom:+5.2f}s {'[OK]' if headroom >= 0 else '[BLEED ERROR!]'}")

        if headroom < -0.05:
            print(f"CRITICAL WARNING: Audio for scene {scene_id} exceeds video duration by {-headroom:.2f}s!")

        clip_path = os.path.join(audio_dir, f"{scene_id}.mp3")
        if not os.path.exists(clip_path):
            print(f"Error: Clip {clip_path} missing")
            sys.exit(1)

        inputs.extend(["-i", clip_path])
        filter_parts.append(
            f"[{idx}:a]aformat=channel_layouts=stereo:sample_rates=48000,adelay={desired_offset_ms}|{desired_offset_ms}[a{idx}]"
        )
        mix_inputs.append(f"[a{idx}]")

    num_clips = len(scene_times)
    mix_filter = f"{''.join(mix_inputs)}amix=inputs={num_clips}:normalize=0:dropout_transition=0[voices]"

    # If ambient bed exists, mix it smoothly beneath voices
    if os.path.exists(ambient_path):
        ambient_idx = num_clips
        inputs.extend(["-i", ambient_path])
        ambient_filter = (
            f"[{ambient_idx}:a]atrim=0:{total_video_dur:.2f},"
            f"aformat=channel_layouts=stereo:sample_rates=48000,"
            f"volume=0.38,"
            f"afade=t=in:st=0:d=0.5,afade=t=out:st={fade_out_start:.2f}:d=0.5[amb];"
            f"[voices][amb]amix=inputs=2:normalize=0[mixed]"
        )
        norm_filter = f"[mixed]loudnorm=I=-16:TP=-1.5:LRA=11,aformat=channel_layouts=stereo:sample_rates=48000[out_a]"
        full_filter = ";".join(filter_parts) + ";" + mix_filter + ";" + ambient_filter + ";" + norm_filter
    else:
        norm_filter = f"[voices]loudnorm=I=-16:TP=-1.5:LRA=11,aformat=channel_layouts=stereo:sample_rates=48000[out_a]"
        full_filter = ";".join(filter_parts) + ";" + mix_filter + ";" + norm_filter

    cmd = ["ffmpeg", "-y"] + inputs + [
        "-filter_complex", full_filter,
        "-map", "[out_a]",
        "-c:a", "aac",
        "-b:a", "192k",
        out_audio_m4a
    ]

    print(f"\nMixing and synchronizing {num_clips} audio clips with ambient bed into {out_audio_m4a}...")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("FFmpeg error mixing audio:", res.stderr)
        sys.exit(1)

    probe = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", out_audio_m4a
    ], stdout=subprocess.PIPE, text=True, check=True)
    audio_duration = float(probe.stdout.strip())
    print(f"Master narration audio created: {out_audio_m4a} (duration: {audio_duration:.2f}s)")

if __name__ == "__main__":
    main()
