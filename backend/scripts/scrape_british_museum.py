#!/usr/bin/env python3
"""
Scraper for British Museum Nilgiri Hills collection using Playwright.
Run: pip install playwright && playwright install chromium
Then: python scripts/scrape_british_museum.py
"""

import sys
import os
import json
import time
import re
from urllib.parse import urljoin

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def scrape_with_playwright():
    """Scrape using Playwright (browser automation)"""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Please install playwright:")
        print("  pip install playwright")
        print("  playwright install chromium")
        sys.exit(1)

    BASE_URL = "https://www.britishmuseum.org"
    all_items = []

    with sync_playwright() as p:
        # Use WebKit (Safari engine) - less likely to be detected as bot
        browser = p.webkit.launch(
            headless=False,
            slow_mo=50
        )
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
        )
        page = context.new_page()

        print("\nUsing WebKit (Safari engine) - should avoid bot detection.\n")

        page_num = 1
        while True:
            url = f"{BASE_URL}/collection/search?place=Nilgiri+Hills&view=list&sort=object_name__asc&page={page_num}"
            print(f"\nFetching page {page_num}: {url}")

            try:
                # Longer timeout, wait for DOM to be ready
                page.goto(url, timeout=60000, wait_until='domcontentloaded')
                time.sleep(2)

                # Check for Cloudflare challenge
                if 'challenge' in page.url or 'captcha' in page.content().lower():
                    print("\n" + "="*50)
                    print("CAPTCHA DETECTED!")
                    print("Please solve the CAPTCHA in the browser window.")
                    print("Press ENTER here when done...")
                    print("="*50)
                    input()  # Wait for user to solve CAPTCHA
                    time.sleep(2)

                # Wait for results to load
                page.wait_for_selector('a[href*="/collection/object/"]', timeout=60000)
                time.sleep(3)  # Extra wait for dynamic content
            except Exception as e:
                print(f"Page load issue: {e}")
                print("\n" + "="*50)
                print("Page didn't load correctly.")
                print("If there's a CAPTCHA, solve it and press ENTER.")
                print("Or press ENTER to retry...")
                print("="*50)
                input()
                time.sleep(3)
                continue

            # Get all object links
            links = page.query_selector_all('a[href*="/collection/object/"]')

            if not links:
                print(f"No more items found on page {page_num}")
                break

            # Extract unique object URLs
            page_items = []
            seen_urls = set()

            for link in links:
                href = link.get_attribute('href')
                if href and '/collection/object/' in href:
                    full_url = urljoin(BASE_URL, href)
                    if full_url not in seen_urls:
                        seen_urls.add(full_url)

                        # Try to get title from link text or parent
                        title = link.inner_text().strip()
                        if not title or len(title) < 3:
                            parent = link.query_selector('xpath=..')
                            if parent:
                                title = parent.inner_text().strip()

                        page_items.append({
                            'url': full_url,
                            'title': title[:100] if title else ''
                        })

            print(f"Found {len(page_items)} items on page {page_num}")
            all_items.extend(page_items)

            # Check for next page
            next_btn = page.query_selector('a[rel="next"], [aria-label="Next page"], .pagination__next')
            if not next_btn or page_num >= 20:  # Safety limit
                break

            page_num += 1
            time.sleep(1)

        print(f"\n{'='*60}")
        print(f"Total items collected: {len(all_items)}")
        print(f"{'='*60}")

        # Save progress (list of URLs)
        progress_file = os.path.join(os.path.dirname(__file__), '..', 'bm_progress.json')
        with open(progress_file, 'w') as f:
            json.dump(all_items, f, indent=2)
        print(f"Progress saved to {progress_file}")

        # Now fetch details for each item
        detailed_items = []
        for i, item in enumerate(all_items, 1):
            print(f"\n[{i}/{len(all_items)}] Fetching: {item['url']}")

            try:
                page.goto(item['url'], wait_until='networkidle')
                time.sleep(1)

                details = {'url': item['url']}

                # Title
                title_el = page.query_selector('h1')
                details['title'] = title_el.inner_text().strip() if title_el else item['title']

                # Extract metadata from definition lists
                dts = page.query_selector_all('dt')
                for dt in dts:
                    term = dt.inner_text().strip().lower()
                    dd = dt.evaluate('(el) => el.nextElementSibling?.innerText')

                    if dd:
                        if 'museum number' in term:
                            details['museum_number'] = dd.strip()
                        elif 'object type' in term:
                            details['object_type'] = dd.strip()
                        elif 'material' in term:
                            details['materials'] = dd.strip()
                        elif 'description' in term:
                            details['description'] = dd.strip()[:500]
                        elif 'date' in term or 'period' in term:
                            details['date'] = dd.strip()
                        elif 'dimension' in term:
                            details['dimensions'] = dd.strip()

                # Image URL
                img = page.query_selector('.object-detail__image img, [data-testid="object-image"] img')
                if img:
                    details['image_url'] = img.get_attribute('src')

                detailed_items.append(details)
                print(f"  Museum #: {details.get('museum_number', 'N/A')}, Type: {details.get('object_type', 'N/A')}")

                # Save progress every 10 items
                if i % 10 == 0:
                    save_results(detailed_items, 'bm_partial_results.json')
                    print(f"  [Progress saved: {i}/{len(all_items)}]")

            except Exception as e:
                print(f"  Error: {e}")
                detailed_items.append(item)

        context.close()
        browser.close()

    return detailed_items


def save_results(items, filename='british_museum_nilgiri.json'):
    """Save results to JSON file"""
    output_path = os.path.join(os.path.dirname(__file__), '..', filename)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(items, f, indent=2, ensure_ascii=False)

    print(f"\nResults saved to: {output_path}")
    return output_path


def link_to_database(items):
    """Link scraped items to existing artifacts in database"""
    from app import create_app
    from app.models import Artifact
    from app.extensions import db

    app = create_app()

    with app.app_context():
        linked = 0
        suggestions = []

        for item in items:
            # Try to find matches based on object type and materials
            object_type = item.get('object_type', '').lower()
            materials = item.get('materials', '').lower()

            if not object_type:
                continue

            # Find potential matches
            query = Artifact.query

            # Search by object type
            matches = query.filter(
                db.or_(
                    Artifact.object_type.ilike(f'%{object_type}%'),
                    Artifact.material.ilike(f'%{object_type}%')
                )
            ).all()

            for artifact in matches:
                score = 0

                # Score based on material match
                if materials and artifact.material:
                    art_material = artifact.material.lower()
                    for mat in materials.split(','):
                        if mat.strip() in art_material or art_material in mat.strip():
                            score += 2

                # Score based on type match
                if artifact.object_type:
                    art_type = artifact.object_type.lower()
                    if object_type in art_type or art_type in object_type:
                        score += 3

                if score > 0:
                    suggestions.append({
                        'bm_item': item,
                        'artifact': artifact.sequence_number,
                        'artifact_type': artifact.object_type,
                        'score': score
                    })

        # Sort and deduplicate suggestions
        suggestions.sort(key=lambda x: (-x['score'], x['artifact']))

        print(f"\n{'='*60}")
        print("SUGGESTED MATCHES")
        print("='*60")

        for s in suggestions[:50]:  # Top 50
            print(f"\nBM: {s['bm_item'].get('title', 'N/A')[:50]}")
            print(f"    Type: {s['bm_item'].get('object_type', 'N/A')}")
            print(f"    URL: {s['bm_item']['url']}")
            print(f"  -> Chennai: {s['artifact']} ({s['artifact_type']}) [Score: {s['score']}]")

        return suggestions


def main():
    print("=" * 60)
    print("British Museum Nilgiri Hills Collection Scraper")
    print("=" * 60)

    # Scrape
    items = scrape_with_playwright()

    if items:
        # Save results
        save_results(items)

        # Print summary
        print("\n" + "=" * 60)
        print("SCRAPED ITEMS")
        print("=" * 60)

        for item in items:
            print(f"\n{item.get('title', 'Unknown')[:60]}")
            print(f"  Museum #: {item.get('museum_number', 'N/A')}")
            print(f"  Type: {item.get('object_type', 'N/A')}")
            print(f"  Materials: {item.get('materials', 'N/A')}")
            print(f"  URL: {item['url']}")

        # Try to match with database
        print("\n\nAttempting to match with database...")
        link_to_database(items)

    return items


if __name__ == '__main__':
    main()
