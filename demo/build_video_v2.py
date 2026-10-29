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
    recordings_dir = os.path.join("demo-out", "recordings-v2")
    audio_path = os.path.join("demo-out", "narration-v2.m4a")
    subs_path = os.path.join("demo-out", "subs-v2.srt")
    out_mp4 = os.path.join("demo-out", "occasio-demo-v2.mp4")
    out_nosubs_mp4 = os.path.join("demo-out", "occasio-demo-v2-nosubs.mp4")
    out_thumb = os.path.join("demo-out", "thumbnail-v2.png")

    webm_files = [f for f in os.listdir(recordings_dir) if f.endswith(".webm")]
    if not webm_files:
        print("No .webm recording found in", recordings_dir)
        sys.exit(1)
    webm_files.sort(key=lambda f: os.path.getmtime(os.path.join(recordings_dir, f)), reverse=True)
    raw_video = os.path.join(recordings_dir, webm_files[0])

    print(f"Using raw video: {raw_video}")
    video_dur = get_video_duration(raw_video)
    audio_dur = get_video_duration(audio_path)
    print(f"Raw video duration: {video_dur:.2f}s | Audio duration: {audio_dur:.2f}s")

    total_dur = video_dur
    fade_out_start = max(0, total_dur - 0.4)

    escaped_subs = subs_path.replace("\\", "/").replace(":", "\\:")

    # 1. Build video with burned-in subtitles
    print("\n--- Encoding Master MP4 with Burned Subtitles (CRF 17, slow preset, constant 30.00 fps) ---")
    video_filter_subs = (
        f"fps=30,"
        f"subtitles={escaped_subs}:force_style='FontName=Segoe UI,FontSize=18,PrimaryColour=&HFFFFFF,BackColour=&H80000000,BorderStyle=4,Outline=0,MarginV=36',"
        f"fade=t=in:st=0:d=0.3,fade=t=out:st={fade_out_start:.2f}:d=0.3"
    )
    audio_filter = f"afade=t=in:st=0:d=0.3,afade=t=out:st={fade_out_start:.2f}:d=0.3"

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
        "-movflags", "+faststart",
        "-t", f"{total_dur:.3f}",
        out_mp4
    ]

    res = subprocess.run(cmd_subs, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("FFmpeg error:", res.stderr)
        sys.exit(1)
    print(f"Master MP4 created: {out_mp4}")

    # 2. Build nosubs variant
    print("\n--- Encoding Clean MP4 without Burned Subtitles ---")
    video_filter_nosubs = (
        f"fps=30,"
        f"fade=t=in:st=0:d=0.3,fade=t=out:st={fade_out_start:.2f}:d=0.3"
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
        "-movflags", "+faststart",
        "-t", f"{total_dur:.3f}",
        out_nosubs_mp4
    ]
    res2 = subprocess.run(cmd_nosubs, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res2.returncode != 0:
        print("FFmpeg error on nosubs:", res2.stderr)
        sys.exit(1)
    print(f"Clean MP4 created: {out_nosubs_mp4}")

    # 3. Extract 1280x720 cover thumbnail
    print("\n--- Extracting 1280x720 Cover Thumbnail ---")
    thumb_time = 14.0 # S1 title card with monogram & pillars
    cmd_thumb = [
        "ffmpeg", "-y",
        "-ss", f"{thumb_time}",
        "-i", out_nosubs_mp4,
        "-vf", "scale=1280:720",
        "-frames:v", "1",
        out_thumb
    ]
    subprocess.run(cmd_thumb, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    print(f"Thumbnail extracted: {out_thumb}")

if __name__ == "__main__":
    main()

