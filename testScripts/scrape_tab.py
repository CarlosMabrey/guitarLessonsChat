# scrape_tab.py
from bs4 import BeautifulSoup

def extract_tab_from_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    # Simulate grabbing tab content from Ultimate Guitar
    pre_blocks = soup.find_all('pre')  # <pre> holds the tab

    tab_text = ""
    for pre in pre_blocks:
        tab_text += pre.get_text() + "\n"

    return tab_text
