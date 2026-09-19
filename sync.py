"""
sync.py — Single-phase sync for: main (backend), blockchain, consultant.

Usage:
  python sync.py          # run the sync
  python sync.py --revert # restore the last backup
"""

import sys
import os
import shutil
from pathlib import Path
from datetime import datetime
import subprocess

BASE_DIR     = Path("d:/PROJECTS/Prayas/backend")
BACKUP_DIR   = Path("d:/PROJECTS/Prayas/.sync_backup")
SETUP_DIR    = Path("d:/PROJECTS/Prayas")

MODULES = [
    ("setup_backend.py",     "main (backend core)"),
    ("setup_blockchain.py",  "blockchain"),
    ("setup_consultant.py",  "consultant"),
]

# ── helpers ─────────────────────────────────────────────────────────────────

def log(tag: str, msg: str):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] [{tag}] {msg}")

def backup():
    if not BASE_DIR.exists():
        log("BACKUP", "Nothing to back up -- backend dir does not exist yet.")
        return None

    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dest  = BACKUP_DIR / stamp
    shutil.copytree(BASE_DIR, dest)
    log("BACKUP", f"Snapshot saved -> {dest}")
    return dest

def revert():
    if not BACKUP_DIR.exists() or not any(BACKUP_DIR.iterdir()):
        print("[REVERT] No backup found. Nothing to restore.")
        sys.exit(1)

    snapshots = sorted(BACKUP_DIR.iterdir())
    latest    = snapshots[-1]
    log("REVERT", f"Restoring from {latest} ...")

    if BASE_DIR.exists():
        shutil.rmtree(BASE_DIR)
    shutil.copytree(latest, BASE_DIR)
    log("REVERT", "Restore complete. Backend is back to its previous state.")

def run_setup(script: str, label: str) -> bool:
    script_path = SETUP_DIR / script
    if not script_path.exists():
        log("SKIP", f"{script} not found -- skipping {label}.")
        return False

    log("SYNC", f"Running {label} ...")
    result = subprocess.run(
        [sys.executable, str(script_path)],
        capture_output=True,
        text=True,
    )
    if result.stdout.strip():
        for line in result.stdout.strip().splitlines():
            log("OK", line)
    if result.returncode != 0:
        log("ERROR", f"{label} failed:")
        for line in result.stderr.strip().splitlines():
            log("ERR", line)
        return False
    return True

# ── main ────────────────────────────────────────────────────────────────────

def sync():
    print()
    print("=" * 56)
    print("  ZIRO SYNC -- single-phase  (main / blockchain / consultant)")
    print("=" * 56)
    print()

    snap = backup()
    print()

    results = {}
    for script, label in MODULES:
        ok = run_setup(script, label)
        results[label] = ok
        print()

    print("=" * 56)
    all_ok = all(results.values())
    for label, ok in results.items():
        status = "SYNCED" if ok else "FAILED"
        print(f"  [{status:^6}]  {label}")
    print("=" * 56)

    if all_ok:
        print()
        print("  All modules synced successfully.")
        if snap:
            print("  To revert: python sync.py --revert")
    else:
        print()
        print("  One or more modules failed. Run: python sync.py --revert")

    print()

# ── entry ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if "--revert" in sys.argv:
        revert()
    else:
        sync()
