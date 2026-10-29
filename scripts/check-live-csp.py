import urllib.request
import re
import sys

url = sys.argv[1] if len(sys.argv) > 1 else "https://occasio-ochre.vercel.app"

for i in (1, 2):
    req = urllib.request.Request(url, headers={"User-Agent": "curl/8.4.0"})
    with urllib.request.urlopen(req) as resp:
        headers = dict(resp.headers)
        csp = headers.get("content-security-policy", "") or headers.get("Content-Security-Policy", "")
        cache_control = headers.get("cache-control", "") or headers.get("Cache-Control", "")
        vercel_cache = headers.get("x-vercel-cache", "") or headers.get("X-Vercel-Cache", "")
        html = resp.read().decode("utf-8")

    nonce_match = re.search(r"'nonce-([^']+)'", csp)
    header_nonce = nonce_match.group(1) if nonce_match else "NONE"

    scripts = re.findall(r"<script\b([^>]*)>", html, re.IGNORECASE)
    scripts_with_nonce = [s for s in scripts if "nonce=" in s]
    scripts_matching_header = [s for s in scripts if f'nonce="{header_nonce}"' in s or f"nonce='{header_nonce}'" in s]
    scripts_without_nonce = [s for s in scripts if "nonce=" not in s]

    print(f"=== {url} REQUEST {i} ===")
    print("x-vercel-cache:        ", vercel_cache)
    print("cache-control:         ", cache_control)
    print("CSP header nonce:      ", header_nonce)
    print("Total <script> tags:   ", len(scripts))
    print("Scripts with ANY nonce:", len(scripts_with_nonce))
    print("Scripts matching CSP:  ", len(scripts_matching_header))
    print("Scripts WITHOUT nonce: ", len(scripts_without_nonce))
    for idx, s in enumerate(scripts_matching_header[:3]):
        print(f"  Snippet matching {idx+1}: <script{s[:80]}>")
    for idx, s in enumerate(scripts_without_nonce[:3]):
        print(f"  Snippet without {idx+1}: <script{s[:80]}>")
    print()
