"""Descarga una foto real con licencia libre por modelo: primero Wikipedia/Wikimedia Commons, si no hay, Openverse (Flickr y otras).
Uso: python tools/descargar_fotos.py   (lee tools/lista.txt y escribe en fotos/)"""
import json, os, re, time, urllib.error, urllib.parse, urllib.request
UA = {"User-Agent": "KilometroCeroFotos/1.0 (proyecto personal no comercial; github actions)"}
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "fotos"); os.makedirs(OUT, exist_ok=True)
CRED = os.path.join(OUT, "creditos.json")
cred = json.load(open(CRED, encoding="utf-8")) if os.path.exists(CRED) else {}
def fetch(u):
    for intento in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and intento < 5:
                espera = int(e.headers.get("Retry-After") or 0) or 15 * (intento + 1)
                print("  esperando", espera, "s (", e.code, ")"); time.sleep(min(espera, 120)); continue
            raise
def get(url, params):
    return json.loads(fetch(url + "?" + urllib.parse.urlencode(params)))
MALO = r"logo|emblem|badge|interior|engine|dash|cockpit|motor[_ ]?(bay|raum)|steering|(^|[_ (])(toys?|lego|diecast|scale)([_ )]|$)|model[_ ]kit|museum_entrance"
def vale(texto, tok):
    if re.search(MALO, texto, re.I): return False
    return not tok or re.search(tok, texto.replace("_", " "), re.I) or re.search(tok, texto, re.I)
def lead_image(q, tok=None):
    d = get("https://en.wikipedia.org/w/api.php", {"action": "query", "generator": "search", "gsrsearch": q, "gsrlimit": 4, "prop": "pageimages", "piprop": "name", "format": "json"})
    pages = sorted(d.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
    for p in pages:
        n = p.get("pageimage", "")
        if re.search(r"\.(jpe?g|webp)$", n, re.I) and vale(n, tok):
            return n
    return None
def commons_search(q, tok=None):
    d = get("https://commons.wikimedia.org/w/api.php", {"action": "query", "list": "search", "srsearch": q, "srnamespace": 6, "srlimit": 30, "format": "json"})
    for r in d.get("query", {}).get("search", []):
        t = r["title"]
        if re.search(r"\.jpe?g$", t, re.I) and vale(t, tok):
            return t.split(":", 1)[1]
    return None
def openverse(q, moto, tok=None):
    """Segunda fuente: Openverse (fotos con licencia Creative Commons de Flickr y otras webs)."""
    d = get("https://api.openverse.org/v1/images/", {"q": q, "license_type": "all-cc", "page_size": 20, "mature": "false"})
    claves = [w.lower() for w in q.split()[1:] if len(w) > 1] or [q.lower()]
    for r in d.get("results", []):
        t = (r.get("title") or "").lower() + " " + " ".join(x.get("name", "") for x in r.get("tags") or []).lower()
        if re.search(MALO, t, re.I): continue
        if (tok and vale(t, tok)) or (not tok and all(k in t for k in claves[:2])):
            return r
    return None
def strip(h): return re.sub(r"<[^>]+>", "", h or "").strip()
_ids=[l.split("|")[0] for l in open(os.path.join(BASE,"tools","lista.txt"),encoding="utf-8") if "|" in l]
MOTOS=set(_ids[220:])
faltan = []
for line in open(os.path.join(BASE, "tools", "lista.txt"), encoding="utf-8"):
    if "|" not in line: continue
    vid, q, *resto = line.strip().split("|", 2)
    tok = resto[0] if resto else None
    dest = os.path.join(OUT, vid + ".jpg")
    if os.path.exists(dest) and vid in cred: continue
    try:
        if tok:  # búsqueda estricta: el nombre de la foto debe indicar la generación correcta
            name = commons_search(q, tok) or lead_image(q, tok) or commons_search(" ".join(q.split()[:3]), tok)
        else:
            name = lead_image(q) or lead_image(" ".join(q.split()[:3])) or commons_search(q + (" motorcycle" if vid in MOTOS else " car"))
        if not name:
            r = openverse(q, vid in MOTOS, tok)
            if not r: faltan.append(vid); continue
            datos = fetch(r.get("thumbnail") or r["url"])
            with open(dest, "wb") as f: f.write(datos)
            cred[vid] = {"archivo": r.get("title", "")[:120], "autor": (r.get("creator") or "")[:120], "licencia": ("CC " + (r.get("license") or "").upper() + " " + (r.get("license_version") or "")).strip(), "url": r.get("foreign_landing_url"), "fuente": r.get("source") or "Openverse"}
            print("ok openverse", vid, r.get("title")); time.sleep(4); continue
        d = get("https://commons.wikimedia.org/w/api.php", {"action": "query", "titles": "File:" + name, "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": 800, "format": "json"})
        ii = list(d["query"]["pages"].values())[0].get("imageinfo")
        if not ii: faltan.append(vid); continue
        ii = ii[0]; md = ii.get("extmetadata", {})
        datos = fetch(ii.get("thumburl") or ii["url"])
        with open(dest, "wb") as f: f.write(datos)
        cred[vid] = {"archivo": name, "autor": strip(md.get("Artist", {}).get("value"))[:120], "licencia": strip(md.get("LicenseShortName", {}).get("value")), "url": ii.get("descriptionurl"), "fuente": "Wikimedia Commons"}
        print("ok", vid, name)
    except Exception as e:
        print("error", vid, e); faltan.append(vid)
    time.sleep(2)
json.dump(cred, open(CRED, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(OUT, "faltan.txt"), "w").write("\n".join(faltan))
print("fotos:", len(cred), "faltan:", len(faltan))
open(os.path.join(OUT, "fotos.js"), "w", encoding="utf-8").write("window.FOTOS=" + json.dumps(cred, ensure_ascii=False) + ";\n")
