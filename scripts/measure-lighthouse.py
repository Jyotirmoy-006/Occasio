import subprocess
import json
import statistics
import os
import sys

def run_lighthouse(url, run_num, label):
    output_file = f"lh_{label}_{run_num}.json"
    cmd = [
        "npx", "lighthouse", url,
        "--chrome-flags=--headless=new --no-sandbox",
        "--form-factor=mobile",
        "--screenEmulation.mobile=true",
        "--output=json",
        f"--output-path={output_file}",
        "--only-categories=performance,accessibility,best-practices,seo",
        "--quiet"
    ]
    print(f"Running Lighthouse {label} run #{run_num} on {url}...")
    proc = subprocess.run(" ".join(cmd), shell=True, capture_output=True, text=True)
    if proc.returncode != 0:
        print(f"Error in lighthouse run: {proc.stderr}")
        return None
    
    with open(output_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    try:
        os.remove(output_file)
    except:
        pass
    return data

def extract_metrics(lh_data):
    audits = lh_data.get("audits", {})
    categories = lh_data.get("categories", {})
    
    perf_score = int((categories.get("performance", {}).get("score", 0) or 0) * 100)
    a11y_score = int((categories.get("accessibility", {}).get("score", 0) or 0) * 100)
    bp_score = int((categories.get("best-practices", {}).get("score", 0) or 0) * 100)
    seo_score = int((categories.get("seo", {}).get("score", 0) or 0) * 100)
    
    ttfb = audits.get("server-response-time", {}).get("numericValue", 0)
    fcp = audits.get("first-contentful-paint", {}).get("numericValue", 0)
    lcp = audits.get("largest-contentful-paint", {}).get("numericValue", 0)
    tbt = audits.get("total-blocking-time", {}).get("numericValue", 0)
    cls = audits.get("cumulative-layout-shift", {}).get("numericValue", 0)
    
    # LCP element
    lcp_elem = "Unknown"
    lcp_insight = audits.get("lcp-discovery-insight", {}).get("details", {}).get("items", [])
    for item in lcp_insight:
        if isinstance(item, dict) and item.get("type") == "node":
            lcp_elem = item.get("nodeLabel") or item.get("snippet") or item.get("selector") or "Unknown"
            break
    if lcp_elem == "Unknown":
        lcp_items = audits.get("largest-contentful-paint-element", {}).get("details", {}).get("items", [])
        if lcp_items:
            node = lcp_items[0].get("node", {})
            lcp_elem = node.get("snippet") or node.get("nodeLabel") or node.get("selector") or str(node)
            
    # Resource summary (total JS and HTML)
    total_js = 0
    total_html = 0
    res_items = audits.get("resource-summary", {}).get("details", {}).get("items", [])
    for item in res_items:
        res_type = item.get("resourceType")
        if res_type == "script":
            total_js = item.get("transferSize", 0)
        elif res_type == "document":
            total_html = item.get("transferSize", 0)
            
    return {
        "perf": perf_score,
        "a11y": a11y_score,
        "bp": bp_score,
        "seo": seo_score,
        "ttfb": ttfb,
        "fcp": fcp,
        "lcp": lcp,
        "tbt": tbt,
        "cls": cls,
        "lcp_element": lcp_elem,
        "total_js": total_js,
        "total_html": total_html,
    }

def run_suite(url, label, runs=3):
    results = []
    for i in range(1, runs + 1):
        data = run_lighthouse(url, i, label)
        if data:
            metrics = extract_metrics(data)
            results.append(metrics)
            print(f"  Run {i}: Perf={metrics['perf']} TTFB={metrics['ttfb']:.1f}ms FCP={metrics['fcp']:.1f}ms LCP={metrics['lcp']:.1f}ms TBT={metrics['tbt']:.1f}ms")
    return results

def compute_median_report(results, label):
    if not results:
        return f"No results for {label}"
    
    def med(key):
        return statistics.median([r[key] for r in results])
    
    perf = int(med("perf"))
    a11y = int(med("a11y"))
    bp = int(med("bp"))
    seo = int(med("seo"))
    ttfb = med("ttfb")
    fcp = med("fcp")
    lcp = med("lcp")
    tbt = med("tbt")
    cls = med("cls")
    total_js = med("total_js")
    total_html = med("total_html")
    lcp_elem = results[0]["lcp_element"]
    
    return {
        "label": label,
        "perf": perf,
        "a11y": a11y,
        "bp": bp,
        "seo": seo,
        "ttfb_ms": round(ttfb, 1),
        "fcp_ms": round(fcp, 1),
        "lcp_ms": round(lcp, 1),
        "tbt_ms": round(tbt, 1),
        "cls": round(cls, 3),
        "total_js_kb": round(total_js / 1024, 1),
        "total_html_kb": round(total_html / 1024, 1),
        "lcp_element": lcp_elem,
        "runs": results
    }

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "all"
    
    live_url = "https://occasio-ochre.vercel.app"
    local_url = "http://localhost:3000"
    
    all_reports = {}
    if target in ("all", "live"):
        live_res = run_suite(live_url, "live", runs=3)
        all_reports["live"] = compute_median_report(live_res, "Live URL (Vercel)")
        
    if target in ("all", "local"):
        local_res = run_suite(local_url, "local", runs=3)
        all_reports["local"] = compute_median_report(local_res, "Local Production Build (port 3000)")
        
    print("\n" + "="*50)
    print("FINAL MEDIANS REPORT")
    print("="*50)
    print(json.dumps(all_reports, indent=2))
