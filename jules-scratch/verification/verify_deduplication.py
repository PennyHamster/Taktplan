from playwright.sync_api import sync_playwright, expect
import time
import subprocess

def wait_for_db_setup():
    """Polls the 'api' service logs to see if the database tables are ready."""
    print("Waiting for the backend to set up the database...")
    for i in range(20): # Try for 40 seconds
        try:
            logs = subprocess.check_output(
                ["sudo", "docker", "compose", "logs", "api"],
                text=True,
                stderr=subprocess.PIPE
            )
            if 'Table "users" is ready.' in logs:
                print("Database is ready!")
                return True
        except subprocess.CalledProcessError as e:
            print(f"Could not get logs, retrying... Error: {e.stderr}")

        time.sleep(2)
    print("Timed out waiting for database setup.")
    return False


def run(playwright):
    if not wait_for_db_setup():
        raise RuntimeError("Database setup failed or timed out.")

    # Add a manager user to the database, ignore if already exists
    # The password is 'password'
    subprocess.run(
        [
            "sudo", "docker", "compose", "exec", "-T", "db", "psql", "-U", "user", "-d", "taktplan",
            "-c", "INSERT INTO users (email, password_hash, role) VALUES ('manager@example.com', '$2b$10$E.pN..8Xt14fxgp.G/GUXO82fnpwGg5C/u1jCg5Sj1fJz6i.p2X.G', 'manager') ON CONFLICT (email) DO NOTHING",
        ],
        check=True,
    )

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

    # Take screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")
    print("Screenshot saved to jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)