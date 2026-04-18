# Database Queries - Results

## Query 1: Fetch data from t_apl_data with filters and pagination

### Description
This query fetches data from t_apl_data table with support for filtering based on dist_code, dfso_code, afso_code, and fps_code, along with pagination support.

### SQL Query

```sql
-- Query with all filter parameters and pagination
-- Parameters: 
--   @dist_code (optional) - District code filter
--   @dfso_code (optional) - DFSO code filter
--   @afso_code (optional) - AFSO code filter
--   @fps_code (optional) - FPS code filter
--   @page_size - Number of records per page (e.g., 10, 20, 50)
--   @page_number - Page number (starts from 1)

SELECT 
    id,
    sno,
    dist_code,
    dist_name,
    dfso_code,
    dfso_name,
    afso_code,
    afso_name,
    fps_code,
    fps_name,
    ct_card_desk,
    rc_no,
    hof_name,
    member_id,
    member_name,
    gender,
    relation_name,
    member_dob,
    uid,
    demo_auth,
    ekyc,
    is_active,
    created_at,
    modified_at
FROM t_apl_data
WHERE 
    -- Filter by district code (if provided)
    (@dist_code IS NULL OR dist_code = @dist_code)
    -- Filter by DFSO code (if provided)
    AND (@dfso_code IS NULL OR dfso_code = @dfso_code)
    -- Filter by AFSO code (if provided)
    AND (@afso_code IS NULL OR afso_code = @afso_code)
    -- Filter by FPS code (if provided)
    AND (@fps_code IS NULL OR fps_code = @fps_code)
    -- Only active records
    AND is_active = true
ORDER BY 
    created_at DESC
LIMIT @page_size
OFFSET (@page_number - 1) * @page_size;
```

### Usage Examples

#### Example 1: Fetch first page with district filter
```sql
-- Fetch first 10 records for district code 501
SELECT * FROM t_apl_data
WHERE dist_code = 501
  AND is_active = true
ORDER BY created_at DESC
LIMIT 10
OFFSET 0;
```

#### Example 2: Fetch second page with DFSO filter
```sql
-- Fetch records 11-20 for DFSO code 1502
SELECT * FROM t_apl_data
WHERE dfso_code = 1502
  AND is_active = true
ORDER BY created_at DESC
LIMIT 10
OFFSET 10;
```

#### Example 3: Fetch with multiple filters
```sql
-- Fetch first 20 records for specific district, DFSO, and AFSO
SELECT * FROM t_apl_data
WHERE dist_code = 501
  AND dfso_code = 1502
  AND afso_code = 1502308
  AND is_active = true
ORDER BY created_at DESC
LIMIT 20
OFFSET 0;
```

#### Example 4: Fetch with FPS filter
```sql
-- Fetch records for specific FPS code
SELECT * FROM t_apl_data
WHERE fps_code = 150230812345
  AND is_active = true
ORDER BY created_at DESC
LIMIT 50
OFFSET 0;
```

### With Count Query (for pagination metadata)
```sql
-- Get total count for pagination
SELECT COUNT(*) as total_records
FROM t_apl_data
WHERE 
    (@dist_code IS NULL OR dist_code = @dist_code)
    AND (@dfso_code IS NULL OR dfso_code = @dfso_code)
    AND (@afso_code IS NULL OR afso_code = @afso_code)
    AND (@fps_code IS NULL OR fps_code = @fps_code)
    AND is_active = true;
```

---

## Query 2: Bulk update data in t_apl_wip_data based on member_id and rc_no

### Description
This query performs bulk updates on t_apl_wip_data table using member_id and rc_no as identifiers. It uses PostgreSQL's UPDATE with JOIN pattern via subquery.

### SQL Query - Method 1: Using UPDATE FROM with VALUES

```sql
-- Bulk update using UPDATE FROM with VALUES clause
-- This method is efficient for PostgreSQL and allows updating multiple records in one query

UPDATE t_apl_wip_data AS target
SET 
    status = data.status,
    total_disbursement_amount = data.total_disbursement_amount,
    is_disbursement_account = data.is_disbursement_account,
    remarks = data.remarks,
    modified_at = CURRENT_TIMESTAMP,
    modified_by = data.modified_by,
    approved_at = CASE 
        WHEN data.status = 'APPROVED' THEN CURRENT_TIMESTAMP 
        ELSE target.approved_at 
    END,
    approved_by = CASE 
        WHEN data.status = 'APPROVED' THEN data.modified_by 
        ELSE target.approved_by 
    END
FROM (
    VALUES
        -- (member_id, rc_no, status, total_disbursement_amount, is_disbursement_account, remarks, modified_by)
        (1001, 123456, 'APPROVED', 510.00, true, 'Approved for disbursement', 1),
        (2001, 789012, 'APPROVED', 340.00, true, 'Approved for disbursement', 1),
        (3001, 345678, 'REJECTED', 0.00, false, 'Documents incomplete', 1)
        -- Add more records as needed
) AS data(member_id, rc_no, status, total_disbursement_amount, is_disbursement_account, remarks, modified_by)
WHERE 
    target.member_id = data.member_id 
    AND target.rc_no = data.rc_no;
```

### SQL Query - Method 2: Using UNNEST (PostgreSQL specific)

```sql
-- Bulk update using UNNEST function
-- This is more flexible for dynamic arrays

UPDATE t_apl_wip_data AS target
SET 
    status = data.status,
    total_disbursement_amount = data.total_disbursement_amount,
    is_disbursement_account = data.is_disbursement_account,
    remarks = data.remarks,
    modified_at = CURRENT_TIMESTAMP,
    modified_by = data.modified_by
FROM (
    SELECT 
        UNNEST(ARRAY[1001, 2001, 3001]::BIGINT[]) AS member_id,
        UNNEST(ARRAY[123456, 789012, 345678]::BIGINT[]) AS rc_no,
        UNNEST(ARRAY['APPROVED', 'APPROVED', 'REJECTED']::VARCHAR[]) AS status,
        UNNEST(ARRAY[510.00, 340.00, 0.00]::DECIMAL[]) AS total_disbursement_amount,
        UNNEST(ARRAY[true, true, false]::BOOLEAN[]) AS is_disbursement_account,
        UNNEST(ARRAY['Approved', 'Approved', 'Rejected']::TEXT[]) AS remarks,
        UNNEST(ARRAY[1, 1, 1]::INTEGER[]) AS modified_by
) AS data
WHERE 
    target.member_id = data.member_id 
    AND target.rc_no = data.rc_no;
```

### SQL Query - Method 3: Using Temporary Table (Most efficient for large batches)

```sql
-- Step 1: Create temporary table with update data
CREATE TEMP TABLE temp_wip_updates (
    member_id BIGINT NOT NULL,
    rc_no BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_disbursement_amount DECIMAL(15,2) DEFAULT 0.00,
    is_disbursement_account BOOLEAN DEFAULT false,
    remarks TEXT,
    modified_by INTEGER NOT NULL
);

-- Step 2: Insert bulk data into temporary table
INSERT INTO temp_wip_updates (member_id, rc_no, status, total_disbursement_amount, is_disbursement_account, remarks, modified_by)
VALUES
    (1001, 123456, 'APPROVED', 510.00, true, 'Approved for disbursement', 1),
    (2001, 789012, 'APPROVED', 340.00, true, 'Approved for disbursement', 1),
    (3001, 345678, 'REJECTED', 0.00, false, 'Documents incomplete', 1),
    (1002, 123456, 'SCRUTINY_PENDING', 510.00, false, 'Under review', 1);
    -- Add as many records as needed

-- Step 3: Perform bulk update
UPDATE t_apl_wip_data AS target
SET 
    status = temp.status,
    total_disbursement_amount = temp.total_disbursement_amount,
    is_disbursement_account = temp.is_disbursement_account,
    remarks = temp.remarks,
    modified_at = CURRENT_TIMESTAMP,
    modified_by = temp.modified_by,
    approved_at = CASE 
        WHEN temp.status = 'APPROVED' THEN CURRENT_TIMESTAMP 
        ELSE target.approved_at 
    END,
    approved_by = CASE 
        WHEN temp.status = 'APPROVED' THEN temp.modified_by 
        ELSE target.approved_by 
    END
FROM temp_wip_updates AS temp
WHERE 
    target.member_id = temp.member_id 
    AND target.rc_no = temp.rc_no;

-- Step 4: Drop temporary table
DROP TABLE temp_wip_updates;
```

### Usage Examples

#### Example 1: Update status to APPROVED with transaction
```sql
BEGIN;

UPDATE t_apl_wip_data AS target
SET 
    status = 'APPROVED',
    approved_at = CURRENT_TIMESTAMP,
    approved_by = 1,
    modified_at = CURRENT_TIMESTAMP,
    modified_by = 1,
    remarks = 'Batch approval on 2026-04-17'
FROM (
    VALUES
        (1001, 123456),
        (2001, 789012),
        (3001, 345678)
) AS data(member_id, rc_no)
WHERE 
    target.member_id = data.member_id 
    AND target.rc_no = data.rc_no
    AND target.status = 'SCRUTINY_PENDING';

COMMIT;
```

#### Example 2: Update multiple fields for specific records
```sql
UPDATE t_apl_wip_data AS target
SET 
    status = data.new_status,
    total_disbursement_amount = data.new_amount,
    is_disbursement_account = data.is_disbursement,
    modified_at = CURRENT_TIMESTAMP,
    modified_by = 1
FROM (
    VALUES
        (1001, 123456, 'APPROVED', 510.00, true),
        (1002, 123456, 'APPROVED', 510.00, false),
        (2001, 789012, 'REJECTED', 0.00, false)
) AS data(member_id, rc_no, new_status, new_amount, is_disbursement)
WHERE 
    target.member_id = data.member_id 
    AND target.rc_no = data.rc_no;
```

#### Example 3: Conditional bulk update with remarks
```sql
UPDATE t_apl_wip_data AS target
SET 
    status = CASE 
        WHEN data.approval_flag = true THEN 'APPROVED'
        ELSE 'REJECTED'
    END,
    remarks = data.remarks,
    modified_at = CURRENT_TIMESTAMP,
    modified_by = data.user_id,
    approved_at = CASE 
        WHEN data.approval_flag = true THEN CURRENT_TIMESTAMP 
        ELSE NULL 
    END,
    approved_by = CASE 
        WHEN data.approval_flag = true THEN data.user_id 
        ELSE NULL 
    END
FROM (
    VALUES
        (1001, 123456, true, 'All documents verified', 1),
        (2001, 789012, true, 'Eligible for benefits', 1),
        (3001, 345678, false, 'Invalid Aadhaar', 1)
) AS data(member_id, rc_no, approval_flag, remarks, user_id)
WHERE 
    target.member_id = data.member_id 
    AND target.rc_no = data.rc_no;
```

### Performance Considerations

1. **For small batches (< 100 records)**: Use Method 1 (UPDATE FROM with VALUES)
2. **For medium batches (100-1000 records)**: Use Method 2 (UNNEST) or Method 1
3. **For large batches (> 1000 records)**: Use Method 3 (Temporary Table)

### Index Usage
Both queries will efficiently use the following indexes:
- `idx_apl_wip_rc_no` on t_apl_wip_data(rc_no)
- `idx_apl_dist_code` on t_apl_data(dist_code)
- `idx_apl_dfso_code` on t_apl_data(dfso_code)
- `idx_apl_afso_code` on t_apl_data(afso_code)
- `idx_apl_fps_code` on t_apl_data(fps_code)

### Transaction Safety
Always wrap bulk updates in a transaction:
```sql
BEGIN;
-- Your bulk update query here
COMMIT;
-- Or ROLLBACK; if there's an error
```

### Verification Query
After bulk update, verify the changes:
```sql
SELECT 
    member_id,
    rc_no,
    status,
    total_disbursement_amount,
    is_disbursement_account,
    modified_at,
    remarks
FROM t_apl_wip_data
WHERE member_id IN (1001, 2001, 3001) 
  AND rc_no IN (123456, 789012, 345678)
ORDER BY modified_at DESC;
```

---

## Summary

### Query 1 Features:
- ✅ Multiple filter support (dist_code, dfso_code, afso_code, fps_code)
- ✅ Pagination with LIMIT and OFFSET
- ✅ Ordered by creation date
- ✅ Only active records
- ✅ Includes count query for pagination metadata

### Query 2 Features:
- ✅ Bulk update capability
- ✅ Updates based on member_id and rc_no
- ✅ Three different methods for different use cases
- ✅ Transaction support
- ✅ Conditional updates
- ✅ Auto-updates modified_at timestamp
- ✅ Handles approval workflow fields

Both queries are production-ready and optimized with proper indexing.
