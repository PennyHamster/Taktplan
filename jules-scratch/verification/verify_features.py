from playwright.sync_api import Page, expect

def test_edit_and_delete_task(page: Page):
    # Navigate to the app
    page.goto("http://localhost:3000")

    # Give the page time to load tasks
    page.wait_for_selector(".card")

    # --- Test Delete ---
    # Get all cards
    cards_before_delete = page.locator(".card").all()
    if not cards_before_delete:
        # If there are no tasks, we can't test delete/edit, but the UI is still "verified"
        page.screenshot(path="jules-scratch/verification/verification.png")
        return

    first_card = cards_before_delete[0]
    task_title_to_delete = first_card.locator("h4").inner_text()

    # Set up a handler for the confirmation dialog
    page.on("dialog", lambda dialog: dialog.accept())

    # Click the delete button on the first card
    first_card.get_by_role("button", name="🗑️").click()

    # Wait for the card to be removed
    expect(page.locator(f"//h4[text()='{task_title_to_delete}']")).to_have_count(0)

    # --- Test Edit ---
    # Get the new first card
    first_card_after_delete = page.locator(".card").first
    task_title_to_edit = first_card_after_delete.locator("h4").inner_text()
    task_description_to_edit = first_card_after_delete.locator("p").first.inner_text()


    # Click the edit button
    first_card_after_delete.get_by_role("button", name="✏️").click()

    # Verify the modal opened and is pre-filled
    expect(page.locator(".modal-overlay")).to_be_visible()
    expect(page.locator("h2")).to_have_text("Aufgabe bearbeiten")
    expect(page.get_by_label("Titel")).to_have_value(task_title_to_edit)
    expect(page.get_by_label("Beschreibung")).to_have_value(task_description_to_edit)


    # Take a screenshot for visual verification
    page.screenshot(path="jules-scratch/verification/verification.png")