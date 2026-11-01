import os
import re
import ast

def find_files(dir_path):
    files = []
    for root, _, filenames in os.walk(dir_path):
        for f in filenames:
            if f.endswith(('.ts', '.tsx')):
                files.append(os.path.join(root, f).replace('\\', '/'))
    return files

def analyze_src():
    files = find_files('src')
    
    # 1. Any count, non-null assertions, casts, eslint-disable, ts-ignore
    any_count = 0
    non_null_count = 0
    cast_count = 0
    eslint_disable_count = 0
    ts_ignore_count = 0
    
    for path in files:
        with open(path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        for line in lines:
            # Strip comments
            code_line = line.split('//')[0].strip()
            if not code_line:
                continue
            # any: : any, as any, <any>
            any_count += len(re.findall(r'(:\s*any\b|as\s+any\b|<any>)', code_line))
            # non-null assertion: foo! (not != or !==)
            non_null_count += len(re.findall(r'[a-zA-Z0-9_\)\]]\!(?!=)', code_line))
            # casts: as Foo (exclude as const)
            cast_count += len(re.findall(r'\bas\s+(?!const\b)[A-Z][a-zA-Z0-9_]*', code_line))
            # eslint-disable
            eslint_disable_count += len(re.findall(r'eslint-disable', line))
            # ts-ignore / ts-expect-error
            ts_ignore_count += len(re.findall(r'@ts-(?:ignore|expect-error)', line))
            
    # 2. Circular imports
    adj = {f: [] for f in files}
    for f in files:
        with open(f, 'r', encoding='utf-8') as fh:
            text = fh.read()
        imports = re.findall(r'from\s+[\'\"](@/[^\'\"]+|\.[^\'\"]+)[\'\"]', text)
        for imp in imports:
            if imp.startswith('@/'):
                resolved = 'src/' + imp[2:]
            else:
                resolved = os.path.normpath(os.path.join(os.path.dirname(f), imp)).replace('\\', '/')
            target = None
            for ext in ['', '.ts', '.tsx', '/index.ts', '/index.tsx']:
                cand = resolved + ext
                if os.path.isfile(cand):
                    target = cand
                    break
            if target and target in files:
                adj[f].append(target)
                
    visited = {}
    cycles = []
    def dfs(node, path):
        visited[node] = 1
        path.append(node)
        for neighbor in adj.get(node, []):
            if visited.get(neighbor) == 1:
                idx = path.index(neighbor)
                cycles.append(path[idx:] + [neighbor])
            elif visited.get(neighbor) != 2:
                dfs(neighbor, path)
        path.pop()
        visited[node] = 2

    for f in files:
        if visited.get(f) != 2:
            dfs(f, [])

    # 3. Longest functions and complexity (heuristic / line counting per block)
    file_lengths = []
    function_lengths = []
    
    for path in files:
        with open(path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        file_lengths.append((len(lines), path))
        
        # Simple function regex
        func_start = None
        current_func_name = None
        brace_depth = 0
        in_func = False
        
        for idx, line in enumerate(lines, 1):
            stripped = line.strip()
            # Match function signature
            m = re.match(r'(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)|(?:const|let)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>', stripped)
            if m and not in_func and '{' in line:
                in_func = True
                func_start = idx
                current_func_name = m.group(1) or m.group(2)
                brace_depth = line.count('{') - line.count('}')
            elif in_func:
                brace_depth += line.count('{') - line.count('}')
                if brace_depth <= 0:
                    func_len = idx - func_start + 1
                    function_lengths.append((func_len, current_func_name, path, func_start))
                    in_func = False

    function_lengths.sort(key=lambda x: x[0], reverse=True)
    file_lengths.sort(key=lambda x: x[0], reverse=True)
    
    print("=" * 60)
    print("CODE QUALITY METRICS REPORT")
    print("=" * 60)
    print(f"any count:                       {any_count}")
    print(f"non-null assertions:             {non_null_count}")
    print(f"casts (as Type, non-const):      {cast_count}")
    print(f"eslint-disable:                  {eslint_disable_count}")
    print(f"ts-ignore / ts-expect-error:     {ts_ignore_count}")
    print(f"circular imports:                {len(cycles)}")
    print("\nLongest Functions (top 5):")
    for flen, fname, fpath, start_line in function_lengths[:5]:
        print(f"  - {flen} lines: {fname} ({fpath}:{start_line})")
    print("\nLargest Files (top 5):")
    for flen, fpath in file_lengths[:5]:
        print(f"  - {flen} lines: {fpath}")

if __name__ == '__main__':
    analyze_src()
