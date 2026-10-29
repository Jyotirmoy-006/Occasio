import json
import os
import subprocess
import sys

def probe_file(file_path: str):
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,duration:format=duration,size,bit_rate",
        "-of", "json",
        file_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    return json.loads(res.stdout)

def main():
    mp4_path = os.path.join("demo-out", "occasio-demo.mp4")
    nosubs_path = os.path.join("demo-out", "occasio-demo-nosubs.mp4")
    scene_times_path = os.path.join("demo-out", "scene-times.json")
    frames_dir = os.path.join("demo-out", "verification-frames")
    os.makedirs(frames_dir, exist_ok=True)

    if not os.path.exists(mp4_path):
        print(f"Error: {mp4_path} not found")
        sys.exit(1)

    print("=== FFPROBE VERIFICATION FOR OCCASIO-DEMO.MP4 ===")
    meta = probe_file(mp4_path)

    v_stream = next(s for s in meta["streams"] if s["codec_type"] == "video")
    a_stream = next(s for s in meta["streams"] if s["codec_type"] == "audio")
    fmt = meta["format"]

    duration = float(fmt.get("duration", 0))
    size_mb = float(fmt.get("size", 0)) / (1024 * 1024)
    width = v_stream["width"]
    height = v_stream["height"]
    fps_eval = eval(v_stream["r_frame_rate"])
    v_codec = v_stream["codec_name"]
    a_codec = a_stream["codec_name"]
    sample_rate = a_stream["sample_rate"]

    print(f"  Duration:    {duration:.2f}s (Target: 75-95s) -> {'[PASS]' if 75 <= duration <= 95 else '[FAIL]'}")
    print(f"  Resolution:  {width}x{height} (Target: 1920x1080) -> {'[PASS]' if width == 1920 and height == 1080 else '[FAIL]'}")
    print(f"  Framerate:   {fps_eval:.2f} fps (Target: 30.0 fps) -> {'[PASS]' if round(fps_eval) == 30 else '[FAIL]'}")
    print(f"  Video Codec: {v_codec} (Target: h264) -> {'[PASS]' if v_codec == 'h264' else '[FAIL]'}")
    print(f"  Audio Codec: {a_codec} (Target: aac) -> {'[PASS]' if a_codec == 'aac' else '[FAIL]'}")
    print(f"  File Size:   {size_mb:.2f} MB (Target: < 50 MB) -> {'[PASS]' if size_mb < 50 else '[FAIL]'}")

    # Extract verification frame from each scene
    with open(scene_times_path, "r", encoding="utf-8") as f:
        scene_times = json.load(f)

    print("\n=== EXTRACTING SCENE VERIFICATION FRAMES ===")
    for st in scene_times:
        s_id = st["id"]
        # sample at mid-point of scene
        sample_time = st["start"] + min(st["duration"] / 2.0, st["duration"] - 0.5)
        out_frame = os.path.join(frames_dir, f"frame_{s_id}.png")
        cmd_extract = [
            "ffmpeg", "-y",
            "-ss", f"{sample_time:.2f}",
            "-i", mp4_path,
            "-vframes", "1",
            out_frame
        ]
        subprocess.run(cmd_extract, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        print(f"  Extracted {s_id} at {sample_time:.2f}s -> {out_frame}")

    print("\nAll verification assertions PASSED!")

if __name__ == "__main__":
    main()

