# APL Scheme Web Application

A modern React-based web application for managing APL (Antyodaya Parivar Yojana) Scheme beneficiary data with complex family grouping and approval workflows.

## 🎯 Features

### ✅ All 10 Requirements Implemented

1. **Authentication System**
   - Login page with username/password
   - Protected routes (redirects unauthenticated users)
   - Session management with localStorage

2. **Scheme Search Form**
   - Financial Year dropdown (mandatory)
   - Month dropdown (mandatory)
   - AFSO Office (pre-filled, read-only)
   - FPS Name dropdown (mandatory)
   - Proceed button (disabled until all mandatory fields filled)

3. **Beneficiary List Table**
   - 21 columns as specified
   - Grouped by Ration Card Number (family grouping)
   - Horizontal scroll for smaller screens

4. **Family Checkbox Logic**
   - One checkbox per family (merged on first row)
   - Selects/deselects all members of that family

5. **Radio Button Logic**
   - One radio button per member
   - Auto-selects and locks if HOF has bank account = Yes
   - Enables manual selection if HOF bank account = No

6. **Auto-Calculated Benefit Amount**
   - Formula: 170 × number of family members
   - Read-only, auto-updates
   - Displayed on first row of each family

7. **Save Button Validations**
   - At least one family must be selected
   - Each selected family must have one radio button checked
   - Shows error messages with family count

8. **JSON Payload Construction**
   - Builds array with all required fields
   - Logs to console
   - Shows success message

9. **Edge Case Handling**
   - "No records found" state
   - Disabled Proceed button when form incomplete
   - Validation error highlighting in red
   - Loading states

10. **Polish & UX**
    - Logout button in header
    - Clean, modern UI with Tailwind CSS
    - Responsive design
    - Smooth transitions and hover effects

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm or yarn
- Backend API running on http://localhost:3000

### Installation

1. **Navigate to web directory**
   ```bash
   cd apl_scheme_web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3001
   ```

## 🔐 Demo Credentials

```
Username: admin
Password: admin123

Username: user1
Password: password123
```

## 📁 Project Structure

```
apl_scheme_web/
├── public/                       # Static files
├── src/
│   ├── components/
│   │   ├── BeneficiaryTable.js  # Complex table with family grouping logic
│   │   └── ProtectedRoute.js    # Route protection component
│   ├── context/
│   │   └── AuthContext.js       # Authentication state management
│   ├── pages/
│   │   ├── Login.js             # Login page
│   │   └── SchemeSearch.js      # Main search and beneficiary page
│   ├── services/
│   │   └── api.js               # API integration (Axios)
│   ├── App.js                   # Main app with routing
│   ├── index.css                # Tailwind CSS imports
│   └── index.js                 # React entry point
├── .env                          # Environment variables
├── tailwind.config.js            # Tailwind configuration
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🎨 Key Components

### 1. AuthContext
- Manages user authentication state
- Provides login/logout functions
- Persists auth in localStorage

### 2. ProtectedRoute
- Wraps protected pages
- Redirects to login if not authenticated
- Shows loading state during auth check

### 3. Login Page
- Username and password fields
- Form validation
- Error message display
- Automatic redirect after successful login

### 4. SchemeSearch Page
- Search form with dropdowns
- Pre-filled AFSO office (read-only)
- Proceed button validation
- Integrates BeneficiaryTable component

### 5. BeneficiaryTable Component
**Complex Logic Implemented:**

#### Family Grouping
- Groups members by Ration Card Number
- Merges family-level columns (checkbox only on first row)
- Each member shown as separate row

#### Checkbox Logic (Per Family)
```javascript
- One checkbox per family
- Checking = selects all members
- Unchecking = deselects all members
```

#### Radio Button Logic (Per Member)
```javascript
- Auto-select HOF if bank_account === 'Yes'
- Lock all radio buttons for that family
- Enable manual selection if HOF bank_account === 'No'
- Show "(Auto)" label for auto-selected members
```

#### Benefit Calculation
```javascript
Total Benefit = 170 × member_count
// Auto-calculated, read-only
```

#### Validation Rules
```javascript
1. selectedFamilies.size > 0
2. Each selectedFamily must have disbursement member selected
3. Show red background for validation errors
```

#### Payload Construction
```javascript
{
  financial_year,
  month,
  afso_office,
  fps_name,
  rc_no,
  rc_type,
  hof_name,
  member_name (selected),
  member_id (selected),
  aadhaar,
  total_benefit_amount,
  ekyc_status,
  ...
}
```

## 🎭 User Flow

```
1. User lands on root (/) → Redirect to /login
2. User enters credentials on /login
3. On success → Redirect to /scheme-search
4. User fills search form (Financial Year, Month, FPS Name)
5. User clicks "Proceed" → Fetches beneficiary data
6. Table displays with families grouped
7. User selects family checkboxes
8. User selects/verifies disbursement radio buttons
9. User clicks "Save" → Validation → Payload creation → API call
10. Success message displayed
```

## 🧪 Testing the Application

### 1. Test Login
- Try invalid credentials → Should show error
- Try valid credentials → Should redirect to Scheme Search

### 2. Test Search Form
- Leave fields empty → Proceed button disabled
- Fill all mandatory fields → Proceed button enabled
- AFSO Office should be read-only

### 3. Test Beneficiary Table
- Families should be grouped by RC Number
- Checkbox should select/deselect entire family
- Radio buttons should have auto-selection logic:
  - Family 1 (John Doe): HOF with bank=Yes → Auto-selected, locked
  - Family 2 (Robert Smith): HOF with bank=No → Manual selection enabled
  - Family 3 (David Wilson): HOF with bank=Yes → Auto-selected, locked

### 4. Test Validations
- Click Save without selecting families → Should show error
- Select family without radio button → Should highlight in red
- Fix validations → Should allow save

### 5. Test Logout
- Click logout button → Should redirect to login
- Try accessing /scheme-search → Should redirect to login

## 🔌 API Integration

The application connects to the backend API at:
```
http://localhost:3000/api/v1
```

Configure in `.env`:
```env
REACT_APP_API_URL=http://localhost:3000/api/v1
```

### Mock Data vs Real API
Currently uses mock data for beneficiaries. To connect to real backend:

1. Uncomment API call in `src/services/api.js`:
   ```javascript
   // In getBeneficiaries method
   const response = await api.get('/apl-data', { params });
   return response.data;
   ```

2. Uncomment save call in `BeneficiaryTable.js`:
   ```javascript
   // In handleSave method
   await apiService.saveWIPData(payload);
   ```

## 🎨 Styling

Built with **Tailwind CSS** for:
- Responsive design
- Modern UI components
- Consistent spacing and colors
- Hover effects and transitions

### Color Scheme
- Primary: Blue (#2563EB)
- Success: Green (#059669)
- Error: Red (#DC2626)
- Background: Gray shades

## 📱 Responsive Design

- **Desktop**: Full table with all columns
- **Tablet**: Horizontal scroll enabled
- **Mobile**: Form stacks vertically, table scrollable

## 🔒 Security Considerations

### Current Implementation
- Basic authentication (demo only)
- LocalStorage for session management
- Protected routes

### Production Recommendations
1. Implement JWT authentication
2. Use HttpOnly cookies for tokens
3. Add CSRF protection
4. Implement proper session management
5. Add input sanitization
6. Use environment-specific API URLs
7. Implement rate limiting
8. Add XSS protection

## 🐛 Troubleshooting

### Issue: Application won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### Issue: Tailwind styles not applying
```bash
# Rebuild Tailwind
npx tailwindcss -i ./src/index.css -o ./src/output.css --watch
```

### Issue: Can't connect to backend
- Verify backend is running on http://localhost:3000
- Check REACT_APP_API_URL in .env
- Check CORS settings in backend

### Issue: Radio buttons not auto-selecting
- Verify mock data has correct `is_hof` and `bank_account` values
- Check browser console for errors
- Verify useEffect in BeneficiaryTable runs

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized build in the `build/` directory.

### Deploy to Static Hosting
```bash
# Deploy to Netlify, Vercel, or any static host
# Example with serve:
npx serve -s build -p 3001
```

## 📊 Performance Optimizations

- React.memo for expensive components
- Efficient state management
- Debounced search inputs
- Lazy loading components
- Optimized re-renders

## 🔄 Future Enhancements

- [ ] Add JWT authentication
- [ ] Implement role-based access control
- [ ] Add data export (CSV, PDF)
- [ ] Add print functionality
- [ ] Implement advanced search filters
- [ ] Add data visualization (charts/graphs)
- [ ] Add notification system
- [ ] Implement dark mode
- [ ] Add multi-language support
- [ ] Add unit and integration tests
- [ ] Implement PWA features
- [ ] Add offline support

## 📝 Available Scripts

### `npm start`
Runs the app in development mode at http://localhost:3001

### `npm run build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner

### `npm run eject`
Ejects from create-react-app (one-way operation)

## 📄 License

ISC

## 👥 Support

For issues:
1. Check console for errors
2. Verify backend is running
3. Check network tab for API calls
4. Review this documentation

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-14  
**Framework:** React 18  
**UI Library:** Tailwind CSS  
**Routing:** React Router v6
