"""Serialize a level JSON file matching the repo's existing hand-authored
formatting: 2-space indent, each vocab word object inline on one line.

Used to append new categories without reformatting (and thus re-diffing) the
existing content.
"""
import json


def _inline_word(w):
    parts = [f'{json.dumps(k, ensure_ascii=False)}: {json.dumps(v, ensure_ascii=False)}'
             for k, v in w.items()]
    return "{ " + ", ".join(parts) + " }"


def dumps_level(data):
    lines = []
    lines.append("{")
    lines.append(f'  "level": {json.dumps(data["level"], ensure_ascii=False)},')
    lines.append(f'  "name_zh": {json.dumps(data["name_zh"], ensure_ascii=False)},')
    lines.append('  "categories": [')
    cats = data["categories"]
    for ci, cat in enumerate(cats):
        lines.append("    {")
        lines.append(f'      "id": {json.dumps(cat["id"], ensure_ascii=False)},')
        lines.append(f'      "name_zh": {json.dumps(cat["name_zh"], ensure_ascii=False)},')
        lines.append(f'      "icon": {json.dumps(cat["icon"], ensure_ascii=False)},')
        lines.append('      "words": [')
        words = cat["words"]
        for wi, w in enumerate(words):
            comma = "," if wi < len(words) - 1 else ""
            lines.append("        " + _inline_word(w) + comma)
        lines.append("      ]")
        lines.append("    }" + ("," if ci < len(cats) - 1 else ""))
    lines.append("  ]")
    lines.append("}")
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    import sys
    path = sys.argv[1]
    with open(path) as f:
        original = f.read()
    data = json.loads(original)
    out = dumps_level(data)
    if out == original:
        print(f"ROUND-TRIP OK: {path}")
    else:
        # Show first difference for debugging.
        import difflib
        diff = list(difflib.unified_diff(
            original.splitlines(), out.splitlines(), lineterm="", n=1))
        print(f"DIFF ({len(diff)} lines):")
        print("\n".join(diff[:20]))
