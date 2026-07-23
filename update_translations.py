import pandas as pd
import json

file_path = "NNC_Content_Moi_Q3_2026_Gui_IT_2 (1).xlsx"
xls = pd.ExcelFile(file_path)

vi_df = pd.read_excel(file_path, sheet_name="VI_MOI")
lo_df = pd.read_excel(file_path, sheet_name="LO_MOI")

# Load existing translations
with open("translations.json", "r", encoding="utf-8") as f:
    translations = json.load(f)

# Update VI
for idx, row in vi_df.iterrows():
    key = str(row.get("Key Code (Tham chiếu code)", "")).strip()
    new_text = str(row.get("NỘI DUNG MỚI (dán vào code)", "")).strip()
    if key and new_text and new_text.lower() != 'nan':
        translations["vi"][key] = new_text

# Update LO
for idx, row in lo_df.iterrows():
    key = str(row.get("Key Code (Tham chiếu code)", "")).strip()
    new_text = str(row.get("NỘI DUNG MỚI (dán vào code)", "")).strip()
    if key and new_text and new_text.lower() != 'nan':
        translations["lo"][key] = new_text

with open("translations_updated.json", "w", encoding="utf-8") as f:
    json.dump(translations, f, ensure_ascii=False, indent=2)

print("Created translations_updated.json")
