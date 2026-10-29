import json
import os
import subprocess
import sys

def get_video_duration(path: str) -> float:
    res = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", path
    ], stdout=subprocess.PIPE, text=True, check=True)
    return float(res.stdout.strip())

def main():
    recordings_dir = os.path.join("demo-out", "recordings")
    audio_path = os.path.join("demo-out", "narration.m4a")
    subs_path = os.path.join("demo-out", "subs.srt")
    out_mp4 = os.path.join("demo-out", "occasio-demo.mp4")
    out_nosubs_mp4 = os.path.join("demo-out", "occasio-demo-nosubs.mp4")
    out_thumb = os.path.join("demo-out", "thumbnail.png")

    webm_files = [f for f in os.listdir(recordings_dir) if f.endswith(".webm")]
    if not webm_files:
        print("No .webm recording found in", recordings_dir)
        sys.exit(1)
    # pick newest
    webm_files.sort(key=lambda f: os.path.getmtime(os.path.join(recordings_dir, f)), reverse=True)
    raw_video = os.path.join(recordings_dir, webm_files[0])

    print(f"Using raw video: {raw_video}")
    video_dur = get_video_duration(raw_video)
    audio_dur = get_video_duration(audio_path)
    print(f"Raw video duration: {video_dur:.2f}s | Audio duration: {audio_dur:.2f}s")

    # Target total duration is video duration
    total_dur = video_dur
    fade_out_start = max(0, total_dur - 0.5)

    # Subtitles path formatted for ffmpeg filter (escape colons and backslashes)
    escaped_subs = subs_path.replace("\\", "/").replace(":", "\\:")

    # 1. Build video with subtitles burned in
    print("\n--- Encoding final MP4 with burned subtitles (CRF 17, slow preset, constant 30 fps) ---")
    video_filter_subs = (
        f"fps=30,"
        f"subtitles={escaped_subs}:force_style='FontName=Segoe UI,FontSize=18,PrimaryColour=&HFFFFFF,BackColour=&H80000000,BorderStyle=4,Outline=0,MarginV=36',"
        f"fade=t=in:st=0:d=0.4,fade=t=out:st={fade_out_start:.2f}:d=0.4"
    )
    audio_filter = f"afade=t=in:st=0:d=0.4,afade=t=out:st={fade_out_start:.2f}:d=0.4"

    cmd_subs = [
        "ffmpeg", "-y",
        "-i", raw_video,
        "-i", audio_path,
        "-filter_complex", f"[0:v]{video_filter_subs}[v];[1:a]{audio_filter}[a]",
        "-map", "[v]",
        "-map", "[a]",
        "-c:v", "libx264",
        "-crf", "17",
        "-preset", "slow",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-t", f"{total_dur:.3f}",
        out_mp4
    ]

    res = subprocess.run(cmd_subs, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("FFmpeg error:", res.stderr)
        sys.exit(1)
    print(f"Burned-subtitles MP4 created: {out_mp4}")

    # 2. Build nosubs variant
    print("\n--- Encoding clean MP4 without burned subtitles ---")
    video_filter_nosubs = (
        f"fps=30,"
        f"fade=t=in:st=0:d=0.4,fade=t=out:st={fade_out_start:.2f}:d=0.4"
    )
    cmd_nosubs = [
        "ffmpeg", "-y",
        "-i", raw_video,
        "-i", audio_path,
        "-filter_complex", f"[0:v]{video_filter_nosubs}[v];[1:a]{audio_filter}[a]",
        "-map", "[v]",
        "-map", "[a]",
        "-c:v", "libx264",
        "-crf", "17",
        "-preset", "slow",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-t", f"{total_dur:.3f}",
        out_nosubs_mp4
    ]
    res2 = subprocess.run(cmd_nosubs, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res2.returncode != 0:
        print("FFmpeg error on nosubs:", res2.stderr)
        sys.exit(1)
    print(f"Clean MP4 created: {out_nosubs_mp4}")

    # 3. Extract 1280x720 thumbnail
    # Find S4 (Overview) timestamp
    scene_times_path = os.path.join("demo-out", "scene-times.json")
    thumb_time = 42.0
    if os.path.exists(scene_times_path):
        with open(scene_times_path, "r", encoding="utf-8") as f:
            st = json.load(f)
            for s in st:
                if s["id"] == "S4":
                    thumb_time = s["start"] + 1.5
                    break

    print(f"\n--- Extracting 1280x720 thumbnail from S4 at {thumb_time:.2f}s ---")
    cmd_thumb = [
        "ffmpeg", "-y",
        "-ss", f"{thumb_time:.2f}",
        "-i", out_nosubs_mp4,
        "-vframes", "1",
        "-vf", "scale=1280:720",
        out_thumb
    ]
    subprocess.run(cmd_thumb, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    print(f"Thumbnail saved: {out_thumb}")

if __name__ == "__main__":
    main()
