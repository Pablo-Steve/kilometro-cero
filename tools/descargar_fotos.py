"""Descarga una foto real (Wikipedia/Wikimedia Commons, licencia libre) por modelo.
Uso: python tools/descargar_fotos.py   (lee tools/lista.txt y escribe en fotos/)"""
import json, os, re, time, urllib.parse, urllib.request
UA = {"User-Agent": "KilometroCeroFotos/1.0 (proyecto personal no comercial; github actions)"}
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "fotos"); os.makedirs(OUT, exist_ok=True)
CRED = os.path.join(OUT, "creditos.json")
cred = json.load(open(CRED, encoding="utf-8")) if os.path.exists(CRED) else {}
def get(url, params):
    u = url + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30) as r:
        return json.load(r)
def lead_image(q):
    d = get("https://en.wikipedia.org/w/api.php", {"action": "query", "generator": "search", "gsrsearch": q, "gsrlimit": 4, "prop": "pageimages", "piprop": "name", "format": "json"})
    pages = sorted(d.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
    for p in pages:
        n = p.get("pageimage", "")
        if re.search(r"\.(jpe?g|png|webp)$", n, re.I) and not re.search(r"logo|emblem|badge|interior|engine", n, re.I):
            return n
    return None
def commons_search(q):
    d = get("https://commons.wikimedia.org/w/api.php", {"action": "query", "list": "search", "srsearch": q, "srnamespace": 6, "srlimit": 10, "format": "json"})
    for r in d.get("query", {}).get("search", []):
        t = r["title"]
        if re.search(r"\.jpe?g$", t, re.I) and not re.search(r"interior|engine|logo|dashboard|motor", t, re.I):
            return t.split(":", 1)[1]
    return None
def strip(h): return re.sub(r"<[^>]+>", "", h or "").strip()
_ids=[l.split("|")[0] for l in open(os.path.join(BASE,"tools","lista.txt"),encoding="utf-8") if "|" in l]
MOTOS=set(_ids[220:])
faltan = []
for line in open(os.path.join(BASE, "tools", "lista.txt"), encoding="utf-8"):
    if "|" not in line: continue
    vid, q = line.strip().split("|", 1)
    dest = os.path.join(OUT, vid + ".jpg")
    if os.path.exists(dest) and vid in cred: continue
    try:
        name = lead_image(q) or lead_image(" ".join(q.split()[:3])) or commons_search(q + (" motorcycle" if vid in MOTOS else " car"))
        if not name: faltan.append(vid); continue
        d = get("https://commons.wikimedia.org/w/api.php", {"action": "query", "titles": "File:" + name, "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": 800, "format": "json"})
        ii = list(d["query"]["pages"].values())[0].get("imageinfo")
        if not ii: faltan.append(vid); continue
        ii = ii[0]; md = ii.get("extmetadata", {})
        req = urllib.request.Request(ii.get("thumburl") or ii["url"], headers=UA)
        with urllib.request.urlopen(req, timeout=60) as r, open(dest, "wb") as f: f.write(r.read())
        cred[vid] = {"archivo": name, "autor": strip(md.get("Artist", {}).get("value"))[:120], "licencia": strip(md.get("LicenseShortName", {}).get("value")), "url": ii.get("descriptionurl")}
        print("ok", vid, name)
    except Exception as e:
        print("error", vid, e); faltan.append(vid)
    time.sleep(0.4)
json.dump(cred, open(CRED, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(OUT, "faltan.txt"), "w").write("\n".join(faltan))
print("fotos:", len(cred), "faltan:", len(faltan))
open(os.path.join(OUT, "fotos.js"), "w", encoding="utf-8").write("window.FOTOS=" + json.dumps(cred, ensure_ascii=False) + ";\n")
