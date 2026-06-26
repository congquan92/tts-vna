import zipfile
import xml.etree.ElementTree as ET
import os
import sys
import json
import copy
import re

namespaces = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
}

def get_cell_text(cell):
    t_tags = cell.findall('.//w:t', namespaces)
    return "".join([t.text for t in t_tags if t.text]).strip()

def set_cell_text(cell, text):
    p = cell.find('.//w:p', namespaces)
    if p is None:
        p = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p')
        cell.append(p)
    pPr = p.find('w:pPr', namespaces)
    
    # Remove all children of the paragraph except pPr
    p_children = list(p)
    for child in p_children:
        if child != pPr:
            p.remove(child)
            
    # Add new run and text
    r = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
    t = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
    t.text = str(text)
    r.append(t)
    p.append(r)

def fill_row_data(cells, data_obj):
    # Map cells to columns based on gridSpan
    col_cells = [None] * 13
    current_col = 0
    for cell in cells:
        tPr = cell.find('w:tcPr', namespaces)
        gridSpan = 1
        if tPr is not None:
            gs = tPr.find('w:gridSpan', namespaces)
            if gs is not None:
                val = gs.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val')
                if val:
                    gridSpan = int(val)
        
        if current_col < 13:
            col_cells[current_col] = cell
        current_col += gridSpan

    # Cells 2 to 12 map to the fields in the data object
    fields = [
        'cases',               # Col 3
        'deathCases',          # Col 4
        'twoVictimsCases',     # Col 5
        'victims',             # Col 6
        'unmanagedVictims',    # Col 7
        'femaleVictims',       # Col 8
        'unmanagedFemaleVictims', # Col 9
        'deaths',              # Col 10
        'unmanagedDeaths',     # Col 11
        'serious',             # Col 12
        'unmanagedSeriouslyInjured' # Col 13
    ]
    for idx, field in enumerate(fields):
        val = data_obj.get(field, 0)
        target_cell = col_cells[idx + 2]
        if target_cell is not None:
            set_cell_text(target_cell, val if val is not None else 0)

def main():
    if len(sys.argv) < 4:
        print("Usage: python generate_docx.py <template_path> <output_path> <json_data_path>")
        sys.exit(1)
        
    template_path = sys.argv[1]
    output_path = sys.argv[2]
    json_path = sys.argv[3]
    
    # Load JSON data
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    # Extract query filter values
    year = data.get('year', '...')
    period = data.get('period', '...')
    province = data.get('province', '')
    ward = data.get('ward', '')
    
    # Check if this is a single business report or Department summary
    business_name = data.get('businessName', '')
    tax_code = data.get('taxCode', '')
    type_of_business = data.get('typeOfBusiness', '')
    business_industry = data.get('businessIndustry', '')
    registered_address = data.get('registeredAddress', '')
    
    is_single_report = bool(business_name)
    
    location_str = province
    if ward and ward != 'Tất cả':
        location_str = f"{ward}, {province}"
        
    totals = data.get('totals', {})
    total_employees = totals.get('totalEmployees', 0)
    female_employees = totals.get('femaleEmployees', 0)
    total_salary = totals.get('totalSalary', 0)
    
    table2_grand = data.get('table2GrandTotal', {})
    labor_grand = data.get('laborGrandTotal', {})
    support_grand = data.get('supportGrandTotal', {})
    
    causes_data = {c['name']: c for c in data.get('causes', [])}
    factors_data = data.get('factors', [])
    occupations_data = data.get('occupations', [])
    
    # Map cause names from database/frontend to template cell names
    cause_name_map = {
        "Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn": "Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn",
        "Không có phương tiện bảo vệ cá nhân hoặc phương tiện bảo vệ cá nhân không tốt": "Không có phương tiện bảo vệ cá nhân hoặc phương tiện bảo vệ cá nhân không tốt",
        "Tổ chức lao động chưa hợp lý": "Tổ chức lao động không hợp lý",
        "Chưa huấn luyện hoặc huấn luyện an toàn, vệ sinh lao động chưa đầy đủ": "Chưa huấn luyện hoặc huấn luyện an toàn vệ sinh lao động chưa đầy đủ",
        "Không có quy trình an toàn hoặc biện pháp làm việc an toàn": "Không có quy trình an toàn hoặc biện pháp làm việc an toàn",
        "Điều kiện làm việc không tốt": "Điều kiện làm việc không tốt",
        "Vi phạm nội quy, quy trình, quy chuẩn, biện pháp làm việc an toàn": "Quy phạm nội quy, quy trình, quy chuẩn, biện pháp làm việc an toàn",
        "Không sử dụng phương tiện bảo vệ cá nhân": "Không sử dụng phương tiện bảo vệ cá nhân",
        "Khách quan khó tránh/ Nguyên nhân chưa kể đến": "Khách quan khó tránh/ Nguyên nhân chưa kể đến"
    }

    with zipfile.ZipFile(template_path, 'r') as yin, zipfile.ZipFile(output_path, 'w') as yout:
        for item in yin.infolist():
            if item.filename == 'word/document.xml':
                doc_xml = yin.read(item.filename)
                
                # Register namespaces dynamically to prevent Word 'unreadable content' error
                raw_xml_str = doc_xml.decode('utf-8', errors='ignore')
                ns_list = re.findall(r'xmlns:([a-zA-Z0-9_.-]+)="([^"]+)"', raw_xml_str)
                for prefix, uri in ns_list:
                    ET.register_namespace(prefix, uri)
                
                root = ET.fromstring(doc_xml)
                body = root.find('.//w:body', namespaces)
                
                # 1. Update text paragraphs
                paragraphs = body.findall('.//w:p', namespaces)
                for p in paragraphs:
                    t_tags = p.findall('.//w:t', namespaces)
                    full_text = "".join([t.text for t in t_tags if t.text]).strip()
                    clean_text = full_text.replace('\xa0', ' ').strip()
                    
                    if "Đơn vị báo cáo:" in clean_text:
                        pPr = p.find('w:pPr', namespaces)
                        p.clear()
                        if pPr is not None: p.append(pPr)
                        r = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        t = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        if is_single_report:
                            t.text = f"Đơn vị báo cáo: {business_name}"
                        else:
                            t.text = f"Đơn vị báo cáo: Sở Lao động - Thương binh và Xã hội {location_str or 'tỉnh/thành phố'}"
                        r.append(t)
                        p.append(r)
                        
                    elif "Địa chỉ:" in clean_text and not is_single_report:
                        pPr = p.find('w:pPr', namespaces)
                        p.clear()
                        if pPr is not None: p.append(pPr)
                        r = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        t = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        t.text = f"Địa chỉ: {location_str or '...'}"
                        r.append(t)
                        p.append(r)
                        
                    elif "Kỳ báo cáo" in clean_text:
                        pPr = p.find('w:pPr', namespaces)
                        p.clear()
                        if pPr is not None: p.append(pPr)
                        r = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        t = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        t.text = f"BÁO CÁO TỔNG HỢP TÌNH HÌNH TAI NẠN LAO ĐỘNG"
                        r.append(t)
                        p.append(r)
                        
                        r2 = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        t2 = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        t2.text = f"\nKỳ báo cáo: {period} năm {year}"
                        r2.append(t2)
                        p.append(r2)
                        
                    elif "Tổng số lao động của cơ sở:" in clean_text:
                        pPr = p.find('w:pPr', namespaces)
                        p.clear()
                        if pPr is not None: p.append(pPr)
                        r = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        t = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        label = "Tổng số lao động của các cơ sở tham gia báo cáo" if not is_single_report else "Tổng số lao động của cơ sở"
                        t.text = f"{label}: {total_employees:,} người, trong đó nữ: {female_employees:,} người"
                        r.append(t)
                        p.append(r)
                        
                    elif "Tổng quỹ lương:" in clean_text:
                        pPr = p.find('w:pPr', namespaces)
                        p.clear()
                        if pPr is not None: p.append(pPr)
                        r = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        t = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        salary_val = f"{total_salary:,}" if total_salary else "............"
                        t.text = f"Tổng quỹ lương: {salary_val} triệu đồng"
                        r.append(t)
                        p.append(r)

                # 2. Update Tables
                tables = body.findall('.//w:tbl', namespaces)
                
                # Check tables for single report info insertion (Table 1, Table 2, Table 3)
                if is_single_report:
                    # Table 1: Address Info
                    if len(tables) >= 1:
                        t1_cells = tables[0].findall('.//w:tc', namespaces)
                        if t1_cells:
                            set_cell_text(t1_cells[0], f"Địa chỉ: {registered_address or '...'}")
                            set_cell_text(t1_cells[1], f"Mã số thuế: {tax_code or '...'}")
                            
                    # Table 2: Business Type Info
                    if len(tables) >= 2:
                        t2_cells = tables[1].findall('.//w:tc', namespaces)
                        if t2_cells:
                            set_cell_text(t2_cells[0], f"Thuộc loại hình cơ sở (doanh nghiệp): {type_of_business or '...'}")
                            
                    # Table 3: Industry Sector Info
                    if len(tables) >= 3:
                        t3_cells = tables[2].findall('.//w:tc', namespaces)
                        if t3_cells:
                            set_cell_text(t3_cells[0], f"Lĩnh vực sản xuất chính của cơ sở: {business_industry or '...'}")

                # Populate Table 4 & Table 5
                if len(tables) >= 5:
                    t4 = tables[3] # Table 4
                    t5 = tables[4] # Table 5
                    
                    t4_rows = t4.findall('.//w:tr', namespaces)
                    
                    placeholder_factor_row = None
                    placeholder_occupation_row = None
                    
                    for r_idx, row in enumerate(t4_rows):
                        cells = row.findall('.//w:tc', namespaces)
                        if not cells:
                            continue
                        cell_0_text = get_cell_text(cells[0])
                        clean_text = cell_0_text.replace('\xa0', ' ').strip()
                        
                        # Set Grand Total
                        if "3. Tổng số" in clean_text:
                            fill_row_data(cells, table2_grand)
                        
                        # Set Labor Accident Report sum (Row 6: 1. Tai nạn lao động)
                        elif "1. Tai nạn lao động" in clean_text:
                            fill_row_data(cells, labor_grand)
                            
                        # Set Support Report sum (Row 23: 2. Tai nạn được hưởng trợ cấp...)
                        elif "2. Tai nạn được hưởng trợ cấp" in clean_text:
                            fill_row_data(cells, support_grand)
                        
                        # Set Cause Rows
                        elif clean_text in cause_name_map:
                            db_cause_name = cause_name_map[clean_text]
                            cause_obj = causes_data.get(db_cause_name, {})
                            fill_row_data(cells, cause_obj)
                            
                        # Capture Placeholder Rows for Factors and Occupations
                        elif clean_text == '…':
                            placeholder_factor_row = row
                        elif clean_text == '....':
                            placeholder_occupation_row = row
                    
                    # Insert factors dynamically
                    if placeholder_factor_row is not None:
                        parent_tbl = t4
                        children = list(parent_tbl)
                        p_idx = children.index(placeholder_factor_row)
                        
                        for idx, factor in enumerate(factors_data):
                            new_row = copy.deepcopy(placeholder_factor_row)
                            new_cells = new_row.findall('.//w:tc', namespaces)
                            set_cell_text(new_cells[0], factor.get('name', ''))
                            set_cell_text(new_cells[1], str(idx + 1))
                            fill_row_data(new_cells, factor)
                            parent_tbl.insert(p_idx + idx, new_row)
                        
                        parent_tbl.remove(placeholder_factor_row)
                        
                    # Insert occupations dynamically
                    if placeholder_occupation_row is not None:
                        children = list(t4)
                        p_idx = children.index(placeholder_occupation_row)
                        
                        for idx, occ in enumerate(occupations_data):
                            new_row = copy.deepcopy(placeholder_occupation_row)
                            new_cells = new_row.findall('.//w:tc', namespaces)
                            set_cell_text(new_cells[0], occ.get('name', ''))
                            set_cell_text(new_cells[1], str(idx + 1))
                            fill_row_data(new_cells, occ)
                            t4.insert(p_idx + idx, new_row)
                            
                        t4.remove(placeholder_occupation_row)
                        
                    # Process Table 5 (Damage data)
                    t5_rows = t5.findall('.//w:tr', namespaces)
                    if len(t5_rows) >= 4:
                        num_row = t5_rows[3]
                        data_row = copy.deepcopy(num_row)
                        d_cells = data_row.findall('.//w:tc', namespaces)
                        
                        set_cell_text(d_cells[0], f"{table2_grand.get('sickDays', 0):,}")
                        set_cell_text(d_cells[1], f"{table2_grand.get('totalCost', 0):,}")
                        set_cell_text(d_cells[2], f"{table2_grand.get('medicalCost', 0):,}")
                        set_cell_text(d_cells[3], f"{table2_grand.get('salaryCost', 0):,}")
                        set_cell_text(d_cells[4], f"{table2_grand.get('compensationCost', 0):,}")
                        set_cell_text(d_cells[5], f"{table2_grand.get('propertyDamage', 0):,}")
                        
                        t5.append(data_row)

                # Write XML back to zip
                yout.writestr(item.filename, ET.tostring(root, encoding='utf-8'))
            else:
                yout.writestr(item.filename, yin.read(item.filename))
                
    print("Document successfully generated at:", output_path)

if __name__ == '__main__':
    main()
