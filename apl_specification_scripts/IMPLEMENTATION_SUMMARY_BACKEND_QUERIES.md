# Implementation Summary - Backend Query Integration

## Overview
Implementation of backend query logic as specified in backend_design_querie.md to properly filter and fetch data for New Scrutiny and Old Scrutiny tabs with financial year (fy) and month (mm) parameters.

## Specification Requirements

### Tab 1: New Scrutiny
**Requirement**: Get records from `t_apl_data` where data for the selected month/year does NOT exist in `t_apl_scrutinydetail` (excluding already submitted records for the selected month).

**Query Logic**:
```sql
WITH cte AS (
  SELECT rc_no, count(1) OVER(PARTITION BY rc_no) cnt
  FROM apl.t_apl_data a
)
SELECT * FROM cte a
WHERE NOT EXISTS (
  SELECT FROM apl.t_apl_scrutinydetail b
  WHERE a.rc_no = b.rc_no 
    AND b.fy = '2026-27' 
    AND b.mm = 4 
    AND cnt = b.member_count
)
```

### Tab 2: Old Scrutiny
**Requirement**: Get records from `apl.t_apl_scrutinydetail` - latest distinct APPROVED records where all family records match with `t_apl_data`.

### Parameters Required
- **fy** (Financial Year): Format like '2026-27'
- **mm** (Month): Integer 1-12
- These must be passed in fetch APIs and bulk insert/update operations

---

## Implementation Details

### 1. API Service Updates (`apl_scheme_web_ui/src/services/api.js`)

#### A. getBeneficiaries() - New Scrutiny (Tab 1)

**Before**:
```javascript
getBeneficiaries: async (params) => {
  const response = await api.get('/apl-data/', {
    params: {
      page: 1,
      limit: 100,
      fpsCode: params.fpsCode
    }
  });
}
```

**After**:
```javascript
getBeneficiaries: async (params) => {
  // Extract month number from month name
  const monthMap = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  };
  const mm = monthMap[params.month] || parseInt(params.month);
  
  const response = await api.get('/apl-data/', {
    params: {
      page: 1,
      limit: 1000,
      sortBy: 'rc_no',
      sortOrder: 'DESC',
      fpsCode: params.fpsCode,
      fy: params.financialYear,  // NEW: e.g., '2026-27'
      mm: mm,                     // NEW: Month number 1-12
      excludeSubmitted: true      // NEW: Exclude already submitted records
    }
  });
}
```

**Key Changes**:
- ✅ Added `fy` parameter (financial year)
- ✅ Added `mm` parameter (month number 1-12)
- ✅ Added `excludeSubmitted: true` flag to implement NOT EXISTS logic
- ✅ Month name to number conversion
- ✅ Increased limit to 1000 for better data coverage
- ✅ Documentation updated to reflect New Scrutiny purpose

---

#### B. getOldScrutinyRecords() - Old Scrutiny (Tab 2)

**Before**:
```javascript
getOldScrutinyRecords: async (params) => {
  const response = await api.get('/apl-wip/', {
    params: {
      page: 1,
      limit: 100,
      fpsCode: params.fpsCode
    }
  });
}
```

**After**:
```javascript
getOldScrutinyRecords: async (params) => {
  // Extract month number from month name
  const monthMap = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  };
  const mm = monthMap[params.month] || parseInt(params.month);
  
  const response = await api.get('/apl-wip/old-scrutiny', {
    params: {
      page: 1,
      limit: 1000,
      sortBy: 'rc_no',
      sortOrder: 'DESC',
      fpsCode: params.fpsCode,
      fy: params.financialYear,  // NEW: e.g., '2026-27'
      mm: mm,                     // NEW: Month number 1-12
      status: 'APPROVED',         // NEW: Only APPROVED records
      latestOnly: true            // NEW: Latest distinct records
    }
  });
}
```

**Key Changes**:
- ✅ Changed endpoint from `/apl-wip/` to `/apl-wip/old-scrutiny`
- ✅ Added `fy` parameter
- ✅ Added `mm` parameter
- ✅ Added `status: 'APPROVED'` to get only approved records
- ✅ Added `latestOnly: true` to get latest distinct records
- ✅ Month name to number conversion
- ✅ Increased limit to 1000
- ✅ Documentation clarifies it fetches latest APPROVED records

---

#### C. saveWIPData() - Bulk Insert with fy and mm

**Before**:
```javascript
saveWIPData: async (payload) => {
  const response = await api.post('/apl-wip/bulk', payload);
  return response.data;
}
```

**After**:
```javascript
saveWIPData: async (payload, searchParams) => {
  // Extract month number from month name
  const monthMap = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  };
  const mm = monthMap[searchParams?.month] || parseInt(searchParams?.month);
  
  // Add fy and mm to each record in payload
  const enrichedPayload = payload.map(record => ({
    ...record,
    fy: searchParams?.financialYear,  // NEW: e.g., '2026-27'
    mm: mm                             // NEW: Month number 1-12
  }));
  
  console.log('Saving WIP data with fy and mm:', { 
    fy: searchParams?.financialYear, 
    mm 
  });
  
  const response = await api.post('/apl-wip/bulk', enrichedPayload);
  return response.data;
}
```

**Key Changes**:
- ✅ Added `searchParams` parameter to function signature
- ✅ Enriches each record in payload with `fy` and `mm` fields
- ✅ Month name to number conversion
- ✅ Logging for debugging
- ✅ All records now include financial year and month context

---

### 2. Frontend Integration (`apl_scheme_web_ui/src/pages/SchemeSearch.js`)

**Before**:
```javascript
const response = await apiService.saveWIPData(combinedPayload);
```

**After**:
```javascript
const response = await apiService.saveWIPData(combinedPayload, formData);
```

**Key Changes**:
- ✅ Now passes `formData` (containing financialYear and month) to saveWIPData
- ✅ Ensures fy and mm are properly included in bulk insert operations

---

## Month Name to Number Mapping

The implementation uses a consistent month mapping throughout:

```javascript
const monthMap = {
  'January': 1, 'February': 2, 'March': 3, 'April': 4,
  'May': 5, 'June': 6, 'July': 7, 'August': 8,
  'September': 9, 'October': 10, 'November': 11, 'December': 12
};
```

This ensures:
- ✅ UI displays month names for better UX
- ✅ Backend receives numeric month values (1-12)
- ✅ Consistent conversion across all API calls

---

## Data Flow

### New Scrutiny Tab (Tab 1)
```
1. User selects: Financial Year + Month + FPS
2. Frontend calls: apiService.getBeneficiaries(formData)
3. API sends: /apl-data/?fy=2026-27&mm=4&fpsCode=XXX&excludeSubmitted=true
4. Backend executes: NOT EXISTS query to exclude submitted records
5. Returns: Only families NOT already submitted for this month/year
6. User selects families and submits
7. Frontend calls: apiService.saveWIPData(payload, formData)
8. Each record enriched with: { ...record, fy: '2026-27', mm: 4 }
9. Bulk insert to t_apl_scrutinydetail with fy and mm
```

### Old Scrutiny Tab (Tab 2)
```
1. User selects: Financial Year + Month + FPS
2. Frontend calls: apiService.getOldScrutinyRecords(formData)
3. API sends: /apl-wip/old-scrutiny?fy=2026-27&mm=4&status=APPROVED&latestOnly=true
4. Backend executes: Query for latest APPROVED records matching t_apl_data
5. Returns: Latest approved scrutiny records for this month/year
6. User can review and re-submit if needed
```

---

## Backend API Expectations

The backend services need to implement:

### 1. GET /apl-data/
**Query Parameters**:
- `fy`: Financial year (e.g., '2026-27')
- `mm`: Month number (1-12)
- `fpsCode`: FPS code
- `excludeSubmitted`: Boolean flag

**Expected Logic**:
```sql
-- When excludeSubmitted=true
WITH family_counts AS (
  SELECT rc_no, COUNT(1) OVER(PARTITION BY rc_no) as member_count
  FROM t_apl_data
  WHERE fps_code = :fpsCode
)
SELECT * FROM family_counts fc
WHERE NOT EXISTS (
  SELECT 1 FROM t_apl_scrutinydetail s
  WHERE fc.rc_no = s.rc_no
    AND s.fy = :fy
    AND s.mm = :mm
    AND fc.member_count = s.member_count
)
```

### 2. GET /apl-wip/old-scrutiny
**Query Parameters**:
- `fy`: Financial year
- `mm`: Month number
- `fpsCode`: FPS code
- `status`: 'APPROVED'
- `latestOnly`: true

**Expected Logic**:
```sql
-- Get latest APPROVED records that match with t_apl_data
WITH latest_approved AS (
  SELECT DISTINCT ON (rc_no) *
  FROM t_apl_scrutinydetail
  WHERE fy = :fy
    AND mm = :mm
    AND fps_code = :fpsCode
    AND status = 'APPROVED'
  ORDER BY rc_no, created_at DESC
)
SELECT la.* 
FROM latest_approved la
WHERE EXISTS (
  SELECT 1 FROM t_apl_data d
  WHERE d.rc_no = la.rc_no
)
```

### 3. POST /apl-wip/bulk
**Request Body**:
```json
[
  {
    "rc_no": 123456,
    "member_id": 1001,
    "fy": "2026-27",
    "mm": 4,
    "status": "SCRUTINY_PENDING",
    // ... other fields
  }
]
```

**Expected Behavior**:
- Insert records into `t_apl_scrutinydetail`
- Store `fy` and `mm` for each record
- Use for future filtering and tracking

---

## Testing Checklist

### New Scrutiny Tab
- [ ] Select fy='2026-27', mm='April', fps='XXX'
- [ ] Verify API call includes: `fy=2026-27&mm=4&excludeSubmitted=true`
- [ ] Verify only unsubmitted families are returned
- [ ] Select families and submit
- [ ] Verify each record in bulk insert has `fy` and `mm` fields
- [ ] Verify records inserted with correct fy and mm values
- [ ] Re-fetch New Scrutiny - should NOT show just-submitted families

### Old Scrutiny Tab
- [ ] Select fy='2026-27', mm='April', fps='XXX'
- [ ] Verify API call includes: `fy=2026-27&mm=4&status=APPROVED&latestOnly=true`
- [ ] Verify only latest APPROVED records are returned
- [ ] Verify records match with t_apl_data
- [ ] Can re-submit old records if needed

### Month Conversion
- [ ] Select month='January', verify mm=1 in API
- [ ] Select month='December', verify mm=12 in API
- [ ] Verify all month names convert correctly

---

## Benefits

### 1. Proper Data Isolation
- New Scutiny excludes already submitted records
- Prevents duplicate submissions for same month/year
- Clear separation between new and old records

### 2. Historical Tracking
- All records tagged with fy and mm
- Can track submissions by month and year
- Audit trail for scrutiny process

### 3. Accurate Old Scrutiny
- Shows latest approved versions
- Matches with current t_apl_data
- Allows re-scrutiny if needed

### 4. Backend Flexibility
- Backend can implement complex queries
- Frontend sends necessary context (fy, mm)
- Clean separation of concerns

---

## Files Modified

1. **apl_scheme_web_ui/src/services/api.js**
   - Updated `getBeneficiaries()` - Added fy, mm, excludeSubmitted
   - Updated `getOldScrutinyRecords()` - Added fy, mm, status, latestOnly
   - Updated `saveWIPData()` - Enriches payload with fy and mm
   - Added month name to number conversion logic

2. **apl_scheme_web_ui/src/pages/SchemeSearch.js**
   - Updated `handleFinalSubmit()` - Passes formData to saveWIPData

3. **apl_specification_scripts/IMPLEMENTATION_SUMMARY_BACKEND_QUERIES.md** (NEW)
   - This documentation file

---

## Backend Implementation Required

The backend team needs to implement:

1. **Update GET /apl-data/ endpoint**
   - Add fy, mm query parameters
   - Implement excludeSubmitted logic with NOT EXISTS query
   - Return only families not submitted for selected month/year

2. **Create GET /apl-wip/old-scrutiny endpoint**
   - Accept fy, mm, status, latestOnly parameters
   - Implement query for latest APPROVED records
   - Ensure records match with t_apl_data

3. **Update POST /apl-wip/bulk endpoint**
   - Accept fy and mm fields in request body
   - Store fy and mm in t_apl_scrutinydetail table
   - Use for filtering in subsequent queries

4. **Database Schema**
   - Ensure t_apl_scrutinydetail has fy and mm columns
   - Add indexes on (fy, mm, rc_no) for performance
   - Consider composite indexes for common queries

---

## Example API Calls

### 1. Fetch New Scrutiny Data
```http
GET /api/v1/apl-data/?page=1&limit=1000&sortBy=rc_no&sortOrder=DESC&fpsCode=150005800001&fy=2026-27&mm=4&excludeSubmitted=true
```

### 2. Fetch Old Scrutiny Data
```http
GET /api/v1/apl-wip/old-scrutiny?page=1&limit=1000&sortBy=rc_no&sortOrder=DESC&fpsCode=150005800001&fy=2026-27&mm=4&status=APPROVED&latestOnly=true
```

### 3. Submit Bulk Data
```http
POST /api/v1/apl-wip/bulk
Content-Type: application/json

[
  {
    "rc_no": 123456,
    "member_id": 1001,
    "fy": "2026-27",
    "mm": 4,
    "dist_code": "15",
    "dfso_code": "1502",
    "afso_code": "1502308",
    "fps_code": "150005800001",
    "total_disbursement_amount": 170,
    "is_disbursement_account": true,
    "status": "SCRUTINY_PENDING"
  }
]
```

---

## Conclusion

Successfully implemented backend query integration as specified:

1. ✅ **New Scrutiny**: Excludes already submitted records using fy and mm
2. ✅ **Old Scrutiny**: Fetches latest APPROVED records
3. ✅ **Bulk Insert**: All records tagged with fy and mm
4. ✅ **Month Conversion**: Consistent month name to number mapping
5. ✅ **Clean Integration**: Minimal changes, maximum impact

The implementation ensures proper data filtering, historical tracking, and prevents duplicate submissions for the same month/year combination.
