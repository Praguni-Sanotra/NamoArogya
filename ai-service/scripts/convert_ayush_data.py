#!/usr/bin/env python3
"""
Convert NATIONAL AYURVEDA MORBIDITY CODES Excel file to JSON format
for use in the AI mapping service.
"""

import pandas as pd
import json
import re
from pathlib import Path
from typing import Dict, List, Any


def clean_text(text: Any) -> str:
    """Clean and normalize text data"""
    if pd.isna(text) or text == '-':
        return ""
    
    text = str(text).strip()
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    return text


def extract_category(ontology_branches: str) -> str:
    """Extract category from ontology branches"""
    if not ontology_branches:
        return "General"
    
    # Extract the main category from ontology branches
    # Example: "Accumulation of Vata pattern (TM2)" -> "Vata"
    if "vata" in ontology_branches.lower():
        return "Vata Disorders"
    elif "pitta" in ontology_branches.lower():
        return "Pitta Disorders"
    elif "kapha" in ontology_branches.lower():
        return "Kapha Disorders"
    elif "digestive" in ontology_branches.lower():
        return "Digestive"
    elif "respiratory" in ontology_branches.lower():
        return "Respiratory"
    elif "metabolic" in ontology_branches.lower():
        return "Metabolic"
    elif "musculoskeletal" in ontology_branches.lower():
        return "Musculoskeletal"
    elif "cardiovascular" in ontology_branches.lower():
        return "Cardiovascular"
    elif "neurological" in ontology_branches.lower():
        return "Neurological"
    else:
        return "General"


def convert_excel_to_json(excel_path: str, output_path: str) -> Dict[str, Any]:
    """
    Convert Excel file to JSON format
    
    Args:
        excel_path: Path to Excel file
        output_path: Path to output JSON file
        
    Returns:
        Dictionary with conversion statistics
    """
    print(f"Reading Excel file: {excel_path}")
    
    # Read Excel file
    df = pd.read_excel(excel_path, engine='xlrd')
    
    print(f"Loaded {len(df)} rows with {len(df.columns)} columns")
    print(f"Columns: {df.columns.tolist()}")
    
    # Convert to structured format
    ayush_codes = []
    categories_count = {}
    
    for idx, row in df.iterrows():
        # Extract and clean data
        namc_code = clean_text(row.get('NAMC_CODE', ''))
        namc_term = clean_text(row.get('NAMC_term', ''))
        namc_term_diacritical = clean_text(row.get('NAMC_term_diacritical', ''))
        namc_term_devanagari = clean_text(row.get('NAMC_term_DEVANAGARI', ''))
        short_def = clean_text(row.get('Short_definition', ''))
        long_def = clean_text(row.get('Long_definition', ''))
        ontology = clean_text(row.get('Ontology_branches', ''))
        name_english = clean_text(row.get('Name English', ''))
        name_english_index = clean_text(row.get('Name English Under Index', ''))
        
        # Skip rows without code
        if not namc_code or namc_code == 'AYU' or namc_code == 'DIS':
            continue
        
        # Determine category
        category = extract_category(ontology)
        categories_count[category] = categories_count.get(category, 0) + 1
        
        # Create description combining available information
        description_parts = []
        if short_def:
            description_parts.append(short_def)
        if long_def:
            description_parts.append(long_def)
        if name_english:
            description_parts.append(name_english)
        
        description = " | ".join(description_parts) if description_parts else namc_term
        
        # Create code entry
        code_entry = {
            "code": namc_code,
            "namc_id": clean_text(row.get('NAMC_ID', '')),
            "name": namc_term or name_english or namc_term_diacritical,
            "name_diacritical": namc_term_diacritical,
            "name_devanagari": namc_term_devanagari,
            "name_english": name_english,
            "description": description,
            "short_definition": short_def,
            "long_definition": long_def,
            "category": category,
            "ontology_branches": ontology,
            "system": "Ayurveda",
            "index_name": name_english_index
        }
        
        ayush_codes.append(code_entry)
    
    # Sort by code
    ayush_codes.sort(key=lambda x: x['code'])
    
    # Save to JSON
    print(f"\nSaving {len(ayush_codes)} codes to {output_path}")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(ayush_codes, f, indent=2, ensure_ascii=False)
    
    # Print statistics
    print("\n" + "="*60)
    print("CONVERSION STATISTICS")
    print("="*60)
    print(f"Total codes converted: {len(ayush_codes)}")
    print(f"\nCategory breakdown:")
    for category, count in sorted(categories_count.items(), key=lambda x: x[1], reverse=True):
        print(f"  {category}: {count}")
    
    # Sample codes
    print(f"\nSample codes (first 5):")
    for code in ayush_codes[:5]:
        print(f"  {code['code']}: {code['name']}")
    
    return {
        "total_codes": len(ayush_codes),
        "categories": categories_count,
        "output_file": output_path
    }


def main():
    """Main conversion function"""
    # Paths
    base_dir = Path(__file__).parent.parent.parent
    excel_path = base_dir / "NATIONAL AYURVEDA MORBIDITY CODES.xls"
    output_path = base_dir / "ai-service" / "data" / "namaste_codes.json"
    
    # Check if Excel file exists
    if not excel_path.exists():
        print(f"ERROR: Excel file not found at {excel_path}")
        return
    
    # Create output directory if needed
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Convert
    stats = convert_excel_to_json(str(excel_path), str(output_path))
    
    print("\n" + "="*60)
    print("CONVERSION COMPLETE!")
    print("="*60)
    print(f"Output file: {stats['output_file']}")
    print(f"Total codes: {stats['total_codes']}")
    print("\nYou can now restart the AI service to load the new dataset.")


if __name__ == "__main__":
    main()
