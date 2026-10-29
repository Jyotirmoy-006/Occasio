import asyncio
import json
import edge_tts

async def main():
    with open('demo/script.json') as f:
        script = json.load(f)

    with open('demo-out/scene-times-v2.json') as f:
        scene_times = json.load(f)

    with open('demo-out/timings.json') as f:
        timings = json.load(f)

    offsets = {
        'S0': 0.15, 'S1': 0.15, 'S2': 1.20, 'S3': 0.15, 'S3b': 0.15, 'S4': 0.15,
        'S5': 0.60, 'S6': 0.60, 'S6b': 0.60, 'S7': 0.60, 'S8': 0.60, 'S9': 0.60,
        'S10': 0.60, 'S11': 0.20, 'S12': 0.20, 'S13': 0.20,
    }

    st_map = {s['id']: s for s in scene_times}
    scene_sentence_boundaries = {}

    cur_end = 0.0
    for item in script['scenes']:
        sid = item['id']
        st = st_map[sid]
        s_start = st['start']
        lead = offsets.get(sid, 0.15)
        a_start = max(s_start + lead, cur_end + 0.08)
        clip_dur = timings['scenes'][sid]['duration']
        cur_end = a_start + clip_dur

        spoken = item['spokenText'].replace('Occasio', 'Okazio')
        comm = edge_tts.Communicate(spoken, 'en-US-AndrewNeural')

        sentences = []
        async for chunk in comm.stream():
            if chunk['type'] == 'SentenceBoundary':
                s_rel = chunk['offset'] / 1e7
                d_rel = chunk['duration'] / 1e7
                sentences.append({
                    'rel_start': s_rel,
                    'rel_end': s_rel + d_rel,
                    'duration': d_rel,
                    'abs_start': a_start + s_rel,
                    'abs_end': a_start + s_rel + d_rel,
                    'text': chunk['text']
                })
        scene_sentence_boundaries[sid] = sentences
        print(f"[{sid}] {len(sentences)} sentences | a_start={a_start:.2f}s")
        for idx, s in enumerate(sentences):
            print(f"  {idx+1}. {s['abs_start']:6.2f}s -> {s['abs_end']:6.2f}s ({s['duration']:4.2f}s): {s['text']}")

    with open('demo-out/sentence_boundaries.json', 'w', encoding='utf-8') as f:
        json.dump(scene_sentence_boundaries, f, indent=2)
    print("\nSaved demo-out/sentence_boundaries.json")

if __name__ == '__main__':
    asyncio.run(main())

