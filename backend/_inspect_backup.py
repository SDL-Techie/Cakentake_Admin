import os
import json

backup_dir = os.path.join(os.getcwd(), 'backups')
files = [f for f in os.listdir(backup_dir) if f.endswith('.json')]
files.sort()
print('backup files:', files)
for filename in files[-5:]:
    path = os.path.join(backup_dir, filename)
    print('\nFILE:', filename, 'size', os.path.getsize(path))
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    tables = data.get('tables', {})
    print(' tables count', len(tables))
    if 'orders' in tables:
        rows = tables['orders']
        ids = [row.get('id') for row in rows]
        print(' orders rows', len(rows), 'id min', min(ids) if ids else None, 'max', max(ids) if ids else None, 'duplicates', len(ids) - len(set(ids)))
    if 'products' in tables:
        rows = tables['products']
        ids = [row.get('id') for row in rows]
        print(' products rows', len(rows), 'id min', min(ids) if ids else None, 'max', max(ids) if ids else None, 'duplicates', len(ids) - len(set(ids)))