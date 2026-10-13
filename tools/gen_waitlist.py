"""Generate public/waitlist.html, taking every choice from the Worker's own lists (src/index.js OPTIONS),
so the page and the server always agree on valid answers.

Run from the repository root:  python tools/gen_waitlist.py
"""
import html
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]
opts = json.loads(subprocess.run(
    ["node", "-e", "import('" + (ROOT / "src" / "index.js").as_uri() + "').then(m => console.log(JSON.stringify(m.OPTIONS)))"],
    check=True, capture_output=True, text=True).stdout)

e = lambda s: html.escape(s, quote=True)


def radios(name, items):
    return "".join(f'<label class="choice"><input type="radio" name="{name}" value="{e(v)}"><span>{e(v)}</span></label>' for v in items)


def checks(name, items):
    return "".join(f'<label class="choice"><input type="checkbox" name="{name}" value="{e(v)}"><span>{e(v)}</span></label>' for v in items)


def options(items):
    return '<option value="">Choose one</option>' + "".join(f"<option>{e(v)}</option>" for v in items)


template = (ROOT / "tools" / "waitlist.template.html").read_text(encoding="utf-8")
page = (template
        .replace("{{ROLES}}", options(opts["ROLES"]))
        .replace("{{SCHOOL_TYPES}}", options(opts["SCHOOL_TYPES"]))
        .replace("{{SIZES}}", options(opts["SIZES"]))
        .replace("{{PAINS}}", checks("pains", opts["PAINS"]))
        .replace("{{TOOLS}}", checks("tools", opts["TOOLS"]))
        .replace("{{TIMELINES}}", radios("timeline", opts["TIMELINES"])))
assert "{{" not in page
(ROOT / "public" / "waitlist.html").write_text(page, encoding="utf-8")
print("wrote public/waitlist.html")
