# APL Scheme Database - Entity Relationship Structure

## Database Schema Diagram (Text Representation)

```
┌─────────────────────────────┐
│   m_financial_year          │
├─────────────────────────────┤
│ PK id                       │
│    financial_year (UNIQUE)  │
│    start_date               │
│    end_date                 │
│    description              │
│    is_active                │
│    created_at               │
│    created_by               │
│    modified_at              │
│    modified_by              │
└─────────────────────────────┘

┌─────────────────────────────┐
│   m_month                   │
├─────────────────────────────┤
│ PK id                       │
│    month_number (UNIQUE)    │
│    month_name               │
│    month_name_short         │
│    quarter                  │
│    is_active                │
│    created_at               │
│    created_by               │
│    modified_at              │
│    modified_by              │
└─────────────────────────────┘

┌─────────────────────────────┐
│   m_dfso                    │
├─────────────────────────────┤
│ PK id                       │
│ UK dfso_code                │
│    description_en           │
│    description_ll           │
│    is_active                │
│    created_at               │
│    created_by               │
│    modified_at              │
│    modified_by              │
└─────────────────────────────┘
         │
         │ 1
         │
         │ N
         ▼
┌─────────────────────────────┐
│   m_afso                    │
├─────────────────────────────┤
│ PK id                       │
│ FK dfso_code                │
│ UK afso_code                │
│    description_en           │
│    description_ll           │
│    is_active                │
│    created_at               │
│    created_by               │
│    modified_at              │
│    modified_by              │
└─────────────────────────────┘
         │
         │ 1
         │
         │ N
         ▼
┌─────────────────────────────┐
│   m_fps                     │
├─────────────────────────────┤
│ PK id                       │
│ UK fps_code                 │
│ FK afso_code                │
│    description_en           │
│    description_ll           │
│    is_active                │
│    created_at               │
│    created_by               │
│    modified_at              │
│    modified_by              │
└─────────────────────────────┘
         │
         │ 1
         │
         │ N
         ▼
┌─────────────────────────────┐
│   t_apl_data                │
├─────────────────────────────┤
│ PK id                       │
│    sno                      │
│    dist_code                │
│    dist_name                │
│ FK dfso_code                │
│    dfso_name                │
│ FK afso_code                │
│    afso_name                │
│ FK fps_code                 │
│    fps_name                 │
│    ct_card_desk             │
│    rc_no                    │
│    hof_name                 │
│    member_id                │
│    member_name              │
│    gender                   │
│    relation_name            │
│    member_dob               │
│    uid                      │
│    demo_auth                │
│    ekyc                     │
│    is_active                │
│    created_at               │
│    created_by               │
│    modified_at              │
│    modified_by              │
└─────────────────────────────┘

┌─────────────────────────────┐
│   t_apl_wip_data            │
├─────────────────────────────┤
│ PK id                       │
│    sno                      │
│    dist_code                │
│    dist_name                │
│ FK dfso_code                │
│    dfso_name                │
│ FK afso_code                │
│    afso_name                │
│ FK fps_code                 │
│    fps_name                 │
│    ct_card_desk             │
│    rc_no                    │
│    hof_name                 │
│    member_id                │
│    member_name              │
│    gender                   │
│    relation_name            │
│    member_dob               │
│    uid                      │
│    demo_auth                │
│    ekyc                     │
│    total_disbursement_amt   │
│    is_disbursement_account  │
│    status                   │
│    is_active                │
│    created_at               │
│    created_by               │
│    modified_at              │
│    modified_by              │
│    approved_at              │
│    approved_by              │
│    remarks                  │
└─────────────────────────────┘

┌─────────────────────────────┐
│   t_user                    │
├─────────────────────────────┤
│ PK id                       │
│ UK username                 │
│    password                 │
│    role                     │
│    email                    │
│    full_name                │
│    is_active                │
│    created_at               │
│    created_by               │
│    modified_at              │
│    modified_by              │
│    last_login               │
└─────────────────────────────┘
```

## Relationships

### Hierarchical Structure
```
m_dfso (District Food & Supplies Officer)
  └─► 1:N relationship with m_afso
       └─► m_afso (Assistant Food & Supplies Officer)
            └─► 1:N relationship with m_fps
                 └─► m_fps (Fair Price Shop)
                      └─► 1:N relationship with t_apl_data
                           └─► t_apl_data (Beneficiary Data)
```

### Foreign Key Relationships

1. **m_afso.dfso_code → m_dfso.dfso_code**
   - Each AFSO belongs to one DFSO
   - One DFSO can have multiple AFSOs

2. **m_fps.afso_code → m_afso.afso_code**
   - Each FPS belongs to one AFSO
   - One AFSO can have multiple FPS

3. **t_apl_data.dfso_code → m_dfso.dfso_code**
   - Each beneficiary record is associated with one DFSO

4. **t_apl_data.afso_code → m_afso.afso_code**
   - Each beneficiary record is associated with one AFSO

5. **t_apl_data.fps_code → m_fps.fps_code**
   - Each beneficiary record is associated with one FPS

6. **t_apl_wip_data** (Same foreign keys as t_apl_data)
   - WIP records maintain the same hierarchical references

## Key Constraints

### Primary Keys (PK)
- All tables have an auto-incrementing `id` as primary key

### Unique Keys (UK)
- `m_financial_year.financial_year`
- `m_month.month_number`
- `m_dfso.dfso_code`
- `m_afso.afso_code`
- `m_fps.fps_code`
- `t_user.username`

### Check Constraints
- `m_financial_year`: end_date > start_date
- `m_month`: month_number BETWEEN 1 AND 12
- `m_month`: quarter BETWEEN 1 AND 4
- `t_apl_wip_data`: status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')

## Indexes

### Performance Indexes

**m_financial_year:**
- idx_financial_year_active (is_active)
- idx_financial_year_year (financial_year)

**m_month:**
- idx_month_active (is_active)
- idx_month_number (month_number)
- idx_month_quarter (quarter)

**m_dfso:**
- idx_dfso_code (dfso_code)
- idx_dfso_active (is_active)

**m_afso:**
- idx_afso_code (afso_code)
- idx_afso_dfso_code (dfso_code)
- idx_afso_active (is_active)

**m_fps:**
- idx_fps_code (fps_code)
- idx_fps_afso_code (afso_code)
- idx_fps_active (is_active)

**t_user:**
- idx_user_username (username)
- idx_user_role (role)
- idx_user_active (is_active)

**t_apl_data:**
- idx_apl_sno (sno)
- idx_apl_dist_code (dist_code)
- idx_apl_dfso_code (dfso_code)
- idx_apl_afso_code (afso_code)
- idx_apl_fps_code (fps_code)
- idx_apl_rc_no (rc_no)
- idx_apl_member_id (member_id)
- idx_apl_uid (uid)
- idx_apl_active (is_active)

**t_apl_wip_data:**
- idx_apl_wip_sno (sno)
- idx_apl_wip_status (status)
- idx_apl_wip_dfso_code (dfso_code)
- idx_apl_wip_afso_code (afso_code)
- idx_apl_wip_fps_code (fps_code)
- idx_apl_wip_rc_no (rc_no)
- idx_apl_wip_created_by (created_by)
- idx_apl_wip_active (is_active)

## Views

### v_apl_data_complete
Combines beneficiary data with the complete organizational hierarchy:
```sql
SELECT 
    a.id, a.sno, a.dist_code, a.dist_name,
    d.dfso_code, d.description_en as dfso_name,
    af.afso_code, af.description_en as afso_name,
    f.fps_code, f.description_en as fps_name,
    a.ct_card_desk, a.rc_no, a.hof_name,
    a.member_id, a.member_name, a.gender,
    a.relation_name, a.member_dob, a.uid,
    a.demo_auth, a.ekyc,
    a.is_active, a.created_at, a.modified_at
FROM t_apl_data a
LEFT JOIN m_dfso d ON a.dfso_code = d.dfso_code
LEFT JOIN m_afso af ON a.afso_code = af.afso_code
LEFT JOIN m_fps f ON a.fps_code = f.fps_code;
```

## Data Flow

### Beneficiary Approval Workflow

```
┌─────────────────┐
│  User Submits   │
│  New Data       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ t_apl_wip_data  │
│ status=PENDING  │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Review │
    └───┬────┘
        │
    ┌───┴────┐
    │        │
    ▼        ▼
APPROVED  REJECTED
    │
    ▼
┌─────────────────┐
│  t_apl_data     │
│ (Master Data)   │
└─────────────────┘
```

## Common Columns Pattern

All tables follow a consistent audit trail pattern:

```
is_active     BOOLEAN      Active status flag
created_at    TIMESTAMP    Record creation time
created_by    INTEGER      User who created
modified_at   TIMESTAMP    Last modification time
modified_by   INTEGER      User who modified
```

Additional for WIP table:
```
approved_at   TIMESTAMP    Approval time
approved_by   INTEGER      Approver user
remarks       TEXT         Workflow comments
```

## Table Sizes (Sample Data)

| Table               | Records | Purpose                    |
|---------------------|---------|----------------------------|
| m_financial_year    | 20      | Financial Years 2015-2034  |
| m_month            | 12      | Month Master               |
| m_dfso             | 14      | District Offices           |
| m_afso             | 138     | Area Offices               |
| m_fps              | 200     | Fair Price Shops           |
| t_user             | 5       | System Users               |
| t_apl_data         | 200     | Beneficiary Records        |
| t_apl_wip_data     | 0       | Pending Approvals          |

## Normalization

The database follows **Third Normal Form (3NF)**:

1. **First Normal Form (1NF)**: All attributes contain atomic values
2. **Second Normal Form (2NF)**: No partial dependencies on composite keys
3. **Third Normal Form (3NF)**: No transitive dependencies

Some denormalization exists in `t_apl_data` for performance:
- `dist_name`, `dfso_name`, `afso_name`, `fps_name` are stored along with their codes
- This allows faster queries without joins for display purposes

## Security Considerations

### Row-Level Security (Recommended)
```sql
-- Example: User can only see data from their DFSO
ALTER TABLE t_apl_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY dfso_isolation ON t_apl_data
    FOR ALL
    TO dfso_role
    USING (dfso_code = current_setting('app.user_dfso_code')::integer);
```

### Audit Trail
All modifications are tracked through:
- `created_at`, `created_by`
- `modified_at`, `modified_by`
- For WIP: `approved_at`, `approved_by`

## Performance Tips

1. **Use appropriate indexes** for your query patterns
2. **Partition large tables** (e.g., by year or district) when data grows
3. **Use materialized views** for complex reporting queries
4. **Regular VACUUM and ANALYZE** to maintain statistics
5. **Monitor slow queries** and optimize as needed

## Backup Strategy

### Full Backup
```bash
pg_dump -U apl_user -Fc apl_scheme > backup_$(date +%Y%m%d).dump
```

### Table-specific Backup
```bash
pg_dump -U apl_user -t t_apl_data apl_scheme > apl_data_backup.sql
```

### Point-in-Time Recovery
Enable WAL archiving in postgresql.conf:
```
wal_level = replica
archive_mode = on
archive_command = 'cp %p /path/to/archive/%f'
```

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-04-14  
**Schema Version:** 1.0.0
