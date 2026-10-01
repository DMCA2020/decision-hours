#!/usr/bin/env python3
"""Cut a short audio clip for every recording in data/recordings.json.

The transcript gives a timestamp per line (~30-45 s). An excerpt's start/end inside its line is
estimated from its character position, then padded. Output: audio/<id>.m4a + data/audio_map.json.
Usage: python3 tools/cut_audio.py <transcript.txt> <source_dir>
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TXT, SRC = sys.argv[1], sys.argv[2]
FILES = {5: 's5.m4a', 8: 's8.m4a', 9: 's9.m4a', 10: 's10.m4a', 12: 'N6F7JLOYYEw.m4a', 13: '682778.m4a'}
PAD_BEFORE, PAD_AFTER = 1.5, 2.0


def secs(ts):
    return sum(int(x) * 60 ** i for i, x in enumerate(reversed(ts.split(':'))))


# transcript lines per section: [(start_sec, text)]
sections, cur = {}, None
for line in open(TXT, encoding='utf-8'):
    m = re.match(r'^(\d+)\. ', line)
    if m and not line.startswith('['):
        cur = int(m.group(1))
        sections.setdefault(cur, [])
        continue
    for t, body in re.findall(r'\[(\d+:\d{2}(?::\d{2})?)\]\s*([^\[]*)', line):
        if cur:
            sections[cur].append((secs(t), body.strip()))

os.makedirs(os.path.join(HERE, 'audio'), exist_ok=True)
recs = json.load(open(os.path.join(HERE, 'data', 'recordings.json'), encoding='utf-8'))
out, nth = {}, {}
for r in recs:
    if r.get('skip') or r.get('mode') == 'narrator_quote':
        continue
    sec = int(r['section'])
    k = (str(sec), r['video_ts']); nth[k] = nth.get(k, 0) + 1
    key = f'{sec}|{r["video_ts"]}|{nth[k]}'
    if sec not in FILES:
        continue
    text = r.get('asr_text') or r['text']
    lines = sections.get(sec, [])
    t0 = secs(r['video_ts'])
    idx = next((i for i, (t, _) in enumerate(lines) if t == t0 and text[:25] in lines[i][1]), None)
    if idx is None:
        idx = next((i for i, (t, _) in enumerate(lines) if t == t0), None)
    if idx is None:
        print('no line for', key); continue
    body = lines[idx][1]
    nxt = lines[idx + 1][0] if idx + 1 < len(lines) else t0 + max(20, len(body) / 12)
    span = max(1.0, nxt - t0)
    pos = max(0, body.find(text[:25]))
    start = t0 + span * pos / max(1, len(body)) - PAD_BEFORE
    end = t0 + span * min(1, (pos + len(text)) / max(1, len(body))) + PAD_AFTER
    if pos + len(text) > len(body):  # excerpt runs into the next line(s)
        end = t0 + span + (len(text) - (len(body) - pos)) / 12 + PAD_AFTER
    start = max(0, start)
    name = 'rec_' + re.sub(r'\W', '_', key) + '.m4a'
    dst = os.path.join(HERE, 'audio', name)
    subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-ss', f'{start:.2f}', '-to', f'{end:.2f}',
                    '-i', os.path.join(SRC, FILES[sec]), '-vn', '-ac', '1', '-c:a', 'aac', '-b:a', '64k',
                    '-af', 'afade=t=in:d=0.3,areverse,afade=t=in:d=0.6,areverse', dst], check=True)
    out[key] = {'file': 'audio/' + name, 'dur': round(end - start, 1), 'start': round(start, 1)}
    print(key, f'{start:.1f}-{end:.1f}', r['speaker'][:20])

json.dump(out, open(os.path.join(HERE, 'data', 'audio_map.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out), 'clips')
