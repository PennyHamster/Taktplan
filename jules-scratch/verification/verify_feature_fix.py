import time
import requests
from playwright.sync_api import sync_playwright, expect

def wait_for_service(url, timeout=30):
    """Waits for a service to be available."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url)
            if response.status_code == 200:
                return
        except requests.exceptions.ConnectionError:
            time.sleep(1)
    raise RuntimeError(f"Service at {url} not available after {timeout} seconds")

def run(playwright):
    # Wait for the backend to be ready
    wait_for_service("http://localhost:3001/")

    # Register a manager user directly via API to avoid UI interaction issues
    requests.post("http://localhost:3001/api/auth/register", json={
        "email": "manager@example.com",
        "password": "password",
        "role": "manager"
    })

    # Register a regular user
    requests.post("http://localhost:3001/api/auth/register", json={
        "email": "employee@example.com",
        "password": "password"
    })

    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in as manager
    page.goto("http://localhost:3000/login")
    page.get_by_placeholder("Email").fill("manager@example.com")
    page.get_by_placeholder("Password").fill("password")
    page.get_by_role("button", name="Anmelden").click()

    # Wait for navigation to the board
    expect(page).to_have_url("http://localhost:3000/")

    # Open the "New Task" modal
    page.get_by_role("button", name="+ Neue Aufgabe").click()

    # Wait for the modal to appear
    expect(page.get_by_role("heading", name="Neue Aufgabe")).to_be_visible()

    # Take a screenshot of the modal
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)