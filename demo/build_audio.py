import json
import os
import subprocess
import sys

def main():
    scene_times_path = os.path.join("demo-out", "scene-times.json")
    timings_path = os.path.join("demo-out", "timings.json")
    audio_dir = os.path.join("demo-out", "audio")
    out_audio_m4a = os.path.join("demo-out", "narration.m4a")

    with open(scene_times_path, "r", encoding="utf-8") as f:
        scene_times = json.load(f)
    with open(timings_path, "r", encoding="utf-8") as f:
        timings = json.load(f)

    # Build ffmpeg adelay + amix filter or concat filter with silences
    # Easiest & most reliable across all FFmpeg versions:
    # Generate an explicit silence segment between narration clips.
    # Total timeline:
    # Scene i starts at st['start']. Clip starts at st['start'] + 0.2s.
    
    # Let's inspect each scene's planned audio start time:
    inputs = []
    filter_complex = []
    
    current_time = 0.0
    concat_segments = []
    seg_idx = 0

    temp_files = []

    for i, st in enumerate(scene_times):
        scene_id = st["id"]
        scene_start = st["start"]
        desired_audio_start = scene_start + 0.25

        gap = desired_audio_start - current_time
        if gap > 0.05:
            # Generate silence of duration `gap`
            silence_file = os.path.join("demo-out", f"silence_{seg_idx}.wav")
            subprocess.run([
                "ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r=48000:cl=stereo",
                "-t", f"{gap:.3f}", silence_file
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            inputs.append(silence_file)
            temp_files.append(silence_file)
            concat_segments.append(f"[{len(inputs)-1}:a]")
            seg_idx += 1
            current_time += gap

        audio_file = os.path.join(audio_dir, f"{scene_id}.mp3")
        clip_dur = timings["scenes"][scene_id]["duration"]
        inputs.append(audio_file)
        concat_segments.append(f"[{len(inputs)-1}:a]")
        current_time += clip_dur

    # Assemble ffmpeg command to concat all segments and apply loudnorm
    cmd = ["ffmpeg", "-y"]
    for inp in inputs:
        cmd.extend(["-i", inp])

    concat_filter = f"{''.join(concat_segments)}concat=n={len(inputs)}:v=0:a=1[raw_audio];[raw_audio]loudnorm=I=-16:TP=-1.5:LRA=11,aformat=channel_layouts=stereo:sample_rates=48000[out_a]"
    cmd.extend([
        "-filter_complex", concat_filter,
        "-map", "[out_a]",
        "-c:a", "aac",
        "-b:a", "192k",
        out_audio_m4a
    ])

    print("Concatenating audio and normalizing to -16 LUFS...")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("FFmpeg error:", res.stderr)
        sys.exit(1)

    # Clean up temp silence files
    for tf in temp_files:
        try: os.unlink(tf)
        except: pass

    # Verify duration
    probe = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", out_audio_m4a
    ], stdout=subprocess.PIPE, text=True, check=True)
    audio_duration = float(probe.stdout.strip())
    print(f"Narration track created: {out_audio_m4a} (duration: {audio_duration:.2f}s)")

if __name__ == "__main__":
    main()

