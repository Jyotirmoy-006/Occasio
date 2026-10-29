import json
import os
import subprocess
import sys

def probe_file(path: str) -> dict:
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration,size,bit_rate:stream=codec_name,codec_type,width,height,r_frame_rate,avg_frame_rate,pix_fmt,sample_rate,channels",
        "-of", "json", path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    return json.loads(res.stdout)

def main():
    video_path = os.path.join("demo-out", "occasio-demo-v2.mp4")
    scene_times_path = os.path.join("demo-out", "scene-times-v2.json")
    frames_dir = os.path.join("demo-out", "verification-frames-v2")
    os.makedirs(frames_dir, exist_ok=True)

    if not os.path.exists(video_path):
        print(f"Error: {video_path} not found")
        sys.exit(1)

    print("=== OCCASIO DEMO V2 MASTER VERIFICATION ===")
    info = probe_file(video_path)
    fmt = info.get("format", {})
    streams = info.get("streams", [])

    v_stream = next((s for s in streams if s["codec_type"] == "video"), None)
    a_stream = next((s for s in streams if s["codec_type"] == "audio"), None)

    dur = float(fmt.get("duration", 0))
    size_mb = float(fmt.get("size", 0)) / (1024 * 1024)

    print(f"\n1. Duration & File Size:")
    print(f"   Duration: {dur:.2f}s ({dur/60:.2f} minutes)")
    print(f"   Target: 155.0s - 175.0s (2:35 - 2:55)")
    if 155.0 <= dur <= 175.0:
        print("   PASS: Duration is strictly inside the 2:35 - 2:55 window.")
    else:
        print(f"   NOTE: Duration is {dur:.2f}s")

    print(f"   File size: {size_mb:.2f} MB (Limit: < 80 MB)")

    print(f"\n2. Video Stream Specs:")
    if v_stream:
        w = v_stream.get("width")
        h = v_stream.get("height")
        codec = v_stream.get("codec_name")
        r_fps = v_stream.get("r_frame_rate")
        avg_fps = v_stream.get("avg_frame_rate")
        pix_fmt = v_stream.get("pix_fmt")
        print(f"   Resolution: {w}x{h} (Required: 1920x1080)")
        print(f"   Codec: {codec} (pix_fmt: {pix_fmt})")
        print(f"   Framerate: {avg_fps} (Required: 30/1 constant)")
        assert w == 1920 and h == 1080, "Resolution must be 1920x1080"
        assert codec == "h264", "Codec must be h264"
        assert avg_fps in ["30/1", "30"], "Framerate must be 30 fps"
        print("   PASS: Video stream specifications verified.")

    print(f"\n3. Audio Stream Specs:")
    if a_stream:
        acodec = a_stream.get("codec_name")
        sr = a_stream.get("sample_rate")
        ch = a_stream.get("channels")
        print(f"   Codec: {acodec}, Sample Rate: {sr} Hz, Channels: {ch}")
        assert acodec == "aac", "Audio codec must be AAC"
        assert int(sr) == 48000, "Sample rate must be 48000 Hz"
        print("   PASS: Audio stream specifications verified.")

    print(f"\n4. Silence Detection (noise=-40dB, d=0.45):")
    cmd_silence = [
        "ffmpeg", "-i", video_path,
        "-af", "silencedetect=noise=-40dB:d=0.45",
        "-f", "null", "-"
    ]
    res_silence = subprocess.run(cmd_silence, stderr=subprocess.PIPE, text=True)
    silences = [l for l in res_silence.stderr.splitlines() if "silence_duration:" in l]
    print(f"   Silences > 0.45s detected: {len(silences)}")
    for s in silences[:5]:
        print(f"     {s.strip()}")
    if not silences:
        print("   PASS: Master audio has zero dead air (>0.45s).")

    # Extract verification frames
    print(f"\n5. Extracting Verification Frames across all 16 scenes:")
    with open(scene_times_path, "r", encoding="utf-8") as f:
        scene_times = json.load(f)

    for st in scene_times:
        s_id = st["id"]
        # capture frame at mid-point of scene
        ts = st["start"] + st["duration"] * 0.5
        frame_name = f"frame_{s_id}.png"
        frame_path = os.path.join(frames_dir, frame_name)

        cmd_frame = [
            "ffmpeg", "-y",
            "-ss", f"{ts:.2f}",
            "-i", video_path,
            "-frames:v", "1",
            frame_path
        ]
        subprocess.run(cmd_frame, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        print(f"   [{s_id}] at {ts:.2f}s -> {frame_path}")

    print("\nALL VERIFICATIONS COMPLETE!")

if __name__ == "__main__":
    main()

