import pandas as pd
import json

file_path = "NNC_Content_Moi_Q3_2026_Gui_IT_2 (1).xlsx"
try:
    xls = pd.ExcelFile(file_path)
    output = {}
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        output[sheet_name] = df.fillna("").to_dict(orient="records")
    
    with open("excel_output.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
except Exception as e:
    print(f"Error: {e}")
