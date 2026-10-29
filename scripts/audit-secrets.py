import os
import sys
import re
import subprocess

def main():
    print("Checking if .env.local was ever committed...")
    out = subprocess.check_output(["git", "log", "--all", "--", ".env.local"], text=True).strip()
    if out:
        print("WARNING: .env.local was committed!")
        print(out)
    else:
        print(".env.local was NEVER committed. Clean.")

    gemini_key = None
    if os.path.exists(".env.local"):
        with open(".env.local", "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("GEMINI_API_KEY="):
                    val = line.strip().split("GEMINI_API_KEY=", 1)[1].strip("\"'")
                    if val:
                        gemini_key = val
                        print("Loaded GEMINI_API_KEY from .env.local for memory scanning (never printed).")
                        break

    patterns = [
        ("AIza pattern", re.compile(r"AIza[0-9A-Za-z\-_]{35}")),
        ("GitHub token (ghp_)", re.compile(r"ghp_[0-9A-Za-z]{20,}")),
        ("GitHub PAT (github_pat_)", re.compile(r"github_pat_[0-9A-Za-z_]{20,}")),
        ("OpenAI token (sk-)", re.compile(r"sk-[0-9A-Za-z]{20,}")),
    ]

    # 1. Search working tree
    tracked = subprocess.check_output(["git", "ls-files"], text=True).splitlines()
    untracked = subprocess.check_output(["git", "ls-files", "--others", "--exclude-standard"], text=True).splitlines()
    all_files = tracked + untracked

    hits = []
    for file_path in all_files:
        if not os.path.isfile(file_path):
            continue
        if os.path.basename(file_path) == ".env.local":
            continue
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                for lno, line in enumerate(f, 1):
                    if gemini_key and gemini_key in line:
                        hits.append(("WORKING_TREE", file_path, lno, "literal GEMINI_API_KEY"))
                    for name, pat in patterns:
                        if pat.search(line):
                            hits.append(("WORKING_TREE", file_path, lno, name))
        except Exception:
            pass

    print(f"Working tree scan completed on {len(all_files)} files.")

    # 2. Search full git history
    commits = subprocess.check_output(["git", "rev-list", "--all"], text=True).splitlines()
    print(f"Scanning {len(commits)} commits across all branches in git history...")

    for commit in commits:
        patch = subprocess.check_output(["git", "show", commit, "--format="], text=True, errors="ignore")
        current_file = ""
        lno = 0
        for line in patch.splitlines():
            if line.startswith("+++ b/"):
                current_file = line[6:]
                lno = 0
            elif line.startswith("+") and not line.startswith("+++"):
                lno += 1
                added_content = line[1:]
                if gemini_key and gemini_key in added_content:
                    hits.append(("COMMIT " + commit[:8], current_file, lno, "literal GEMINI_API_KEY"))
                for name, pat in patterns:
                    if pat.search(added_content):
                        hits.append(("COMMIT " + commit[:8], current_file, lno, name))

    if hits:
        print("SECRETS FOUND:")
        for scope, f, lno, pattern_name in hits:
            print(f"  [{scope}] {f}:{lno} matched {pattern_name}")
        sys.exit(1)
    else:
        print("SECRET SCAN RESULT: ZERO HITS. Clean in working tree and entire git history.")

if __name__ == "__main__":
    main()

