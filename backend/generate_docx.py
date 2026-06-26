import zipfile
import xml.etree.ElementTree as ET
import os
import sys
import json
import copy

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
        set_cell_text(cells[idx + 2], val if val != 0 else '-')

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
    
    location_str = province
    if ward and ward != 'Tất cả':
        location_str = f"{ward}, {province}"
        
    totals = data.get('totals', {})
    total_employees = totals.get('totalEmployees', 0)
    female_employees = totals.get('femaleEmployees', 0)
    total_salary = totals.get('totalSalary', 0)
    
    table2_grand = data.get('table2GrandTotal', {})
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
        "Khách quan khó tránh/\xa0Nguyên nhân chưa kể đến": "Khách quan khó tránh/ Nguyên nhân chưa kể đến"
    }

    with zipfile.ZipFile(template_path, 'r') as yin, zipfile.ZipFile(output_path, 'w') as yout:
        for item in yin.infolist():
            if item.filename == 'word/document.xml':
                doc_xml = yin.read(item.filename)
                root = ET.fromstring(doc_xml)
                body = root.find('.//w:body', namespaces)
                
                # 1. Update text paragraphs
                paragraphs = body.findall('.//w:p', namespaces)
                for p in paragraphs:
                    t_tags = p.findall('.//w:t', namespaces)
                    full_text = "".join([t.text for t in t_tags if t.text]).strip()
                    
                    if "Đơn vị báo cáo:" in full_text:
                        pPr = p.find('w:pPr', namespaces)
                        p.clear()
                        if pPr is not None: p.append(pPr)
                        r = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        t = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        t.text = f"Đơn vị báo cáo: Sở Lao động - Thương binh và Xã hội {location_str or 'tỉnh/thành phố'}"
                        r.append(t)
                        p.append(r)
                        
                    elif "Địa chỉ:" in full_text:
                        pPr = p.find('w:pPr', namespaces)
                        p.clear()
                        if pPr is not None: p.append(pPr)
                        r = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        t = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        t.text = f"Địa chỉ: {location_str or '...'}"
                        r.append(t)
                        p.append(r)
                        
                    elif "Kỳ báo cáo" in full_text:
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
                        
                    elif "Tổng số lao động của cơ sở:" in full_text:
                        pPr = p.find('w:pPr', namespaces)
                        p.clear()
                        if pPr is not None: p.append(pPr)
                        r = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        t = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        t.text = f"Tổng số lao động của các cơ sở tham gia báo cáo: {total_employees:,} người, trong đó nữ: {female_employees:,} người"
                        r.append(t)
                        p.append(r)
                        
                    elif "Tổng quỹ lương:" in full_text:
                        pPr = p.find('w:pPr', namespaces)
                        p.clear()
                        if pPr is not None: p.append(pPr)
                        r = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        t = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        t.text = f"Tổng quỹ lương: {total_salary:,} triệu đồng"
                        r.append(t)
                        p.append(r)

                # 2. Update Table 4 (Classifications) & Table 5 (Damages)
                tables = body.findall('.//w:tbl', namespaces)
                if len(tables) >= 5:
                    t4 = tables[3] # Table 4
                    t5 = tables[4] # Table 5
                    
                    # Process Table 4 rows
                    t4_rows = t4.findall('.//w:tr', namespaces)
                    
                    placeholder_factor_row = None
                    placeholder_occupation_row = None
                    
                    for r_idx, row in enumerate(t4_rows):
                        cells = row.findall('.//w:tc', namespaces)
                        if not cells:
                            continue
                        cell_0_text = get_cell_text(cells[0])
                        
                        # Set Grand Total
                        if cell_0_text == '3. Tổng số (3=1+2)':
                            fill_row_data(cells, table2_grand)
                        
                        # Set Cause Rows
                        elif cell_0_text in cause_name_map:
                            db_cause_name = cause_name_map[cell_0_text]
                            cause_obj = causes_data.get(db_cause_name, {})
                            fill_row_data(cells, cause_obj)
                            
                        # Capture Placeholder Rows for Factors and Occupations
                        elif cell_0_text == '…':
                            placeholder_factor_row = row
                        elif cell_0_text == '....':
                            placeholder_occupation_row = row
                    
                    # Insert factors dynamically
                    if placeholder_factor_row is not None:
                        # Find index of placeholder in parent w:tbl
                        parent_tbl = t4
                        children = list(parent_tbl)
                        p_idx = children.index(placeholder_factor_row)
                        
                        # Insert rows
                        for idx, factor in enumerate(factors_data):
                            new_row = copy.deepcopy(placeholder_factor_row)
                            new_cells = new_row.findall('.//w:tc', namespaces)
                            set_cell_text(new_cells[0], factor.get('name', ''))
                            # Set number code
                            set_cell_text(new_cells[1], str(idx + 1))
                            fill_row_data(new_cells, factor)
                            parent_tbl.insert(p_idx + idx, new_row)
                        
                        # Remove placeholder row
                        parent_tbl.remove(placeholder_factor_row)
                        
                    # Insert occupations dynamically
                    if placeholder_occupation_row is not None:
                        # Re-locate children as we modified table size
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
                    # Table 5 in template has 4 header rows. We need to add 1 data row.
                    t5_rows = t5.findall('.//w:tr', namespaces)
                    if len(t5_rows) >= 4:
                        # Duplicate row 4 (the numbering row)
                        num_row = t5_rows[3]
                        data_row = copy.deepcopy(num_row)
                        d_cells = data_row.findall('.//w:tc', namespaces)
                        
                        # Populate Table 5 cells: Col 1 to 6
                        # 1: sickDays, 2: totalCost, 3: medicalCost, 4: salaryCost, 5: compensationCost, 6: propertyDamage
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
