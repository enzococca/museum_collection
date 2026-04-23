#!/usr/bin/env python3
"""Import the Museo di Firenze (Mantegazza ethnographic collection).

The Excel source is in Italian; descriptive fields are translated to English
via the Anthropic SDK before being written to the DB. Photos are linked from
Dropbox by stripping the "I0" prefix from each accession number to find the
matching sub-folder under FOTO-INVENTARIATE_aprile-settembre-2022/.

Usage (local run against Railway DB):

    ANTHROPIC_API_KEY=... DATABASE_URL=postgresql://.../ \\
    python -m scripts.import_firenze \\
        --excel "/Volumes/Extreme Pro/Dropbox/NILGIRI 2025/FIRENZE/10.10_02.00_Mantegazza Collection _Florence.xlsx"

Or via Flask CLI on Railway:

    railway run flask import-firenze --excel /path/to/mantegazza.xlsx
"""
import argparse
import json
import os
import re
import sys

import openpyxl

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


COLLECTION = "florence_museum"  # UI label derives as "Florence Museum"
SEQ_PREFIX = "FM"

# Excel (Foglio1) column names as they appear in the source file
COL = {
    "sequence_number": "Sequence number",
    "accession_number": "Accession No.",
    "on_display": "On display",
    "acquisition_details": "Acquisition details",
    "object_type": "Object type",
    "material": " Material (as from museum descriptions)",  # leading space preserved
    "remarks": "Our remarks/notes",
    "size_dimensions": (
        "Size\na) max overall dimension (height x width x lenght)"
        "\nb) other meaningful"
    ),
    "weight": "Weight",
    "technique": "Technique",
    "description_catalogue": "Description (digital catalogue)",
    "description_card": "Description: card",
    "description_further": "Further description (further card in paper catalogue)",
    "inscription": "Inscription",
    "findspot": "Findspot",
    "production_place": "Production place",
    "chronology": "Date",
    "bibliography": "Bibliography",
}

# Fields that need IT -> EN translation. description_observation is built from
# description_card + description_further concatenated before translation.
TRANSLATE_FIELDS = [
    "object_type",
    "material",
    "remarks",
    "technique",
    "description_catalogue",
    "description_observation",
    "acquisition_details",
]

SYSTEM_PROMPT = """You translate Italian museum catalog entries into English.

Context: Mantegazza ethnographic collection, Museo di Storia Naturale di Firenze,
Italy. The objects are mostly from South India (Toda and Badaga peoples of the
Nilgiri Hills) and were gathered by 19th-century Italian explorers.

Rules:
- Output British English in neutral museum-catalog register (descriptive, concise).
- Preserve specialist terminology verbatim: place names, tribal/ethnic names,
  plant/animal names.
- Translate common Italian material names (ottone=brass, rame=copper,
  argento=silver, ferro=iron, legno=wood, stoffa=cloth, cuoio=leather,
  vimini=wicker, terracotta=terracotta).
- Translate common object types (bracciale=bracelet, braccialetto=small bracelet,
  collana=necklace, anello=ring, ciondolo=pendant, ciotola=bowl, vaso=vessel).
- Preserve measurement tokens and abbreviations exactly (cm., gr., mm.).
- Do not invent facts. If a field is empty or contains only "--", return an
  empty string for that field.
- Translate each field independently. Do not merge fields.
"""

TRANSLATE_TOOL = {
    "name": "record_translation",
    "description": "Record the English translations of the provided Italian fields.",
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {f: {"type": "string"} for f in TRANSLATE_FIELDS},
        "required": TRANSLATE_FIELDS,
        "additionalProperties": False,
    },
}


def _cell(val):
    if val is None:
        return None
    s = str(val).strip()
    if not s or s == "--":
        return None
    return s


def _parse_on_display(val) -> bool:
    if val is None:
        return False
    return str(val).strip().lower() in ("sì", "si", "yes", "y", "true", "1", "x")


def _accession_to_folder_candidates(accession: str) -> list[str]:
    """Map an accession number to possible photo-folder names.

    Excel stores accessions like "I02650" or "I02721/1"; photo folders are
    named "2650" or "2721-1".
    """
    if not accession:
        return []
    m = re.match(r"^I0?(.+)$", accession.strip(), flags=re.IGNORECASE)
    core = m.group(1) if m else accession.strip()
    candidates = [core.replace("/", "-"), core.replace("/", "_"), core]
    seen = set()
    return [c for c in candidates if not (c in seen or seen.add(c))]


def _load_rows(xlsx_path: str) -> list[dict]:
    wb = openpyxl.load_workbook(xlsx_path, read_only=True, data_only=True)
    ws = wb.active
    rows_iter = ws.iter_rows(values_only=True)
    header = next(rows_iter, None)
    if not header:
        wb.close()
        return []
    idx = {name: i for i, name in enumerate(header) if name is not None}
    out = []
    for r in rows_iter:
        if not r or all(c is None for c in r):
            continue
        rec = {
            key: (r[idx[col]] if col in idx and idx[col] < len(r) else None)
            for key, col in COL.items()
        }
        out.append(rec)
    wb.close()
    return out


def _translate(client, model: str, row: dict) -> dict:
    payload = {
        "object_type": _cell(row["object_type"]),
        "material": _cell(row["material"]),
        "remarks": _cell(row["remarks"]),
        "technique": _cell(row["technique"]),
        "description_catalogue": _cell(row["description_catalogue"]),
        "description_observation": "\n".join(
            filter(None, [_cell(row["description_card"]), _cell(row["description_further"])])
        )
        or None,
        "acquisition_details": _cell(row["acquisition_details"]),
    }
    if not any(v for v in payload.values()):
        return {k: None for k in TRANSLATE_FIELDS}

    user_text = (
        "Translate the following fields from Italian into English. "
        "Return an empty string for any field whose input is null or empty.\n\n"
        + json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True)
    )

    response = client.messages.create(
        model=model,
        max_tokens=2048,
        output_config={"effort": "low"},
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        tools=[TRANSLATE_TOOL],
        tool_choice={"type": "tool", "name": "record_translation"},
        messages=[{"role": "user", "content": user_text}],
    )

    for block in response.content:
        if block.type == "tool_use" and block.name == "record_translation":
            out = dict(block.input)
            return {
                k: (v.strip() if isinstance(v, str) and v.strip() else None)
                for k, v in out.items()
            }
    return {k: None for k in TRANSLATE_FIELDS}


def _list_dropbox(dbx_service, path: str):
    try:
        return dbx_service.list_folder(path)
    except Exception:
        return []


def import_firenze(
    xlsx_path: str,
    dropbox_subdir: str,
    dropbox_photos_subpath: str,
    dry_run: bool = False,
    translate: bool = True,
    skip_media: bool = False,
) -> dict:
    from app.extensions import db
    from app.models import Artifact, Media, User
    from app.services.dropbox_service import DropboxService

    admin = User.query.filter_by(role="admin").first()
    if not admin:
        raise SystemExit(
            "No admin user found. Run `flask create-admin` first."
        )

    client = None
    if translate:
        import anthropic  # imported lazily so --no-translate does not require the SDK

        client = anthropic.Anthropic()
    model = os.environ.get("ANTHROPIC_MODEL", "claude-opus-4-7")

    rows = _load_rows(xlsx_path)
    print(f"Loaded {len(rows)} rows from {xlsx_path}")

    dropbox = None if skip_media else DropboxService()
    photos_base = f"{dropbox_subdir}/{dropbox_photos_subpath}".replace("//", "/")

    # Cache the top-level folder listing once for fuzzy (starts-with) matching.
    all_folders: list[str] = []
    if dropbox:
        for e in _list_dropbox(dropbox, photos_base):
            name = getattr(e, "name", None)
            if name:
                all_folders.append(name)
        print(f"  ({len(all_folders)} folders under {photos_base})")

    imported = skipped = media_linked = 0
    errors: list[str] = []

    for row in rows:
        try:
            seq_raw = _cell(row["sequence_number"])
            if not seq_raw:
                skipped += 1
                continue
            seq = f"{SEQ_PREFIX}_{seq_raw}"
            accession = _cell(row["accession_number"])

            if Artifact.query.filter_by(sequence_number=seq).first():
                print(f"  = {seq} already exists — skipping")
                skipped += 1
                continue

            if translate:
                translated = _translate(client, model, row)
            else:
                translated = {
                    "object_type": _cell(row["object_type"]),
                    "material": _cell(row["material"]),
                    "remarks": _cell(row["remarks"]),
                    "technique": _cell(row["technique"]),
                    "description_catalogue": _cell(row["description_catalogue"]),
                    "description_observation": "\n".join(
                        filter(
                            None,
                            [
                                _cell(row["description_card"]),
                                _cell(row["description_further"]),
                            ],
                        )
                    )
                    or None,
                    "acquisition_details": _cell(row["acquisition_details"]),
                }

            artifact = Artifact(
                collection=COLLECTION,
                sequence_number=seq,
                accession_number=accession,  # kept WITH the "I0" prefix as per user spec
                on_display=_parse_on_display(row["on_display"]),
                acquisition_details=translated.get("acquisition_details"),
                object_type=translated.get("object_type"),
                material=translated.get("material"),
                remarks=translated.get("remarks"),
                size_dimensions=_cell(row["size_dimensions"]),
                weight=_cell(row["weight"]),
                technique=translated.get("technique"),
                description_catalogue=translated.get("description_catalogue"),
                description_observation=translated.get("description_observation"),
                inscription=_cell(row["inscription"]),
                findspot=_cell(row["findspot"]),
                production_place=_cell(row["production_place"]),
                chronology=_cell(row["chronology"]),
                bibliography=_cell(row["bibliography"]),
                created_by=admin.id,
            )
            if not dry_run:
                db.session.add(artifact)
                db.session.flush()
            imported += 1
            print(f"+ {seq} ({accession}) — {translated.get('object_type') or ''}")

            if skip_media or not dropbox or not accession:
                continue

            cand_list = _accession_to_folder_candidates(accession)
            # Fallback: also match folders that START with a candidate followed by
            # '_' / '-' / ' ' (captures e.g. '9550_Modigliani' for accession 'I09550').
            for cand in list(cand_list):
                for f in all_folders:
                    if f in cand_list:
                        continue
                    if re.match(rf"^{re.escape(cand)}[_\-\s]", f):
                        cand_list.append(f)

            for cand in cand_list:
                folder_path = f"{photos_base}/{cand}"
                entries = _list_dropbox(dropbox, folder_path)
                images = [
                    e
                    for e in entries
                    if getattr(e, "name", None)
                    and e.name.rsplit(".", 1)[-1].lower()
                    in {"jpg", "jpeg", "png", "tif", "tiff", "heic", "webp"}
                ]
                if not images:
                    continue
                for j, img in enumerate(sorted(images, key=lambda x: x.name)):
                    img_path = f"{folder_path}/{img.name}"
                    if Media.query.filter_by(dropbox_path=img_path).first():
                        continue
                    media = Media(
                        artifact_id=artifact.id,
                        filename=img.name,
                        original_filename=img.name,
                        dropbox_path=img_path,
                        folder=cand,
                        is_primary=(j == 0),
                        sort_order=j,
                        uploaded_by=admin.id,
                    )
                    if not dry_run:
                        db.session.add(media)
                    media_linked += 1
                print(f"    ↳ {len(images)} photos from {cand}/")
                break  # first matching folder wins

            if imported % 10 == 0 and not dry_run:
                db.session.commit()
        except Exception as e:
            errors.append(f"{row.get('sequence_number')}: {e}")
            print(f"  ! error on seq {row.get('sequence_number')}: {e}")

    if not dry_run:
        db.session.commit()

    print(
        f"\nDone. imported={imported} skipped={skipped} media_linked={media_linked}"
    )
    if errors:
        print(f"errors: {len(errors)}")
        for e in errors[:10]:
            print(f"  - {e}")
    return {
        "imported": imported,
        "skipped": skipped,
        "media_linked": media_linked,
        "errors": errors,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--excel", required=True)
    parser.add_argument("--dropbox-subdir", default="/NILGIRI 2025/FIRENZE")
    parser.add_argument(
        "--photos-subpath", default="FOTO-INVENTARIATE_aprile-settembre-2022"
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-translate", action="store_true")
    parser.add_argument("--skip-media", action="store_true")
    args = parser.parse_args()

    from app import create_app  # noqa: E402 — delayed import so plain --help works

    app = create_app()
    with app.app_context():
        import_firenze(
            xlsx_path=args.excel,
            dropbox_subdir=args.dropbox_subdir,
            dropbox_photos_subpath=args.photos_subpath,
            dry_run=args.dry_run,
            translate=not args.no_translate,
            skip_media=args.skip_media,
        )


if __name__ == "__main__":
    main()
