import json
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import re

def scrape_chrome_extension(extension_id):
    # Setup headless Chrome for Chrome Web Store
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920x1080")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    # Open Chrome extension page
    url = f"https://chromewebstore.google.com/detail/{extension_id}"
    driver.get(url)
    time.sleep(5)  # Wait for JS to render

    data = {}

    # --- Scrape rating from Chrome Web Store ---
    try:
        rating_element = driver.find_element("xpath", '//span[@class="Vq0ZA"]')
        rating_value = rating_element.text
        data["rating"] = float(rating_value) if rating_value else "N/A"
    except Exception as e:
        data["rating"] = "N/A"
        print(f"Error scraping rating: {e}")

    # --- Scrape user count from Chrome Web Store ---
    try:
        container = driver.find_element("xpath", '//div[contains(@class, "F9iKBc")]')
        text = container.text
        users = re.search(r"([\d,]+)", text)
        if users:
            number = users.group(1).replace(",", "")
            data["users"] = int(number)
        else:
            data["users"] = "N/A"
    except Exception as e:
        data["users"] = "N/A"
        print(f"Error scraping users: {e}")

    # --- Scrape number of ratings from Chrome Web Store ---
    try:
        ratings_element = driver.find_element("xpath", '//p[contains(@class, "xJEoWe")]')
        ratings_count = ratings_element.text
        # Extract the number of ratings from the text (e.g., "10 ratings")
        number_of_ratings = re.search(r"(\d+)", ratings_count)
        if number_of_ratings:
            data["number_of_ratings"] = int(number_of_ratings.group(1))
        else:
            data["number_of_ratings"] = "N/A"
    except Exception as e:
        data["number_of_ratings"] = "N/A"
        print(f"Error scraping number of ratings: {e}")

    driver.quit()

    return data

def scrape_edge_extension(crx_id):
    # Fetch the Edge extension data in JSON format
    url = f"https://microsoftedge.microsoft.com/addons/getproductdetailsbycrxid/{crx_id}"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise error if status code is not 200
        edge_data = response.json()

        # Extract only the rating, activeInstallCount (users), and ratingCount (number of ratings)
        edge_extension_data = {
            "rating": edge_data.get("averageRating", "N/A"),
            "users": edge_data.get("activeInstallCount", "N/A"),
            "number_of_ratings": edge_data.get("ratingCount", "N/A")
        }

        return edge_extension_data
    except Exception as e:
        print(f"Error scraping Edge extension: {e}")
        return None

def main():
    chrome_extension_id = "hedjldnoldbeihmghalfbkaobifigmhi"
    edge_extension_crx_id = "kjljmlkojppfklkhdifcbbkhbalhmgfm"

    chrome_data = scrape_chrome_extension(chrome_extension_id)
    edge_data = scrape_edge_extension(edge_extension_crx_id)

    # Combine both Chrome and Edge data into one dictionary
    all_data = {
        "chrome_extension": chrome_data,
        "edge_extension": edge_data,
    }

    # Save to JSON file
    with open("docs/extension_data.json", "w") as f:
        json.dump(all_data, f, indent=2)

if __name__ == "__main__":
    main()
