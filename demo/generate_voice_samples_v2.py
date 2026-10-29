import asyncio
import os
import subprocess
import re
import edge_tts

OUT_DIR = os.path.join("demo-out", "voice-samples-v2")
os.makedirs(OUT_DIR, exist_ok=True)

VOICES = [
    ("en-US-AndrewNeural", "andrew_standard"),
    ("en-US-AndrewMultilingualNeural", "andrew_multilingual")
]

SAMPLES = [
    ("S2", "A hundred and twenty guests, thirty-five thousand dollars, about a year out. As you type, you can already see how the money gets split. No AI yet. Just math."),
    ("S5", "In the budget view, drag the venue up and the other categories make room. Do it again with catering. The total never changes.")
]

PRONUNCIATION_TESTS = [
    ("Occasio", "This is Occasio, your event planning companion."),
    ("Okazio", "This is Okazio, your event planning companion."),
    ("Okaysio", "This is Okaysio, your event planning companion."),
    ("Ohkaysio", "This is Ohkaysio, your event planning companion."),
]

FILTER_CLEAN = (
    "silenceremove=start_periods=1:start_duration=0.05:start_threshold=-40dB:"
    "stop_periods=-1:stop_duration=0.35:stop_threshold=-40dB:stop_silence=0.25,"
    "loudnorm=I=-16:TP=-1.5:LRA=11"
)

def analyze_silence(file_path: str):
    cmd = ["ffmpeg", "-i", file_path, "-af", "silencedetect=noise=-40dB:d=0.25", "-f", "null", "-"]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
    silences = []
    cur_start = None
    for line in res.stderr.splitlines():
        m_start = re.search(r'silence_start: (\d+\.?\d*)', line)
        m_end = re.search(r'silence_end: (\d+\.?\d*) \| silence_duration: (\d+\.?\d*)', line)
        if m_start:
            cur_start = float(m_start.group(1))
        elif m_end and cur_start is not None:
            dur = float(m_end.group(2))
            silences.append((cur_start, float(m_end.group(1)), dur))
            cur_start = None
    max_silence = max([d for _, _, d in silences], default=0.0)
    return silences, max_silence

async def main():
    print("=== Edge-TTS Voice Samples V2 Generation ===")
    
    # 1. Render S2 and S5 for both voices
    print("\n1. Generating A/B samples for S2 and S5...")
    for voice_id, voice_alias in VOICES:
        for scene_id, text in SAMPLES:
            raw_path = os.path.join(OUT_DIR, f"{scene_id}_{voice_alias}_raw.mp3")
            clean_path = os.path.join(OUT_DIR, f"{scene_id}_{voice_alias}.mp3")
            
            communicate = edge_tts.Communicate(text, voice_id, rate="+0%")
            await communicate.save(raw_path)
            
            # Post-process with silenceremove + loudnorm
            subprocess.run([
                "ffmpeg", "-y", "-i", raw_path,
                "-af", FILTER_CLEAN,
                clean_path
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            
            # Clean temp raw
            try: os.unlink(raw_path)
            except: pass
            
            silences, max_silence = analyze_silence(clean_path)
            
            # Get duration
            probe = subprocess.run([
                "ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1", clean_path
            ], stdout=subprocess.PIPE, text=True, check=True)
            dur = float(probe.stdout.strip())
            
            print(f"  [OK] {voice_alias} - {scene_id}: {dur:.2f}s (max silence: {max_silence:.2f}s) -> {clean_path}")

    # 2. Render pronunciation variants of Occasio
    print("\n2. Generating pronunciation variants for 'Occasio' with en-US-AndrewNeural...")
    for label, text in PRONUNCIATION_TESTS:
        raw_path = os.path.join(OUT_DIR, f"pronounce_{label}_raw.mp3")
        clean_path = os.path.join(OUT_DIR, f"pronounce_{label}.mp3")
        
        communicate = edge_tts.Communicate(text, "en-US-AndrewNeural", rate="+0%")
        await communicate.save(raw_path)
        
        subprocess.run([
            "ffmpeg", "-y", "-i", raw_path,
            "-af", FILTER_CLEAN,
            clean_path
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        try: os.unlink(raw_path)
        except: pass
        
        print(f"  [OK] Pronunciation sample '{label}' -> {clean_path}")

    print("\nAll V2 voice samples generated successfully in demo-out/voice-samples-v2/")

if __name__ == "__main__":
    asyncio.run(main())

