import pandas as pd
import json

# Read the Excel file
xls = pd.ExcelFile('ATL.xlsx')

print("Available sheets:", xls.sheet_names)
print("\n" + "="*80 + "\n")

# Analyze each sheet
for sheet_name in xls.sheet_names:
    df = pd.read_excel(xls, sheet_name=sheet_name)
    print(f"\n--- Sheet: {sheet_name} ---")
    print(f"Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print(f"\nFirst few rows:")
    print(df.head())
    print(f"\nData types:")
    print(df.dtypes)
    print("\n" + "-"*80)
