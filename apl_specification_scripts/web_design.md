Here are the clean prompting steps you can use to build this app incrementally:

---

**Step 1 — Project Setup**

> Create a React single-page application using functional components and hooks. Use Tailwind CSS for styling. Set up routing with React Router for these pages: Login, Scheme Search, and Beneficiary List. Create a basic app shell with protected routes — unauthenticated users should be redirected to the Login page.

---

**Step 2 — Login Page**

> Create a Login page with a username and password field and a Login button. On successful credential match, store the auth state in context or localStorage and redirect to the Scheme Search page. Show an error message for invalid credentials. Keep the UI clean with centered card layout.

---

**Step 3 — Scheme Search Page (Search Form)**

> On the Scheme Search page, build a search form with these fields:
> - Financial Year — dropdown, mandatory
> - Month — dropdown, mandatory
> - AFSO Office Name — read-only label field, non-editable, pre-filled based on logged-in user's location
> - FPS Name — dropdown, mandatory
>
> Add a Proceed button. On click, validate that all mandatory fields are filled. If valid, fetch or load beneficiary data from created API based on the selected parameters and display the Beneficiary List table below the form.

---

**Step 4 — Beneficiary List Table Structure**

> Below the search form, render a table titled "List of Beneficiaries" with these columns:
> Select (checkbox), S.No., District Name, DFSO Office Name, AFSO Office Name, FPS Name, Ration Card Type, Ration Card Number, HOF Name / Family Head, Member Name, Member ID, Gender, Relationship with HOF, Date of Birth, Age, Aadhaar No., Demographic Authentication Completed (Yes/No), EKYC Status (Yes/No), Aadhaar Linked Bank Account Available (Yes/No), Select Account for Disbursement (radio button), Total Benefit Amount.
>
> Populate it with data fetched from API. Group rows by Ration Card Number to represent families. Each family shares one checkbox. Each member has its own radio button.

---

**Step 5 — Checkbox Logic (Per Family)**

> The checkbox in the Select column is per family, grouped by unique Ration Card Number. When a family checkbox is checked, all member rows of that family become selected. When unchecked, all member rows of that family are deselected. Only one checkbox per family should appear, merged or shown on the first row of that family group.

---

**Step 6 — Radio Button Logic (Per Member)**

> Each member row has a radio button under "Select Account for Disbursement", unique per Member ID. Apply these rules:
> - If the Head of Family (HOF) and the member are the same person AND Aadhaar Linked Bank Account is Yes — auto-check the radio button for that member and disable all radio buttons for that family (no selection change allowed).
> - If the HOF's Aadhaar Linked Bank Account status is No — keep radio buttons enabled so the user can manually select a different member for disbursement.

---

**Step 7 — Total Benefit Amount Calculation**

> For each family (grouped by Ration Card Number), calculate Total Benefit Amount as:
> `170 × total number of members in that family`
> Display this auto-calculated value in the Total Benefit Amount column. This value should be read-only and update automatically if member data changes.

---

**Step 8 — Save Button Validations**

> Add a Save button below the table. On click, apply these validations before submission:
> 1. At least one family checkbox must be selected — show error if none selected.
> 2. For every checked family, the radio button must be selected for one member — show error listing which families are missing radio selection.
> 3. Only proceed to payload creation if all validations pass.

---

**Step 9 — JSON Payload Construction**

> On successful validation, construct a JSON array as the POST payload. Each object in the array should represent a selected family-member combination and include: Financial Year, Month, AFSO Office Name, FPS Name, Ration Card Number, Ration Card Type, HOF Name, selected Member Name, Member ID, Aadhaar No., Total Benefit Amount, and EKYC Status. Log the payload to console and show a success toast/message to the user.

---

**Step 10 — Polish & Edge Cases**

> Add these finishing touches:
> - Disable the Proceed button while search fields are incomplete
> - Show a "No records found" state if the mock data returns empty
> - Highlight rows with validation errors (missing radio selection) in a light red background
> - Add a logout button on the header that clears auth state and redirects to Login
> - Make the table horizontally scrollable on smaller screens