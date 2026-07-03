import pdfplumber, json, re

STANDARD_KEYS = ['shoulders','chest','back','neck','biceps','forearms','wrist','mid_abdomen','waist','hips','thigh','mid_thigh','calf','height','weight']

def parse_val(s):
    s = str(s or '').replace(',', '.').strip()
    try: return round(float(s), 1)
    except: return None

def split_concat(v, max_val=150):
    if v is None or v <= 0:
        return []
    if v <= max_val:
        return [v]
    s = '{:.0f}'.format(v)
    for parts in [2, 3, 4]:
        if len(s) % parts == 0:
            chunk = len(s) // parts
            vals = [round(float(s[i:i+chunk]), 1) for i in range(0, len(s), chunk)]
            if all(0 < x <= max_val for x in vals):
                return vals
    return [v]

with pdfplumber.open('C:/Users/josee/Downloads/Reporte registro de medidas.pdf') as pdf:
    all_rows = []
    for page in pdf.pages:
        for table in page.extract_tables():
            for row in table:
                if row and row[0] and '/' in str(row[0]) and row[1]:
                    vals = [str(c or '').strip() for c in row]
                    all_rows.append(vals)

seen = set()
unique_rows = []
for r in all_rows:
    key = (r[0], r[1])
    if key not in seen:
        seen.add(key)
        unique_rows.append(r)

print('Unique rows: {}'.format(len(unique_rows)))
print()

results = []
for r in unique_rows:
    date_raw = r[0].replace('\\n', '/')
    date_parts = date_raw.split('/')
    if len(date_parts) >= 3:
        day = date_parts[0].strip().zfill(2)
        month_raw = date_parts[1].strip()
        year = date_parts[2].strip()
        month_map = {'ene':'01','feb':'02','mar':'03','abr':'04','may':'05','jun':'06',
                     'jul':'07','ago':'08','sept':'09','oct':'10','nov':'11','dic':'12'}
        month = '01'
        for k, v in month_map.items():
            if k in month_raw.lower():
                month = v
                break
        date_str = '{}-{}-{}'.format(year, month, day)
    else:
        date_str = date_raw

    name = r[1].replace('\\n', ' ').strip()
    
    raw_vals = [parse_val(x) for x in r[3:18]]
    
    all_vals = []
    for v in raw_vals:
        split = split_concat(v)
        all_vals.extend(split)
    
    while len(all_vals) < len(STANDARD_KEYS):
        all_vals.append(None)
    all_vals = all_vals[:len(STANDARD_KEYS)]
    
    record = {'date': date_str, 'name': name}
    for i, key in enumerate(STANDARD_KEYS):
        if all_vals[i] is not None:
            record[key] = all_vals[i]
    
    results.append(record)
    
    line = '{} | {:<30s} | '.format(date_str, name)
    parts = []
    for k in STANDARD_KEYS:
        if k in record:
            parts.append('{}={}'.format(k, record[k]))
    line += ' | '.join(parts)
    print(line)

print()
print('Total records: {}'.format(len(results)))

# Output as JSON
with open('parsed_measurements.json', 'w') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print('Saved to parsed_measurements.json')
