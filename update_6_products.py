import json

with open("translations_updated.json", "r", encoding="utf-8") as f:
    t = json.load(f)

# Replace '7' with '6' in specific keys
if "products.title" in t["vi"]:
    t["vi"]["products.title"] = t["vi"]["products.title"].replace("7", "6")
if "pdf.products_note" in t["vi"]:
    t["vi"]["pdf.products_note"] = t["vi"]["pdf.products_note"].replace("7", "6")
if "pdf.products_title" in t["vi"]:
    t["vi"]["pdf.products_title"] = t["vi"]["pdf.products_title"].replace("7", "6")
if "acc.desc" in t["vi"]:
    t["vi"]["acc.desc"] = t["vi"]["acc.desc"].replace("7", "6")

if "products.title" in t["lo"]:
    t["lo"]["products.title"] = t["lo"]["products.title"].replace("7", "6")
if "pdf.products_note" in t["lo"]:
    t["lo"]["pdf.products_note"] = t["lo"]["pdf.products_note"].replace("7", "6")
if "pdf.products_title" in t["lo"]:
    t["lo"]["pdf.products_title"] = t["lo"]["pdf.products_title"].replace("7", "6")
if "acc.desc" in t["lo"]:
    t["lo"]["acc.desc"] = t["lo"]["acc.desc"].replace("7", "6")

with open("translations.json", "w", encoding="utf-8") as f:
    json.dump(t, f, ensure_ascii=False, indent=2)

print("Updated translations.json with 6 products")
