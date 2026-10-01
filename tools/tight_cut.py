#!/usr/bin/env python3
"""Re-cut every clip exactly from the speaker's first word to their last word (word timestamps from
local Whisper), so no interviewer/narrator speech is left at the edges.
Run with: uv run --with mlx-whisper python tools/tight_cut.py <source_dir>"""
import json, os, re, subprocess, sys, difflib, mlx_whisper

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1]
FILES = {'5': 's5.m4a', '8': 's8.m4a', '9': 's9.m4a', '10': 's10.m4a', '12': 'N6F7JLOYYEw.m4a', '13': '682778.m4a'}
norm = lambda w: re.sub(r'[^א-ת0-9]', '', w)
recs = json.load(open(os.path.join(HERE, 'data', 'recordings.json'), encoding='utf-8'))
amap = json.load(open(os.path.join(HERE, 'data', 'audio_map.json'), encoding='utf-8'))
nth, texts = {}, {}
for r in recs:
    if r.get('skip') or r.get('mode') == 'narrator_quote':
        continue
    k = (str(r['section']), r['video_ts']); nth[k] = nth.get(k, 0) + 1
    texts[f'{k[0]}|{k[1]}|{nth[k]}'] = r.get('asr_text') or r['text']
tmp = os.path.join(SRC, 'win.wav')
for key, v in amap.items():
    sec = key.split('|')[0]
    w0 = max(0, v['start'] - 12); w1 = v['start'] + v['dur'] + 12
    subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-ss', f'{w0:.2f}', '-to', f'{w1:.2f}', '-i',
                    os.path.join(SRC, FILES[sec]), '-ac', '1', '-ar', '16000', tmp], check=True)
    res = mlx_whisper.transcribe(tmp, path_or_hf_repo='mlx-community/whisper-large-v3-turbo', language='he', word_timestamps=True)
    words = [(norm(w['word']), w['start'] + w0, w['end'] + w0) for s in res['segments'] for w in s['words'] if norm(w['word'])]
    seq = [w[0] for w in words]
    target = [norm(w) for w in texts[key].split() if norm(w)]

    def best(sub, lo=0):
        n = len(sub)
        return max((difflib.SequenceMatcher(None, ' '.join(seq[i:i + n]), ' '.join(sub)).ratio(), i) for i in range(lo, max(lo + 1, len(seq) - n + 1)))
    n = min(4, len(target))
    rs, i0 = best(target[:n]); re_, i1 = best(target[-n:], i0)
    if rs < 0.6 or re_ < 0.6:
        print(key, 'NOT FOUND', round(rs, 2), round(re_, 2)); continue
    st = max(0, words[i0][1] - 0.12)
    en = words[min(len(words) - 1, i1 + n - 1)][2] + 0.3
    subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-ss', f'{st:.2f}', '-to', f'{en:.2f}', '-i', os.path.join(SRC, FILES[sec]),
                    '-vn', '-ac', '1', '-c:a', 'aac', '-b:a', '64k', '-af', 'afade=t=in:d=0.08,areverse,afade=t=in:d=0.25,areverse',
                    os.path.join(HERE, v['file'])], check=True)
    v.update(start=round(st, 2), dur=round(en - st, 1), tight=True, first=' '.join(seq[i0:i0 + 4]), last=' '.join(seq[i1:i1 + n]))
    print(key, f'{st:.1f}-{en:.1f}', round(rs, 2), round(re_, 2), '|', v['first'], '...', v['last'])
json.dump(amap, open(os.path.join(HERE, 'data', 'audio_map.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
