
import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in as a manager
    page.goto("http://localhost:3000/login")
    page.get_by_label("Email").fill("manager@taktplan.com")
    page.get_by_label("Password").fill("managerpassword")
    page.get_by_role("button", name="Login").click()

    # Wait for navigation to the board
    expect(page).to_have_url(re.compile(r".*/$"))

    # Open the "New Task" modal
    page.get_by_role("button", name="+ Neue Aufgabe").click()

    # Wait for the modal to appear
    expect(page.get_by_role("heading", name="Neue Aufgabe")).to_be_visible()

    # Verify the "Assign to" dropdown is visible
    expect(page.get_by_label("Zuweisen an")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="/usr/src/app/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
