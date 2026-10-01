#!/usr/bin/env python3
"""Second pass for clips the first pass could not match: try ASR and published wording, wider window,
and for texts with "[...]" cut each part and join them (the audio skips what the text skips)."""
import json, os, re, subprocess, sys, difflib, mlx_whisper

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1]; KEYS = sys.argv[2].split(',')
FILES = {'5': 's5.m4a', '8': 's8.m4a', '9': 's9.m4a', '10': 's10.m4a', '12': 'N6F7JLOYYEw.m4a', '13': '682778.m4a'}
norm = lambda w: re.sub(r'[^א-ת0-9]', '', w)
recs = json.load(open(os.path.join(HERE, 'data', 'recordings.json'), encoding='utf-8'))
amap = json.load(open(os.path.join(HERE, 'data', 'audio_map.json'), encoding='utf-8'))
ver = json.load(open(os.path.join(HERE, 'data', 'recordings_verified.json'), encoding='utf-8'))
nth, rec_by = {}, {}
for r in recs:
    if r.get('skip') or r.get('mode') == 'narrator_quote':
        continue
    k = (str(r['section']), r['video_ts']); nth[k] = nth.get(k, 0) + 1
    rec_by[f'{k[0]}|{k[1]}|{nth[k]}'] = r
vn, ver_by = {}, {}
for v in ver:
    k = (str(v['section']), v['video_ts']); vn[k] = vn.get(k, 0) + 1
    if v.get('status') in ('matched', 'partial') and v.get('written_text'):
        ver_by[f'{k[0]}|{k[1]}|{vn[k]}'] = v['written_text']


def words_of(sec, w0, w1):
    tmp = os.path.join(SRC, 'win.wav')
    subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-ss', f'{w0:.2f}', '-to', f'{w1:.2f}', '-i', os.path.join(SRC, FILES[sec]), '-ac', '1', '-ar', '16000', tmp], check=True)
    res = mlx_whisper.transcribe(tmp, path_or_hf_repo='mlx-community/whisper-large-v3-turbo', language='he', word_timestamps=True)
    return [(norm(w['word']), w['start'] + w0, w['end'] + w0) for s in res['segments'] for w in s['words'] if norm(w['word'])]


def find(seq, sub, lo=0):
    n = len(sub)
    return max((difflib.SequenceMatcher(None, ' '.join(seq[i:i + n]), ' '.join(sub)).ratio(), i) for i in range(lo, max(lo + 1, len(seq) - n + 1)))


for key in KEYS:
    r, v = rec_by[key], amap[key]
    sec = key.split('|')[0]
    w0 = max(0, v['start'] - 20); w1 = v['start'] + v['dur'] + 60
    words = words_of(sec, w0, w1); seq = [w[0] for w in words]
    shown = r.get('text') if r.get('verified_text') else (ver_by.get(key) or r['text'])
    parts = [p for p in re.split(r'\s*\[\.\.\.\]\s*', shown) if p.strip()]
    asr = [norm(w) for w in (r.get('asr_text') or r['text']).split() if norm(w)]
    segs, lo = [], 0
    for pi, p in enumerate(parts):
        t = [norm(w) for w in p.split() if norm(w)]
        n = min(4, len(t))
        cands_s = [t[:n]] + ([asr[:n]] if pi == 0 else [])
        cands_e = [t[-n:]] + ([asr[-n:]] if pi == len(parts) - 1 and len(parts) == 1 else [])
        rs, i0 = max(find(seq, c, lo) for c in cands_s)
        re_, i1 = max(find(seq, c, i0) for c in cands_e)
        print(key, 'part', pi + 1, 'start', round(rs, 2), '|', ' '.join(seq[i0:i0 + 4]), '|| end', round(re_, 2), '|', ' '.join(seq[i1:i1 + n]))
        if rs < 0.55 or re_ < 0.55:
            segs = None; break
        segs.append((max(0, words[i0][1] - 0.12), words[min(len(words) - 1, i1 + n - 1)][2] + 0.3)); lo = i1 + n
    if not segs:
        print(key, 'kept previous clip'); continue
    dst = os.path.join(HERE, v['file'])
    if len(segs) == 1:
        st, en = segs[0]
        subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-ss', f'{st:.2f}', '-to', f'{en:.2f}', '-i', os.path.join(SRC, FILES[sec]), '-vn', '-ac', '1', '-c:a', 'aac', '-b:a', '64k',
                        '-af', 'afade=t=in:d=0.08,areverse,afade=t=in:d=0.25,areverse', dst], check=True)
        dur = en - st
    else:  # join parts with 0.4 s of silence, like the "[...]" in the text
        inputs, filt = [], []
        for i, (st, en) in enumerate(segs):
            inputs += ['-ss', f'{st:.2f}', '-to', f'{en:.2f}', '-i', os.path.join(SRC, FILES[sec])]
            filt.append(f'[{i}:a]aformat=channel_layouts=mono,afade=t=in:d=0.08,areverse,afade=t=in:d=0.2,areverse,apad=pad_dur=0.4[a{i}]')
        filt.append(''.join(f'[a{i}]' for i in range(len(segs))) + f'concat=n={len(segs)}:v=0:a=1[out]')
        subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y'] + inputs + ['-filter_complex', ';'.join(filt), '-map', '[out]', '-c:a', 'aac', '-b:a', '64k', dst], check=True)
        dur = sum(en - st + 0.4 for st, en in segs)
    v.update(start=round(segs[0][0], 2), dur=round(dur, 1), tight=True, parts=len(segs))
    print(key, 'cut', [(round(a, 1), round(b, 1)) for a, b in segs])
json.dump(amap, open(os.path.join(HERE, 'data', 'audio_map.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
