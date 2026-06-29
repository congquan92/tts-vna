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

def set_cell_text(cell, text, bold=False, align=None):
    paragraphs = cell.findall('.//w:p', namespaces)
    if not paragraphs:
        p = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p')
        cell.append(p)
        paragraphs = [p]
        
    p = paragraphs[0]
    for extra_p in paragraphs[1:]:
        cell.remove(extra_p)
        
    pPr = p.find('w:pPr', namespaces)
    if pPr is None:
        pPr = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}pPr')
        p.insert(0, pPr)
        
    if align:
        jc = pPr.find('w:jc', namespaces)
        if jc is None:
            jc = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}jc')
            pPr.append(jc)
        jc.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val', align)
    
    # Clone rPr from first w:r if it exists, to preserve font size/family in the table cell!
    first_r = p.find('.//w:r', namespaces)
    rPr = None
    if first_r is not None:
        rPr_elem = first_r.find('w:rPr', namespaces)
        if rPr_elem is not None:
            rPr = copy.deepcopy(rPr_elem)
            
    # Remove all children of the paragraph except pPr
    p_children = list(p)
    for child in p_children:
        if child != pPr:
            p.remove(child)
            
    # Create new run
    r = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
    if rPr is not None:
        r.append(rPr)
        # Handle bold override
        b = rPr.find('w:b', namespaces)
        if bold:
            if b is None:
                b = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}b')
                rPr.append(b)
        else:
            if b is not None:
                rPr.remove(b)
    else:
        if bold:
            rPr = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rPr')
            b = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}b')
            rPr.append(b)
            r.append(rPr)
        
    t = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
    t.text = str(text)
    if len(t.text) > 0 and (t.text.startswith(' ') or t.text.endswith(' ')):
        t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    r.append(t)
    p.append(r)

def fill_row_data(cells, data_obj, bold=False):
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

    # Write 'code' to Column 2 (Index 1 in col_cells) if present
    code_val = data_obj.get('code')
    if code_val is not None:
        target_code_cell = col_cells[1]
        if target_code_cell is not None:
            set_cell_text(target_code_cell, code_val, bold=bold, align='center')

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
            set_cell_text(target_cell, val if val is not None else 0, bold=bold, align='center')

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
    type_of_business_code = data.get('typeOfBusinessCode', '')
    business_industry = data.get('businessIndustry', '')
    business_industry_code = data.get('businessIndustryCode', '')
    registered_address = data.get('registeredAddress', '')
    district_code = data.get('districtCode', '')
    
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

    with zipfile.ZipFile(template_path, 'r') as yin, zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as yout:
        for item in yin.infolist():
            if item.filename == 'word/document.xml':
                doc_xml = yin.read(item.filename)
                
                # Extract the w:document start tag to preserve namespaces
                match = re.search(rb'<w:document\s[^>]*>', doc_xml)
                original_start_tag = match.group(0) if match else None
                
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
                        first_r = p.find('.//w:r', namespaces)
                        rPr = None
                        if first_r is not None:
                            rPr_elem = first_r.find('w:rPr', namespaces)
                            if rPr_elem is not None:
                                rPr = copy.deepcopy(rPr_elem)

                        for child in list(p):
                            if child != pPr: p.remove(child)
                            
                        r = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        if rPr is not None:
                            r.append(rPr)
                        t = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        if is_single_report:
                            t.text = f"Đơn vị báo cáo: {business_name}"
                        else:
                            t.text = f"Đơn vị báo cáo: Sở Lao động - Thương binh và Xã hội {location_str or 'tỉnh/thành phố'}"
                        r.append(t)
                        p.append(r)
                        
                    elif "Kỳ báo cáo" in clean_text:
                        pPr = p.find('w:pPr', namespaces)
                        first_r = p.find('.//w:r', namespaces)
                        rPr = None
                        if first_r is not None:
                            rPr_elem = first_r.find('w:rPr', namespaces)
                            if rPr_elem is not None:
                                rPr = copy.deepcopy(rPr_elem)
                        
                        for child in list(p):
                            if child != pPr: p.remove(child)
                        
                        # Title run
                        r1 = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        if rPr is not None:
                            r1.append(copy.deepcopy(rPr))
                        t1 = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        t1.text = "BÁO CÁO TỔNG HỢP TÌNH HÌNH TAI NẠN LAO ĐỘNG"
                        r1.append(t1)
                        p.append(r1)
                        
                        # Br 1
                        r2 = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        br = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}br')
                        r2.append(br)
                        p.append(r2)
                        
                        # Period run
                        r3 = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        if rPr is not None:
                            r3.append(copy.deepcopy(rPr))
                        t2 = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        if period == "Cả năm":
                            t2.text = f"Kỳ báo cáo: Cả năm {year}"
                        else:
                            t2.text = f"Kỳ báo cáo: {period} năm {year}"
                        r3.append(t2)
                        p.append(r3)

                        # Br 2
                        r4 = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        br2 = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}br')
                        r4.append(br2)
                        p.append(r4)

                        # Date run
                        r5 = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        if rPr is not None:
                            r5.append(copy.deepcopy(rPr))
                        t3 = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        t3.text = "Ngày báo cáo: ………………"
                        r5.append(t3)
                        p.append(r5)
                        
                    elif "Tổng số lao động của cơ sở:" in clean_text:
                        pPr = p.find('w:pPr', namespaces)
                        first_r = p.find('.//w:r', namespaces)
                        rPr = None
                        if first_r is not None:
                            rPr_elem = first_r.find('w:rPr', namespaces)
                            if rPr_elem is not None:
                                rPr = copy.deepcopy(rPr_elem)

                        for child in list(p):
                            if child != pPr: p.remove(child)
                        
                        r = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        if rPr is not None:
                            r.append(rPr)
                        t = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        label = "Tổng số lao động của các cơ sở tham gia báo cáo" if not is_single_report else "Tổng số lao động của cơ sở"
                        t.text = f"{label}: {total_employees:,} người, trong đó nữ: {female_employees:,} người"
                        r.append(t)
                        p.append(r)
                        
                    elif "Tổng quỹ lương:" in clean_text:
                        pPr = p.find('w:pPr', namespaces)
                        first_r = p.find('.//w:r', namespaces)
                        rPr = None
                        if first_r is not None:
                            rPr_elem = first_r.find('w:rPr', namespaces)
                            if rPr_elem is not None:
                                rPr = copy.deepcopy(rPr_elem)

                        for child in list(p):
                            if child != pPr: p.remove(child)

                        r = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                        if rPr is not None:
                            r.append(rPr)
                        t = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        salary_val = f"{total_salary:,}" if total_salary else "0"
                        t.text = f"Tổng quỹ lương: {salary_val} đồng"
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
                            address_parts = [p.strip().replace('\r', '').replace('\n', '') for p in [registered_address, ward, province] if p and p.strip() and p.strip() != 'Tất cả']
                            full_address = ", ".join(address_parts)
                            set_cell_text(t1_cells[0], f"Địa chỉ: {full_address or '...'}")
                            if len(t1_cells) >= 2:
                                set_cell_text(t1_cells[1], f"Mã huyện, quận: {district_code or '...'}", align='right')
                            
                    # Table 2: Business Type Info
                    if len(tables) >= 2:
                        t2_cells = tables[1].findall('.//w:tc', namespaces)
                        if t2_cells:
                            set_cell_text(t2_cells[0], f"Thuộc loại hình cơ sở (doanh nghiệp): {type_of_business or '...'}    Mã loại hình cơ sở: {type_of_business_code or '...'}")
                            
                    # Table 3: Industry Sector Info
                    if len(tables) >= 3:
                        t3_cells = tables[2].findall('.//w:tc', namespaces)
                        if t3_cells:
                            set_cell_text(t3_cells[0], f"Lĩnh vực sản xuất chính của cơ sở: {business_industry or '...'}    Mã lĩnh vực: {business_industry_code or '...'}")

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
                            table2_grand['code'] = '3'
                            fill_row_data(cells, table2_grand, bold=True)
                            set_cell_text(cells[0], cell_0_text, bold=True)
                        
                        # Set Labor Accident Report sum (Row 6: 1. Tai nạn lao động)
                        elif "1. Tai nạn lao động" in clean_text:
                            labor_grand['code'] = '1'
                            fill_row_data(cells, labor_grand, bold=True)
                            set_cell_text(cells[0], cell_0_text, bold=True)
                            
                        # Set Support Report sum (Row 23: 2. Tai nạn được hưởng trợ cấp...)
                        elif "2. Tai nạn được hưởng trợ cấp" in clean_text:
                            support_grand['code'] = '2'
                            fill_row_data(cells, support_grand, bold=True)
                            set_cell_text(cells[0], cell_0_text, bold=True)
                        
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
                            set_cell_text(new_cells[1], str(idx + 1), align='center')
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
                            set_cell_text(new_cells[1], str(idx + 1), align='center')
                            fill_row_data(new_cells, occ)
                            t4.insert(p_idx + idx, new_row)
                            
                        t4.remove(placeholder_occupation_row)
                        
                    # Process Table 5 (Damage data)
                    t5_rows = t5.findall('.//w:tr', namespaces)
                    if len(t5_rows) >= 4:
                        num_row = t5_rows[3]
                        data_row = copy.deepcopy(num_row)
                        d_cells = data_row.findall('.//w:tc', namespaces)
                        
                        def get_val(key):
                            val = table2_grand.get(key)
                            return val if val is not None else 0

                        set_cell_text(d_cells[0], f"{get_val('sickDays'):,}", bold=True, align='center')
                        set_cell_text(d_cells[1], f"{get_val('totalCost'):,}", bold=True, align='center')
                        set_cell_text(d_cells[2], f"{get_val('medicalCost'):,}", bold=True, align='center')
                        set_cell_text(d_cells[3], f"{get_val('salaryCost'):,}", bold=True, align='center')
                        set_cell_text(d_cells[4], f"{get_val('compensationCost'):,}", bold=True, align='center')
                        set_cell_text(d_cells[5], f"{get_val('propertyDamage'):,}", bold=True, align='center')
                        
                        t5.append(data_row)
 
                # Write XML back to zip
                xml_data = ET.tostring(root, encoding='utf-8')
                if original_start_tag:
                    xml_data = re.sub(rb'<[a-zA-Z0-9_:-]+:document[^>]*>', original_start_tag, xml_data, count=1)
                if not xml_data.startswith(b'<?xml'):
                    xml_data = b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + xml_data
                yout.writestr(item, xml_data)
            else:
                yout.writestr(item, yin.read(item.filename))
                
    print("Document successfully generated at:", output_path)

if __name__ == '__main__':
    main()
