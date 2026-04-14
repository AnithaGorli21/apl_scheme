import pandas as pd
from datetime import datetime, timedelta

# Read the Excel file
xls = pd.ExcelFile('ATL.xlsx')

# Output file
output_file = 'sample_data.sql'

with open(output_file, 'w') as f:
    f.write("-- ============================================================\n")
    f.write("-- APL Scheme Sample Data - PostgreSQL\n")
    f.write("-- Generated: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + "\n")
    f.write("-- ============================================================\n\n")
    
    # ============================================================
    # 1. FINANCIAL YEAR DATA (20 records)
    # ============================================================
    f.write("-- ============================================================\n")
    f.write("-- SAMPLE DATA: m_financial_year (20 records)\n")
    f.write("-- ============================================================\n")
    
    base_year = 2015
    for i in range(20):
        fy_year = base_year + i
        fy_name = f"{fy_year}-{str(fy_year + 1)[-2:]}"
        start_date = f"{fy_year}-04-01"
        end_date = f"{fy_year + 1}-03-31"
        is_active = 'true' if i >= 15 else 'false'  # Last 5 years active
        
        f.write(f"INSERT INTO m_financial_year (financial_year, start_date, end_date, description, is_active, created_by) VALUES ")
        f.write(f"('{fy_name}', '{start_date}', '{end_date}', 'Financial Year {fy_name}', {is_active}, 1);\n")
    
    f.write("\n")
    
    # ============================================================
    # 2. MONTH DATA (12 records)
    # ============================================================
    f.write("-- ============================================================\n")
    f.write("-- SAMPLE DATA: m_month (12 records)\n")
    f.write("-- ============================================================\n")
    
    months = [
        (1, 'January', 'Jan', 1),
        (2, 'February', 'Feb', 1),
        (3, 'March', 'Mar', 1),
        (4, 'April', 'Apr', 2),
        (5, 'May', 'May', 2),
        (6, 'June', 'Jun', 2),
        (7, 'July', 'Jul', 3),
        (8, 'August', 'Aug', 3),
        (9, 'September', 'Sep', 3),
        (10, 'October', 'Oct', 4),
        (11, 'November', 'Nov', 4),
        (12, 'December', 'Dec', 4)
    ]
    
    for month_num, month_name, month_short, quarter in months:
        f.write(f"INSERT INTO m_month (month_number, month_name, month_name_short, quarter, is_active, created_by) VALUES ")
        f.write(f"({month_num}, '{month_name}', '{month_short}', {quarter}, true, 1);\n")
    
    f.write("\n")
    
    # ============================================================
    # 3. DFSO DATA (from Excel)
    # ============================================================
    f.write("-- ============================================================\n")
    f.write("-- DATA: m_dfso (from Excel)\n")
    f.write("-- ============================================================\n")
    
    df_dfso = pd.read_excel(xls, sheet_name='m_dfso')
    
    for idx, row in df_dfso.iterrows():
        dfso_code = int(row['dfso_code'])
        desc_en = str(row['description_en']).replace("'", "''")
        desc_ll = str(row['description_ll']).replace("'", "''") if pd.notna(row['description_ll']) else ''
        is_active = str(row['is_active']).upper() if pd.notna(row['is_active']) else 'Y'
        is_active_bool = 'true' if is_active == 'Y' else 'false'
        
        f.write(f"INSERT INTO m_dfso (dfso_code, description_en, description_ll, is_active, created_by) VALUES ")
        f.write(f"({dfso_code}, '{desc_en}', '{desc_ll}', {is_active_bool}, 1);\n")
    
    f.write("\n")
    
    # ============================================================
    # 4. AFSO DATA (from Excel)
    # ============================================================
    f.write("-- ============================================================\n")
    f.write("-- DATA: m_afso (from Excel)\n")
    f.write("-- ============================================================\n")
    
    df_afso = pd.read_excel(xls, sheet_name='m_afso')
    
    for idx, row in df_afso.iterrows():
        dfso_code = int(row['dfso_code'])
        afso_code = int(row['afso_code'])
        desc_en = str(row['description_en']).replace("'", "''")
        desc_ll = str(row['description_ll']).replace("'", "''") if pd.notna(row['description_ll']) else ''
        is_active = str(row['is_active']).upper() if pd.notna(row['is_active']) else 'Y'
        is_active_bool = 'true' if is_active == 'Y' else 'false'
        
        f.write(f"INSERT INTO m_afso (dfso_code, afso_code, description_en, description_ll, is_active, created_by) VALUES ")
        f.write(f"({dfso_code}, {afso_code}, '{desc_en}', '{desc_ll}', {is_active_bool}, 1);\n")
    
    f.write("\n")
    
    # ============================================================
    # 5. FPS DATA (from Excel)
    # ============================================================
    f.write("-- ============================================================\n")
    f.write("-- DATA: m_fps (from Excel)\n")
    f.write("-- ============================================================\n")
    
    df_fps = pd.read_excel(xls, sheet_name='m_fps')
    
    for idx, row in df_fps.iterrows():
        fps_code = int(row['fps_code'])
        afso_code = int(row['afso_code'])
        desc_en = str(row['description_en']).replace("'", "''")
        desc_ll = str(row['description_ll']).replace("'", "''") if pd.notna(row['description_ll']) else ''
        is_active = str(row['is_active']).upper() if pd.notna(row['is_active']) else 'Y'
        is_active_bool = 'true' if is_active == 'Y' else 'false'
        
        f.write(f"INSERT INTO m_fps (fps_code, afso_code, description_en, description_ll, is_active, created_by) VALUES ")
        f.write(f"({fps_code}, {afso_code}, '{desc_en}', '{desc_ll}', {is_active_bool}, 1);\n")
    
    f.write("\n")
    
    # ============================================================
    # 6. USER DATA (Sample users)
    # ============================================================
    f.write("-- ============================================================\n")
    f.write("-- SAMPLE DATA: t_user\n")
    f.write("-- Note: Passwords should be hashed in production\n")
    f.write("-- ============================================================\n")
    
    users = [
        ('admin', 'admin123', 'ADMIN', 'admin@aplscheme.gov.in', 'System Administrator'),
        ('dfso_user', 'dfso123', 'DFSO', 'dfso@aplscheme.gov.in', 'DFSO User'),
        ('afso_user', 'afso123', 'AFSO', 'afso@aplscheme.gov.in', 'AFSO User'),
        ('fps_user', 'fps123', 'FPS', 'fps@aplscheme.gov.in', 'FPS User'),
        ('viewer', 'viewer123', 'VIEWER', 'viewer@aplscheme.gov.in', 'Read Only User')
    ]
    
    for username, password, role, email, full_name in users:
        f.write(f"INSERT INTO t_user (username, password, role, email, full_name, is_active, created_by) VALUES ")
        f.write(f"('{username}', '{password}', '{role}', '{email}', '{full_name}', true, 1);\n")
    
    f.write("\n")
    
    # ============================================================
    # 7. APL DATA (from Excel)
    # ============================================================
    f.write("-- ============================================================\n")
    f.write("-- DATA: t_apl_data (from Excel)\n")
    f.write("-- ============================================================\n")
    
    df_apl = pd.read_excel(xls, sheet_name='t_apl_data')
    
    for idx, row in df_apl.iterrows():
        sno = int(row['sno'])
        dist_code = int(row['dist_code'])
        dist_name = str(row['dist_name']).replace("'", "''")
        dfso_code = int(row['dfso_code'])
        dfso_name = str(row['dfso_name']).replace("'", "''")
        afso_code = int(row['afso_code'])
        afso_name = str(row['afso_name']).replace("'", "''")
        fps_code = int(row['fps_code'])
        fps_name = str(row['fps_name']).replace("'", "''")
        ct_card_desk = str(row['ct_card_desk']).replace("'", "''") if pd.notna(row['ct_card_desk']) else ''
        rc_no = int(row['rc_no'])
        hof_name = str(row['hof_name']).replace("'", "''")
        member_id = int(row['member_id'])
        member_name = str(row['member_name']).replace("'", "''")
        gender = str(row['gender']).replace("'", "''") if pd.notna(row['gender']) else ''
        relation_name = str(row['relation_name']).replace("'", "''") if pd.notna(row['relation_name']) else ''
        
        # Handle date
        if pd.notna(row['meber_dob']):
            member_dob = f"'{row['meber_dob'].strftime('%Y-%m-%d')}'"
        else:
            member_dob = 'NULL'
        
        uid = str(row['uid']).replace("'", "''") if pd.notna(row['uid']) else ''
        demo_auth = str(row['demo_auth']).replace("'", "''") if pd.notna(row['demo_auth']) else ''
        ekyc = str(row['ekyc']).replace("'", "''") if pd.notna(row['ekyc']) else ''
        
        f.write(f"INSERT INTO t_apl_data (sno, dist_code, dist_name, dfso_code, dfso_name, afso_code, afso_name, fps_code, fps_name, ")
        f.write(f"ct_card_desk, rc_no, hof_name, member_id, member_name, gender, relation_name, member_dob, uid, demo_auth, ekyc, is_active, created_by) VALUES ")
        f.write(f"({sno}, {dist_code}, '{dist_name}', {dfso_code}, '{dfso_name}', {afso_code}, '{afso_name}', {fps_code}, '{fps_name}', ")
        f.write(f"'{ct_card_desk}', {rc_no}, '{hof_name}', {member_id}, '{member_name}', '{gender}', '{relation_name}', {member_dob}, ")
        f.write(f"'{uid}', '{demo_auth}', '{ekyc}', true, 1);\n")
    
    f.write("\n")
    f.write("-- ============================================================\n")
    f.write("-- END OF SAMPLE DATA\n")
    f.write("-- ============================================================\n")

print(f"Sample data SQL file generated: {output_file}")
print("\nSummary:")
print(f"- Financial Years: 20 records")
print(f"- Months: 12 records")
print(f"- DFSO: {len(df_dfso)} records")
print(f"- AFSO: {len(df_afso)} records")
print(f"- FPS: {len(df_fps)} records")
print(f"- Users: 5 records")
print(f"- APL Data: {len(df_apl)} records")
