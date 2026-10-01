#!/usr/bin/env python3
"""Build content.js for the WhatsApp-style chat from the "שעות ההכרעה 6-7 באוקטובר" archive.

Every bubble is a source summary (event + decision) with its sources and caveat.
Direct quotes appear only where the archive marks a published quote.
Usage: python3 tools/build_oct7.py [archive_dir]
"""
import json, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Downloads/שעות ההכרעה   6–7 באוקטובר')


def load_js(path, var):
    out = subprocess.check_output(['node', '-e', f'global.window={{}};require({json.dumps(path)});process.stdout.write(JSON.stringify(window.{var}))'])
    return json.loads(out)


data = load_js(os.path.join(SRC, 'data.js'), 'ARCHIVE')
tx = load_js(os.path.join(SRC, 'transcripts.js'), 'TRANSCRIPT_LIBRARY')
sources = data['sources']
sources['solomonfull'] = ['המקור: אחד מול צה״ל, עמוד הפרק והתגובות', 'https://13tv.co.il/item/news/hamakor/season-25/episodes/aph7s-904990303/']

# members: id, display name, aliases (earliest match in the text wins), portrait, colour, grammatical gender
MEMBERS = [
    ('netanyahu', 'בנימין נתניהו', ['בנימין נתניהו', 'נתניהו', 'ראש הממשלה ·'], None, '#1f7aec', 'm'),  # no photo (user request)
    ('gallant', 'יואב גלנט', ['יואב גלנט', 'גלנט'], 'gallant', '#c4532d', 'm'),
    ('halevi', 'הרצי הלוי', ['הרצי הלוי', 'הלוי'], 'halevi', '#029d00', 'm'),
    ('ronen', 'רונן בר', ['רונן בר'], 'ronen', '#5e47de', 'm'),
    ('gil', 'אבי גיל', ['אבי גיל'], 'gil', '#a62c71', 'm'),
    ('finkelman', 'ירון פינקלמן', ['ירון פינקלמן', 'פינקלמן'], 'finkelman', '#d3396d', 'm'),
    ('basiuk', 'עודד בסיוק', ['עודד בסיוק', 'בסיוק'], 'basiuk', '#128c7e', 'm'),
    ('binder', 'שלומי בינדר', ['שלומי בינדר', 'בינדר'], 'binder', '#8b6ee8', 'm'),
    ('tomer', 'תומר בר', ['תומר בר'], 'tomer', '#0a7cbd', 'm'),
    ('shabtai', 'קובי שבתאי', ['קובי שבתאי', 'שבתאי'], 'shabtai', '#e26a00', 'm'),
    ('haliva', 'אהרון חליוה', ['אהרון חליוה', 'חליוה'], 'haliva', '#6b7c2a', 'm'),
    ('rosenfeld', 'אבי רוזנפלד', ['אבי רוזנפלד', 'רוזנפלד'], None, '#b5651d', 'm'),
    ('cohen', 'אמיר כהן, מחוז דרום', ['אמיר כהן'], None, '#3a6ea5', 'm'),
    ('bin', 'אלי בין, מד״א', ['אלי בין'], None, '#d32f2f', 'm'),
    ('milsec', 'המזכירות הצבאית של רה״מ', ['המזכירות הצבאית'], None, '#7a5c00', 'f'),
    ('offices', 'לשכות המטה', ['לשכת הרמטכ״ל', 'ראשי לשכות'], None, '#546e7a', 'f'),
    ('shin', 'שב״כ', ['שב״כ', 'שירות הביטחון הכללי'], None, '#37474f', 'm'),
    ('south', 'פיקוד הדרום', ['פיקוד הדרום', 'פיקוד דרום', 'קמ״ן פד״ם', 'קציני פד״ם'], None, '#8d6e63', 'm'),
    ('gaza', 'אוגדת עזה', ['אוגדת עזה'], None, '#6d4c41', 'f'),
    ('aman', 'אמ״ן', ['אמ״ן', 'אגף המודיעין'], None, '#455a64', 'm'),
    ('ops', 'אגף המבצעים', ['גורמי מבצעים', 'אגף המבצעים', 'חטיבת המבצעים'], None, '#00796b', 'm'),
    ('iaf', 'חיל האוויר', ['חיל האוויר'], None, '#0277bd', 'm'),
    ('navy', 'חיל הים', ['חיל הים', 'בסיס אשדוד'], None, '#1a237e', 'm'),
    ('police', 'משטרת ישראל', ['משטרת ישראל', 'המשטרה'], None, '#283593', 'f'),
    ('mda', 'מד״א', ['מד״א'], None, '#c62828', 'm'),
    ('staff', 'פורום המטכ״ל', ['פורום מטכ״לי', 'פיקוד צה״ל'], None, '#4e342e', 'm'),
    ('cabinet', 'הקבינט המדיני־ביטחוני', ['הקבינט'], None, '#263238', 'm'),
    ('gov', 'הממשלה', ['הממשלה'], None, '#37474f', 'f'),
]

CREDITS = {
    'halevi': ('חטיבת דובר צה״ל', 'https://commons.wikimedia.org/wiki/File:Herzi_Halevi_RAV_ALUF.jpg', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0'),
    'ronen': ('עמוס בן גרשום, לע״מ', 'https://commons.wikimedia.org/wiki/File:Ronen_Bar,_October_2021_(GPODBG_7092)_(cropped).jpg', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0'),
    'gallant': ('שלומי אמסלם, ארכיון הכנסת', 'https://commons.wikimedia.org/wiki/File:Yoav_Gallant_(SHL_9620).jpg', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'),
    'haliva': ('U.S. Embassy Jerusalem', 'https://commons.wikimedia.org/wiki/File:Aharon_Haliva_(35605530311)_(cropped).jpg', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0'),
    'finkelman': ('חטיבת דובר צה״ל', 'https://commons.wikimedia.org/wiki/File:Portrait_of_Aluf_Yaron_Finkelman,_2023.jpeg', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0'),
    'basiuk': ('חטיבת דובר צה״ל', 'https://commons.wikimedia.org/wiki/File:Oded_Basiuk_ALUF.jpg', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0'),
    'binder': ('חטיבת דובר צה״ל', 'https://commons.wikimedia.org/wiki/File:Shlomi_Binder.jpg', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0'),
    'shabtai': ('משטרת ישראל', 'https://commons.wikimedia.org/wiki/File:Kobi_Shabtai_(cropped).jpg', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0'),
    'tomer': ('חטיבת דובר צה״ל', 'https://commons.wikimedia.org/wiki/File:Tomer_Bar_ALUF.jpg', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0'),
    'gil': ('חטיבת דובר צה״ל', 'https://commons.wikimedia.org/wiki/File:Tat_aluf_Avi_Gil.jpg', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0'),
}


PERSONS = {'netanyahu', 'gallant', 'halevi', 'ronen', 'gil', 'finkelman', 'basiuk', 'binder', 'tomer', 'shabtai', 'haliva', 'rosenfeld', 'cohen', 'bin'}
OVERRIDES = {'T047': 'milsec'}  # updates delivered to the PM, not sent by him


def speaker_of(text):
    """Single named speaker (quotes, recordings): a named person beats the body in their title;
    no match -> None (caller gives them their own member)."""
    t = re.sub(r'(?<=[\u05d0-\u05ea])"(?=[\u05d0-\u05ea])', '״', text)
    best = None
    for mid, _, aliases, *_ in MEMBERS:
        for a in aliases:
            p = t.find(a)
            if p >= 0:
                key = (0 if mid in PERSONS else 1, p, -len(a))
                if best is None or key < best[0]:
                    best = (key, mid)
    return best[1] if best else None


def sender(text):
    text = re.sub(r'(?<=[\u05d0-\u05ea])"(?=[\u05d0-\u05ea])', '״', text)  # ASCII quote inside Hebrew acronyms -> gershayim
    best = None
    for mid, _, aliases, *_ in MEMBERS:
        for a in aliases:
            p = text.find(a)
            if p >= 0 and (best is None or p < best[0] or (p == best[0] and len(a) > best[1])):
                best = (p, len(a), mid)
    return best[2] if best else 'staff'


def kind_label(e):
    k = e['kind']
    if 'יומן' in k:
        return 'רישום יומן · לא תמליל שיחה'
    if e.get('quote'):
        return e.get('quoteType') or 'תוכן שיחה · ציטוט מסומן'
    return 'תקציר תחקירי · לא הודעה מקורית'


def clock(e):
    m = re.search(r'\d{1,2}:\d{2}', e['time'])
    return m.group(0).zfill(5) if m and not e['untimed'] else ''


def clean(s):
    return (s or '').replace('—', ',')  # house rule: no em dash


TRANSCRIPT_TITLES = {
    1: 'עובדה, תיק אוקטובר', 2: 'N12, השיחות הליליות של בכירי צה״ל', 3: 'N12, ממצאי תחקיר הלילה (1)', 4: 'N12, ממצאי תחקיר הלילה (2)',
    5: 'mako, ריאיון גלנט המלא', 6: 'חדשות 12, ריאיון גלנט', 7: 'הקלטות הלוי עם משפחות שכולות', 8: 'הקלטות הלוי עם תושבי העוטף',
    9: 'הקלטות הלוי על הלילה', 10: 'הקלטות חליוה', 11: 'חדשות 13, עדות רונן בר', 12: 'כאן 11, זמן אמת: איפה היה חיל האוויר',
    13: 'כאן חדשות, טייסי המשטרה וחיל האוויר', 14: 'N12, הצהרת הפרישה של הלוי'}

red = next(t for t in tx if t['id'] == 'TX02')
red_quotes = [s for s in red['segments'] if s['kind'] == 'quote']

steps, members_used = [], set()
cur_date = None
DATES = {'2023-10-06': 'שישי, 6 באוקטובר 2023', '2023-10-07': 'שבת, 7 באוקטובר 2023'}
for e in data['events']:
    if e['date'] != cur_date:
        cur_date = e['date']
        steps.append({'type': 'date', 'text': DATES.get(cur_date, cur_date), 'wait': 800})
    who = OVERRIDES.get(e['id']) or sender(e.get('speaker') or e['people'])
    members_used.add(who)
    t = clock(e)
    step = {
        'from': who, 'id': e['id'], 'time': t or '--:--',
        'kind': kind_label(e),
        'text': clean(e.get('chat') or e['event']),
        'decision': clean(e['decision']),
        'sources': [{'label': sources[k][0], 'url': sources[k][1]} for k in e['sources'] if k in sources],
        'info': {
            'time': clean(e['time']), 'people': clean(e['people']), 'event': clean(e['event']),
            'decision': clean(e['decision']), 'doc': clean(e['kind']), 'caveat': clean(e['caveat']),
        },
    }
    if e['time'].strip() != t:
        step['note'] = clean(e['time'])
    if e.get('quote'):
        step['quotes'] = [{'label': 'ציטוט קצר מן המקור', 'text': clean(e['quote'])}]
    if e['id'] == 'T030':
        step['quotes'] = [{'label': f"{q['speaker']} · {q['label']}", 'text': clean(q['text'])} for q in red_quotes]
        step['quotesNote'] = 'קטעים נבחרים מהשיחה, לא דיאלוג רציף'
    steps.append(step)

# ---- published messages from the Nova festival (data/nova.json), merged by time ----
NOVA_PATH = os.path.join(HERE, 'data', 'nova.json')
UNTIMED_AT = 11 * 60 + 59  # block of untimed morning messages, just before noon
nova_members = {}
nova_skipped = []
nova_photos = {}
ev_min = {e['id']: e['minutes'] for e in data['events']}
ev_day = {e['id']: (0 if e['date'] == '2023-10-06' else 1) for e in data['events']}
placed = []  # ((day, minutes), step) merged into the event timeline below
if os.path.exists(NOVA_PATH):
    nova = json.load(open(NOVA_PATH, encoding='utf-8'))
    ph_path = os.path.join(HERE, 'data', 'nova_photos.json')
    nova_photos = json.load(open(ph_path, encoding='utf-8')) if os.path.exists(ph_path) else {}
    for n in nova:
        m = re.fullmatch(r'(\d{1,2}):(\d{2})', (n.get('time') or '').strip())
        if not m:
            # no published clock time: shown as a block at the end of the morning, labelled as untimed
            nova_skipped.append(n['name'])
            if len(nova_skipped) == 1:
                placed.append(((1, UNTIMED_AT, 0), {'type': 'system', 'id': 'S01',
                    'text': 'הודעות מהנובה מאותו בוקר ששעתן המדויקת לא פורסמה'}))
            mins, sub = UNTIMED_AT, len(nova_skipped)
        else:
            mins, sub = int(m.group(1)) * 60 + int(m.group(2)), 0
        mid = 'nova_' + re.sub(r'\W+', '_', n['name']).strip('_')
        age = f", {n['age']}" if n.get('age') else ''
        nova_members[mid] = {'name': f"{n['name']}{age}", 'color': '#5d6d7e', 'g': 'f' if n.get('fate', '').split()[0].endswith('ה') else 'm'}
        if n['name'] in nova_photos:
            nova_members[mid]['img'] = nova_photos[n['name']]['img']
        else:
            nova_members[mid]['candle'] = True
        to = n.get('recipient') or ''
        text = clean(n['text'])
        placed.append(((1, mins, sub), {
            'from': mid, 'id': 'N' + str(sum(1 for k, x in placed if x['id'].startswith('N')) + 1).zfill(2),
            'time': f'{int(m.group(1)):02d}:{m.group(2)}' if m else 'בוקר',
            'note': (f'אל {to}' if to else '') + ('' if m else ('. ' if to else '') + 'שעה לא פורסמה, מאותו בוקר'),
            'kind': 'הודעה אמיתית שפורסמה' + (f' · נשלחה אל {to}' if to else '') + (' · תורגמה במקור' if n.get('lang') == 'en' else ''),
            'text': text, 'memorial': clean(n.get('fate') or ''),
            'sources': [{'label': n['source_title'], 'url': n['source_url']}] + [{'label': a, 'url': b} for a, b in n.get('extra_sources', [])],
            'info': {'time': (n['time'] or 'לא פורסמה, מאותו בוקר') + (f" ({n['time_note']})" if n.get('time_note') else ''), 'people': f"{n['name']}{age} → {to}".strip(' →'), 'event': text,
                     'decision': '', 'doc': 'הודעה שפורסמה בתקשורת או על ידי המשפחה. ' + (n.get('quote_status') or ''),
                     'caveat': ''},
        }))

# ---- published voice notes, calls, photos and videos of Nova victims (data/nova_media*.json) ----
NM_PATH, NMP_PATH = os.path.join(HERE, 'data', 'nova_media.json'), os.path.join(HERE, 'data', 'nova_media_plan.json')
PARTY_AT = 6 * 60 + 20  # block of untimed party media, just before 06:29
if os.path.exists(NM_PATH) and os.path.exists(NMP_PATH):
    nm = json.load(open(NM_PATH, encoding='utf-8'))
    placed.append(((1, PARTY_AT, 0), {'type': 'system', 'id': 'S02', 'text': 'מהמסיבה, לפני 06:29'}))
    nsub = {}
    for pl in json.load(open(NMP_PATH, encoding='utf-8')):
        x = nm[pl['i']]
        first = re.split(r'\s*(?:,| ו)(?=[\u05d0-\u05ea])', x['name'], maxsplit=1)[0].strip() if x['type'] != 'video' or 'שוהם' not in x['name'] else x['name']
        name = first if len(first) > 2 else x['name']
        mid = 'nova_' + re.sub(r'\W+', '_', name).strip('_')
        if mid not in nova_members:
            nova_members[mid] = {'name': name + (f", {x['age']}" if x.get('age') and ',' not in name else ''), 'color': '#5d6d7e', 'g': 'f' if (x.get('fate') or '').split(' ')[0].endswith('ה') else 'm', 'candle': True}
        blk = pl.get('block')
        if blk == 'party':
            key = (1, PARTY_AT, 1 + len([k for k in nsub if k == 'party']))
        elif blk == 'untimed':
            key = (1, UNTIMED_AT, 50 + len(nsub))
        else:
            hh, mm = pl['time'].split(':'); key = (1, int(hh) * 60 + int(mm), 1)
        nsub[pl['i']] = blk or ''
        t = pl.get('time') or ('לילה' if blk == 'party' else 'בוקר')
        kind = {'voice_note': 'הודעה קולית אמיתית שפורסמה', 'call_recording': 'הקלטת שיחה מאותו בוקר, כפי שפורסמה'}.get(x.get('kind'), 'תמונה מאותו לילה' if x['type'] == 'photo' else 'סרטון מקורי מאותו לילה ובוקר')
        note = ('שעה משוערת, ' + pl['note'] if pl.get('approx') else (pl.get('note') or '')) if pl.get('time') else ('מהמסיבה, שעה לא פורסמה' if blk == 'party' else 'שעה לא פורסמה, מאותו בוקר')
        tr = clean((x.get('transcript') or '').replace(' / ', '\n')) if pl.get('transcript') else ''
        st = {'from': mid, 'id': f"M{pl['i']:02d}", 'time': t, 'kind': kind, 'note': note, 'memorial': clean(x.get('fate') or ''),
              'sources': [{'label': clean(x.get('source_title') or x.get('media_platform') or 'מקור'), 'url': x['media_page']}],
              'info': {'time': t + (f' ({note})' if note else ''), 'people': clean(x['name']) + (f" → {clean(x['recipient'])}" if x.get('recipient') else ''),
                       'event': tr or clean(x.get('caption_or_credit') or ''), 'decision': '', 'doc': kind + (f". צילום: {clean(x['filmed_by'])}" if x.get('filmed_by') else '') + (f". {clean(x['caption_or_credit'])}" if x.get('caption_or_credit') else ''), 'caveat': ''}}
        if x['type'] == 'voice':
            dur = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(HERE, pl['file'])], capture_output=True, text=True).stdout.strip()
            st.update(type='voice', audio=pl['file'], dur='%d:%02d' % divmod(round(float(dur or 0)), 60), transcript=tr)
        elif x['type'] == 'photo':
            st.update(type='image', src=pl['file'], text=pl.get('caption', ''))
        else:
            dur = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(HERE, pl['file'])], capture_output=True, text=True).stdout.strip()
            st.update(type='video', src=pl['file'], poster=pl.get('poster', ''), dur='%d:%02d' % divmod(round(float(dur or 0)), 60))
        members_used.add(mid)
        placed.append((key, st))

# ---- every published message from residents besieged in their homes (data/besieged.json) ----
BS_PATH = os.path.join(HERE, 'data', 'besieged.json')
END_OF_DAY = 24 * 60  # block of messages from that day whose time was not published
if os.path.exists(BS_PATH):
    BMP = os.path.join(HERE, 'data', 'besieged_media_plan.json')
    bplan = {}
    for p in (json.load(open(BMP, encoding='utf-8')) if os.path.exists(BMP) else []):
        mt = p['match']; bplan[(mt['time'], mt['community'], mt['text'])] = p
    def media_of(x):
        return bplan.get((x.get('time'), x['community'], x.get('text') or x.get('transcript')))
    bs = [x for x in json.load(open(BS_PATH, encoding='utf-8'))
          if (x.get('type', 'text') == 'text' and (x.get('text') or '').strip()) or media_of(x)]
    if any(not x.get('time') for x in bs):
        placed.append(((1, END_OF_DAY, 0), {'type': 'system', 'id': 'S03', 'text': 'הודעות מאותו יום ששעתן לא פורסמה'}))
    for j, x in enumerate(bs):
        m = re.fullmatch(r'(\d{1,2}):(\d{2})', (x.get('time') or '').strip())
        key = (1, int(m.group(1)) * 60 + int(m.group(2)), 2) if m else (1, END_OF_DAY, 1 + j)
        snd = clean(x.get('sender') or 'תושב/ת')
        if re.search(r'לא צוין|באדיבות', snd):
            snd = 'תיעוד'
        snd = re.sub(r'\s*\(.*?\)\s*', ' ', snd).strip()
        name = f"{snd}, {clean(x['community'])}"
        mid = 'res_' + re.sub(r'\W+', '_', name).strip('_')
        if mid not in nova_members:
            nova_members[mid] = {'name': name, 'color': '#6b7f5e', 'g': 'f' if re.search(r'ת$|ה$', x.get('sender') or '') else 'm'}
        members_used.add(mid)
        grp = x.get('group') or ''
        kind = 'הודעה מקבוצת הוואטסאפ של היישוב, כפי שפורסמה' if 'קבוצ' in grp or 'group' in grp.lower() else 'הודעה שנשלחה באותו יום, כפי שפורסמה'
        t = f'{int(m.group(1)):02d}:{m.group(2)}' if m else ''
        placed.append((key, {
            'from': mid, 'id': f'B{j + 1:04d}', 'time': t, 'kind': kind,
            'text': clean(x.get('text') or x.get('transcript') or ''), **({'memorial': clean(x['sender_fate'])} if x.get('sender_fate') else {}),
            'note': clean(grp) + (('. ' if grp else '') + clean(x['note']) if x.get('note') else ''),
            'sources': [{'label': clean(x.get('source_title') or 'מקור'), 'url': x.get('source_url') or x.get('media_page') or ''}],
            'info': {'time': t or 'לא פורסמה', 'people': name + (f' · {clean(grp)}' if grp else ''), 'event': clean(x.get('text') or x.get('transcript') or ''), 'decision': '',
                     'doc': kind + (f". {clean(x['note'])}" if x.get('note') else ''), 'caveat': ''},
        }))
        mp = media_of(x)
        if mp:  # original video / voice recording from that day
            st = placed[-1][1]
            dur = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(HERE, mp['file'])], capture_output=True, text=True).stdout.strip()
            dd = '%d:%02d' % divmod(round(float(dur or 0)), 60)
            if x['type'] == 'video':
                st.update(type='video', src=mp['file'], poster=mp.get('poster', ''), dur=dd, kind='סרטון מקורי מאותו יום, כפי שפורסם')
            else:
                st.update(type='voice', audio=mp['file'], dur=dd, transcript=clean(x.get('transcript') or x.get('text') or ''), text='', kind='הקלטה מקורית מאותו יום, כפי שפורסמה')

# ---- recorded speech from the transcripts file (data/recordings.json) ----
REC_PATH = os.path.join(HERE, 'data', 'recordings.json')
AUDIO_MAP = json.load(open(os.path.join(HERE, 'data', 'audio_map.json'), encoding='utf-8')) if os.path.exists(os.path.join(HERE, 'data', 'audio_map.json')) else {}
rec_members = {}
if os.path.exists(REC_PATH):
    # verified written wording from the articles (data/recordings_verified.json) replaces the ASR text
    VER_PATH = os.path.join(HERE, 'data', 'recordings_verified.json')
    verified = {}
    if os.path.exists(VER_PATH):
        nth = {}
        for v in json.load(open(VER_PATH, encoding='utf-8')):  # same order as recordings.json; nth separates equal timestamps
            k = (str(v['section']), v['video_ts']); nth[k] = nth.get(k, 0) + 1
            if v.get('status') in ('matched', 'partial') and v.get('written_text'):
                verified[k + (nth[k],)] = v
    nth = {}
    for r in json.load(open(REC_PATH, encoding='utf-8')):
        if r.get('skip') or r.get('mode') == 'narrator_quote':
            v = None
        else:
            k = (str(r['section']), r.get('video_ts')); nth[k] = nth.get(k, 0) + 1
            v = verified.get(k + (nth[k],))
            clip = AUDIO_MAP.get(f'{k[0]}|{k[1]}|{nth[k]}')
        if v and not r.get('verified_text'):
            r = dict(r, asr_text=r['text'], text=re.sub('[\u200e\u200f\u202a-\u202e]', '', v['written_text']),
                     verified_text={'label': v.get('article_title') or 'הכתבה הכתובה', 'url': v['article_url']})
        m = re.fullmatch(r'(\d{1,2}):(\d{2})', (r.get('clock') or '').strip())
        if not m or r.get('skip'):
            continue
        mins = int(m.group(1)) * 60 + int(m.group(2))
        day = 0 if r.get('date') == '2023-10-06' else 1
        who = sender(r['speaker'])
        if who not in PERSONS or r.get('display'):  # anonymous / unnamed speaker: own entry, never an institution
            name = clean(r.get('display') or r['speaker'])
            who = 'rec_' + re.sub(r'\W+', '_', name).strip('_')
            rec_members[who] = {'name': name, 'color': '#607d8b', 'g': 'm'}
        members_used.add(who)
        live = r.get('mode') == 'realtime_recording'
        approx = bool(re.search(r'approx|uncertain|ASR|read as|placed with|follows|ties it', r.get('clock_basis') or ''))
        kind = ('הקלטה מ־7 באוקטובר' if live else 'עדות בדיעבד, מתוך ריאיון או הקלטה מאוחרת') + (' · הקול שוחזר ב־AI בכתבה' if r.get('ai_voice') else '') + \
            (' · הנוסח לפי התמלול שפורסם בכתבה' if r.get('verified_text') else ' · תמלול אוטומטי, עלול לכלול שגיאות')
        ts = r.get('video_ts') or ''
        secs = sum(int(x) * 60 ** i for i, x in enumerate(reversed(ts.split(':')))) if re.fullmatch(r'[\d:]+', ts) else None
        title = {int(k): v for k, v in TRANSCRIPT_TITLES.items()}.get(int(r['section']), 'מקור')
        if r.get('skip') or r.get('mode') == 'narrator_quote':
            clip = None
        if r.get('mode') == 'narrator_quote':  # words quoted by the narrator, no recording exists
            nkind = 'ציטוט מפי הקריין בכתבה · לא הקלטה · תמלול אוטומטי'
            placed.append(((day, mins, 0), {
                'from': who, 'id': 'Q' + str(sum(1 for k, x in placed if x['id'].startswith('Q')) + 1).zfill(2),
                'time': f'{int(m.group(1)):02d}:{m.group(2)}', 'kind': nkind,
                'note': 'שעה משוערת לפי הכתבה' + (f", אל {clean(r['listener'])}" if r.get('listener') else ''),
                'quotes': [{'label': f"{clean(r['speaker'])}, כפי שצוטט בכתבה", 'text': clean(r['text'])}],
                'sources': [{'label': f'{title}, בדקה {ts}', 'url': r['source_url']}],
                'info': {'time': r['clock'] + ' (משוערת, לפי ההקשר בכתבה)', 'people': clean(r['speaker']) + (f" → {clean(r['listener'])}" if r.get('listener') else ''),
                         'event': 'התמלול המלא של קטע הקריינות: ' + clean(r['context']), 'decision': '',
                         'doc': nkind + '. ' + clean(r.get('omitted') or '') + f'. במקור: {title}, בדקה {ts}', 'caveat': ''},
            }))
            continue
        placed.append(((day, mins, 0), {
            'from': who, 'type': 'voice', 'id': 'R' + str(sum(1 for k, x in placed if x['id'].startswith('R')) + 1).zfill(2),
            'time': f'{int(m.group(1)):02d}:{m.group(2)}', 'kind': kind,
            'dur': ('%d:%02d' % divmod(round(clip['dur']), 60)) if clip else '0:%02d' % min(59, max(6, len(r['text']) // 11)),
            **({'audio': clip['file']} if clip else {}),
            'note': (('שעה משוערת לפי הכתבה' if approx else '') if live else ('העדות מתייחסת לשעה ' + r['clock'] + (', משוערת' if approx else '')))
                    + ('. ' + clip['note'] if clip and clip.get('note') else ''),
            'transcript': clean(r['text']),
            'sources': ([r['verified_text']] if r.get('verified_text') else []) + [{'label': f'{title}, בדקה {ts}', 'url': r['source_url']}],
            'info': {'time': r['clock'] + (' (משוערת, לפי ההקשר בכתבה)' if approx else ' (לפי הכתבה)'), 'people': clean(r['speaker']) + (f" → {clean(r['listener'])}" if r.get('listener') else ''),
                     'event': clean(r['text']), 'decision': '',
                     'doc': kind + f'. במקור: {title}, בדקה {ts}',
                     'caveat': ''},
        }))

# ---- timed quotes mined from the articles and documents (data/extra_*.json) ----
SHORT_NAMES = {  # display names for speakers that are long titles in the sources
    'רל"ש הרמטכ"ל סא"ל מתן פלדמן': 'מתן פלדמן, רל״ש הרמטכ״ל',
    'פעיל חמאס (תקשורת שנקלטה ביחידה 8200)': 'פעיל חמאס (האזנת 8200)',
}
EXTRA_KIND = {
    'document_quote': 'ציטוט ממסמך', 'diary_entry': 'רישום ביומן', 'protocol_quote': 'ציטוט מפרוטוקול ועדה, עדות בדיעבד',
    'realtime_quote': 'ציטוט מאותו יום, כפי שפורסם', 'testimony_quote': 'עדות בדיעבד, ציטוט',
    'journalistic_reconstruction': 'שחזור עיתונאי, לא ציטוט',
}
extra_members = {}
for fn in ('extra_articles.json', 'extra_documents.json'):
    path = os.path.join(HERE, 'data', fn)
    if not os.path.exists(path):
        continue
    for x in json.load(open(path, encoding='utf-8')):
        m = re.fullmatch(r'(\d{1,2}):(\d{2})', (x.get('clock') or '').strip())
        if not m or x.get('skip'):
            continue
        day = 0 if x.get('date') == '2023-10-06' else 1
        mins, sub = int(m.group(1)) * 60 + int(m.group(2)), 0
        rel = x.get('relates_to') or ''
        if rel in ev_min:  # right after the event it adds wording to, as a reply
            day, mins, sub = ev_day[rel], ev_min[rel], 1
        elif not re.fullmatch(r'[RQN]\d+', rel):
            rel = ''  # unknown id: no reply quote; a recording/quote id keeps its own clock and replies to it
        who = speaker_of(x['speaker']) or 'staff'
        if who == 'staff':
            name = SHORT_NAMES.get(x['speaker'], clean(x['speaker']))
            who = 'ext_' + re.sub(r'\W+', '_', name).strip('_')
            extra_members[who] = {'name': name, 'color': '#6d7f8a', 'g': 'm'}
        members_used.add(who)
        kind = EXTRA_KIND.get(x.get('kind'), 'ציטוט') + ' · ' + clean(x['source_title'])
        recon = x.get('kind') == 'journalistic_reconstruction'
        text = clean(x['text'])
        to = clean(x.get('listener') or '')
        src = {'label': clean(x['source_title']) + (f", עמ׳ {x['page']}" if x.get('page') else ''), 'url': x['url']}
        placed.append(((day, mins, sub), {
            'from': who, 'id': 'X' + str(sum(1 for k, y in placed if y['id'].startswith('X')) + 1).zfill(2),
            'time': f'{int(m.group(1)):02d}:{m.group(2)}', 'kind': kind,
            **({'reply': rel} if rel else {}),
            'note': ('שעה משוערת. ' if x.get('approx') else '') + (f'אל {to}. ' if to else '') + clean(x.get('clock_basis') or ''),
            **({'text': text} if recon else {'quotes': [{'label': clean(x['speaker']) + (', כפי שצוטט' if x.get('kind') != 'diary_entry' else ''), 'text': text}]}),
            'sources': [src],
            'info': {'time': x['clock'] + (' (משוערת)' if x.get('approx') else '') + (f" · {clean(x.get('clock_basis') or '')}" if x.get('clock_basis') else ''),
                     'people': clean(x['speaker']) + (f' → {to}' if to else ''), 'event': text, 'decision': '',
                     'doc': kind + ('. מקף ארוך במקור הוחלף בפסיק' if x.get('dash_replaced') else ''), 'caveat': ''},
        }))

# ---- merge extras into the timeline by (day, minute), before the first later event ----
placed.sort(key=lambda x: x[0])
merged, day = [], 0
for st in steps:
    if st.get('type') == 'date':
        day = 0 if '6 באוקטובר' in st['text'] else 1
    if st.get('id') in ev_min:
        key = (ev_day[st['id']], ev_min[st['id']], 0)
        while placed and placed[0][0] < key:
            merged.append(placed.pop(0)[1])
    merged.append(st)
    if st.get('id') in ev_min:  # replies to this event follow it directly
        mine = [p for p in placed if p[0][2] == 1 and p[1].get('reply') == st['id']]
        merged += [p[1] for p in mine]
        placed = [p for p in placed if p not in mine]
merged += [p[1] for p in placed]
steps = merged

def chrono(seq):
    """Stable chronological order inside each day; items without a clock follow the item before them."""
    out, day, last = [], 0, -1
    for n, st in enumerate(seq):
        if st.get('type') == 'date':
            day = 0 if '6 באוקטובר' in st['text'] else 1
            last = -1
            key = (day, -1)
        else:
            m = re.fullmatch(r'(\d\d):(\d\d)', st.get('time') or '')
            if st.get('id') == 'S02' or st.get('time') == 'לילה':
                key = (day, PARTY_AT)
            elif st.get('id') == 'S03' or (str(st.get('id', '')).startswith('B') and not st.get('time')):
                key = (day, END_OF_DAY)
            elif st.get('id') == 'S01' or st.get('time') == 'בוקר':
                key = (day, UNTIMED_AT)
            elif m:
                key = (day, int(m.group(1)) * 60 + int(m.group(2)))
            else:
                key = (day, last)
            last = key[1]
        out.append((key, n, st))
    out.sort(key=lambda t: (t[0], t[1]))
    return [t[2] for t in out]


steps = chrono(steps)

members = {'me': {'name': 'את/ה', 'color': '#00a884', 'g': 'm'}}
for mid, name, _, portrait, color, g in MEMBERS:
    if mid in members_used:
        m = {'name': name, 'color': color, 'g': g}
        if portrait:
            m['img'] = f'portraits/{portrait}.jpg'
        members[mid] = m

members.update(rec_members)
members.update(extra_members)
members.update(nova_members)  # after the officials, so the header list starts with them

credits = ''.join(
    f'<li><a href="{c[1]}" target="_blank" rel="noopener">{members[k]["name"]} · {c[0]}</a> · <a href="{c[3]}" target="_blank" rel="noopener">{c[2]}</a></li>'
    for k, c in CREDITS.items() if k in members)
about = (
    '<h3>על השחזור</h3>'
    '<p><b>זו אינה קבוצת וואטסאפ אמיתית.</b> כל בועה היא תקציר של אירוע מתועד (שעה, משתתפים, אירוע והחלטה), '
    'כפי שהוא מופיע במקורות פומביים: תחקירים עיתונאיים, תצהירים, יומנים שפורסמו ועדויות בדיעבד. '
    'השולח המוצג הוא הגורם הראשון ברשומה, לא בהכרח מי שכתב או אמר דבר.</p>'
    '<p>ציטוט ישיר מופיע רק כשפורסם במקור, ומסומן כציטוט. שעות שנויות במחלוקת מוצגות עם כל הגרסאות. '
    'לחיצה על בועה פותחת את הרשומה המלאה: סוג התיעוד וקישורים למקורות.</p>'
    '<p><b>הודעות מהנובה (🕯️):</b> הודעות אמיתיות ששלחו נרצחי ונחטפי מסיבת הנובה לבני משפחה וחברים, '
    'כפי שפורסמו בתקשורת או על ידי המשפחות, מילה במילה ובשעה שפורסמה. הודעה שפורסמה באנגלית בלבד מוצגת באנגלית. '
    'הודעות שהשעה שלהן לא פורסמה מוצגות יחד בסוף הבוקר, תחת השעה "בוקר". יהי זכרם ברוך.</p>'
    f'<p>{sum(1 for s in steps if str(s.get("id", "")).startswith("T"))} אירועים, 6 עד 7 באוקטובר 2023.</p>'
    '<h3>תצלומים</h3><p>התצלומים משמשים לזיהוי בלבד ואינם בהכרח מ־7 באוקטובר. בוצעו הקטנה וחיתוך עגול; '
    'העיבודים נשארים תחת רישיון הקובץ המקורי, ואין בתצוגה תמיכה מטעם המצולמים.</p>'
    f'<ul class="credits">{credits}</ul>'
    + ('<h3>תמונות נרצחי ונחטפי הנובה</h3><p>תמונות אישיות שפורסמו בתקשורת, ברובן באדיבות המשפחות. הזכויות שמורות לבעליהן; '
       'לפני פרסום ציבורי נדרש אישור המשפחות ובעלי הזכויות.</p><ul class="credits">'
       + ''.join(f'<li><a href="{v["source"]}" target="_blank" rel="noopener">{k} · {v["credit"]}</a></li>' for k, v in nova_photos.items())
       + '</ul>' if nova_photos else '')
)

group = {
    'name': 'שעות ההכרעה · 6-7 באוקטובר',
    'avatar': '🕯️', 'avatarBg': '#263238',
    'subtitle': 'לחצו כאן לפרטי הקבוצה',
    'pinned': 'שחזור תחקירי. לא קבוצת וואטסאפ אמיתית. הבועות הן תקצירי מקורות, לא הודעות שנשלחו.',
    'about': about,
    'lockText': 'שחזור תחקירי מתוך מקורות פומביים. אף הודעה כאן לא נשלחה במציאות; כל בועה מקושרת למקור שלה.',
    'readOnly': None,  # composer visible
    'loop': 'restart',
    'sfx': 'sfx/msg.mp3',
    'interval': 6000,
    'revealAfter': 4,  # 4 messages arrive one by one, then the whole chat is shown  # a new message every 6 seconds
    'typingMax': 3200,
    'members': members,
    'history': [{'type': 'lock'}] + steps[:3],
    'scenes': [steps[3:]],
    'autoReplies': [],
}

with open(os.path.join(HERE, 'content.js'), 'w', encoding='utf-8') as f:
    f.write('/* Generated by tools/build_oct7.py from the "שעות ההכרעה" archive. Edit the generator, not this file. */\n')
    f.write('window.GROUP = ' + json.dumps(group, ensure_ascii=False, separators=(',', ':')) + ';\n')

os.makedirs(os.path.join(HERE, 'portraits'), exist_ok=True)
for fn in os.listdir(os.path.join(SRC, 'portraits')):
    shutil.copy2(os.path.join(SRC, 'portraits', fn), os.path.join(HERE, 'portraits', fn))

print(f'nova senders {len(nova_members)}, untimed (end of morning): {nova_skipped}')
print(f'{len(steps)} steps, {len(members) - 1} senders:', ', '.join(m['name'] for k, m in members.items() if k != 'me'))


# ---- dramatized version (data/drama.json): third-person summaries rewritten as first-person chat, clearly labelled ----
DRAMA_PATH = os.path.join(HERE, 'data', 'drama.json')
if os.path.exists(DRAMA_PATH):
    import copy
    drama = json.load(open(DRAMA_PATH, encoding='utf-8'))
    DX_PATH = os.path.join(HERE, 'data', 'drama_extra.json')
    drama_extra = json.load(open(DX_PATH, encoding='utf-8')) if os.path.exists(DX_PATH) else {}
    dg = copy.deepcopy(group)
    DLABEL = 'המחזה: נוסח בגוף ראשון על סמך המקור, לא ציטוט'
    DRAMA_SKIP = {'R08',  # Gallant's later account of 06:29 = T026 in the scene
                  'X01', 'X18', 'X43', 'X67',
                  'X15', 'X16'}  # Feldman's 03:20 lines = the content Halevi tells in his 03:10 voice note (R02)  # written lines that repeat what the same person says in a voice note (R01, R04, R05, R17)
    ROLE_NAMES = {'role_brigade_cmdrs': 'מפקדי החטיבות', 'role_soroka': 'סורוקה', 'role_iaf_heli': 'מסוקי חיל האוויר'}

    def dramatize(seq):
        out = []
        for st in seq:
            d = drama.get(st.get('id') or '')
            dx = drama_extra.get(st.get('id') or '')
            if not d and dx:  # mined quote/testimony/document rewritten as in-the-moment messages
                if dx.get('skip') or not dx.get('messages'):
                    continue
                rel = st.get('reply') or ''
                d = {'messages': dx['messages']}
                st = dict(st, _reply=(rel + 'd1') if rel in drama else rel)
            if st.get('id') in DRAMA_SKIP:  # retells a moment already dramatized
                continue
            if not d:
                sid = st.get('id') or ''
                if sid.startswith(('X', 'Q')):
                    k = st.get('kind', '')
                    who_name = dg['members'].get(st.get('from'), {}).get('name', '')
                    # not something a person said in the group: reconstructions, diary rows, committee lines
                    # keep only words actually said/written that day; testimonies, documents, diary rows and
                    # reconstructions stay in the regular version (their content is in the dramatized events)
                    if sid.startswith('X') and not k.startswith('ציטוט מאותו יום'):
                        continue
                    st = dict(st)
                    if st.get('quotes'):
                        st['text'] = ' '.join(q['text'] for q in st.pop('quotes'))
                        st.pop('quotesNote', None)
                    if st.get('reply') and st['reply'] in drama:
                        st['reply'] = st['reply'] + 'd1'
                out.append(st)
                continue
            for i, msg in enumerate(d['messages']):
                who = msg['from']
                if who not in dg['members']:
                    if who in dict((m[0], m) for m in MEMBERS):
                        mm = next(m for m in MEMBERS if m[0] == who)
                        dg['members'][who] = {'name': mm[1], 'color': mm[4], 'g': mm[5], **({'img': f'portraits/{mm[3]}.jpg'} if mm[3] else {})}
                    else:
                        dg['members'][who] = {'name': clean(msg.get('role_name') or who), 'color': '#78909c', 'g': 'm'}
                to = msg.get('to')
                to_name = dg['members'][to]['name'] if to in dg['members'] else ROLE_NAMES.get(to, to or '')
                out.append({
                    **({'reply': st['_reply']} if i == 0 and st.get('_reply') else {}),
                    'from': who, 'id': f"{st['id']}d{i + 1}", 'time': st['time'],
                    'kind': DLABEL + (f' · אל {to_name}' if to_name else ''),
                    'text': clean(msg['text']),
                    'sources': st.get('sources', []), 'info': dict(st.get('info', {}), doc=DLABEL + '. ' + st.get('info', {}).get('doc', '')),
                })
        return out
    dg['history'] = dramatize(dg['history'])
    dg['scenes'] = [dramatize(sc) for sc in dg['scenes']]
    dg['name'] = group['name'] + ' · המחזה'
    dg['pacing'] = 'drama'  # slow night, rapid bursts, time jumps
    dg['plain'] = True  # bubbles show only who speaks and what they say; details on tap
    dg['pinned'] = 'גרסת המחזה: הדברים נוסחו מחדש בגוף ראשון על סמך המקורות. אלה אינם ציטוטים ואינן הודעות אמיתיות.'
    dg['lockText'] = 'גרסת המחזה. כל בועה מסומנת "המחזה" נוסחה בגוף ראשון על סמך מקור פומבי ואינה ציטוט. הודעות הנובה, ההקלטות והציטוטים נשארו כפי שפורסמו.'
    dg['sfx'] = '../' + group['sfx']
    # drama only: transcript fixes the user asked for (ASR garble, opening narration)
    DRAMA_TRANSCRIPT = {
        'R02': lambda t: re.sub(r'\s*הפקו\s+', ' ', t[t.find('בשעות האחרונות'):] if 'בשעות האחרונות' in t else t),
        # the 17:30 line moves under the voice note it duplicated
        'R01': lambda t: ' '.join(m['text'] for m in drama_extra.get('X01', {}).get('messages', [])) or t,
        'R04': lambda t: ' '.join(m['text'] for m in drama_extra.get('X18', {}).get('messages', [])) or t,
        'R05': lambda t: ' '.join(m['text'] for m in drama_extra.get('X43', {}).get('messages', [])) or t,
        'R17': lambda t: ' '.join(m['text'] for m in drama_extra.get('X67', {}).get('messages', [])) or t,
    }
    DVT = os.path.join(HERE, 'data', 'drama_voice_text.json')
    for k, v in (json.load(open(DVT, encoding='utf-8')) if os.path.exists(DVT) else {}).items():
        DRAMA_TRANSCRIPT[k] = (lambda txt: (lambda t: txt))(v)  # clean first-person text under each voice note
    for sc in [dg['history']] + dg['scenes']:
        for st in sc:
            if st.get('id') in DRAMA_TRANSCRIPT and st.get('transcript'):
                st['transcript'] = DRAMA_TRANSCRIPT[st['id']](st['transcript'])
    for sc in [dg['history']] + dg['scenes']:
        for st in sc:
            if st.get('audio'):
                st['audio'] = '../' + st['audio']
            for k in ('src', 'poster'):
                if st.get(k) and not st[k].startswith(('../', 'http', 'data:')):
                    st[k] = '../' + st[k]
    for m in dg['members'].values():
        if m.get('img') and not m['img'].startswith('../'):
            m['img'] = '../' + m['img']
    with open(os.path.join(HERE, 'content-drama.js'), 'w', encoding='utf-8') as f:
        f.write('/* Generated by tools/build_oct7.py: dramatized version. */\n')
        f.write('window.GROUP = ' + json.dumps(dg, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('drama version written:', sum(len(sc) for sc in dg['scenes']) + len(dg['history']), 'steps')
