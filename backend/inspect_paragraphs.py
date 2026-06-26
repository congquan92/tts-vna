import zipfile
import xml.etree.ElementTree as ET
import sys

sys.stdout.reconfigure(encoding='utf-8')

namespaces = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
}

docx_path = r"D:\vna\tts-vna\BC tình hình TNLĐ - PHỤ LỤC XII.docx"

with zipfile.ZipFile(docx_path, 'r') as yin:
    doc_xml = yin.read('word/document.xml')
    root = ET.fromstring(doc_xml)
    body = root.find('.//w:body', namespaces)
    
    paragraphs = body.findall('.//w:p', namespaces)
    print(f"Total paragraphs: {len(paragraphs)}")
    for i, p in enumerate(paragraphs):
        t_tags = p.findall('.//w:t', namespaces)
        full_text = "".join([t.text for t in t_tags if t.text]).strip()
        if full_text:
            print(f"Paragraph {i}: '{full_text}'")
