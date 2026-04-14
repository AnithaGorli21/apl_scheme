# APL Scheme Database Implementation

## Overview
This is a comprehensive PostgreSQL database implementation for the APL (Antyodaya Parivar Yojana) Scheme Management System. The database handles master data for financial years, months, district/area food supply offices, fair price shops, and transactional data for beneficiary management with an approval workflow.

## Database Structure

### Master Tables

1. **m_financial_year** - Financial year master data
   - Stores financial year information with start/end dates
   - 20 sample records (2015-16 to 2034-35)

2. **m_month** - Month master data
   - Contains month information with quarter mapping
   - 12 records (January to December)

3. **m_dfso** - District Food & Supplies Officer master
   - DFSO office information
   - 14 records from Excel data

4. **m_afso** - Assistant Food & Supplies Officer master
   - AFSO office information linked to DFSO
   - 138 records from Excel data

5. **m_fps** - Fair Price Shop master
   - FPS information linked to AFSO
   - 200 records from Excel data

### Transaction Tables

6. **t_user** - User management
   - Authentication and authorization
   - 5 sample users with different roles (ADMIN, DFSO, AFSO, FPS, VIEWER)

7. **t_apl_data** - APL beneficiary data
   - Main beneficiary information
   - 200 records from Excel data

8. **t_apl_wip_data** - APL Work-In-Progress data
   - Approval workflow for beneficiary updates
   - Additional fields: total_disbursement_amount, is_disbursement_account, status

## Common Columns

All tables include these audit columns:
- `is_active` (BOOLEAN) - Active status flag
- `created_at` (TIMESTAMP) - Record creation timestamp
- `created_by` (INTEGER) - User who created the record
- `modified_at` (TIMESTAMP) - Last modification timestamp
- `modified_by` (INTEGER) - User who last modified the record

## Key Features

### Performance Optimization
- **Indexes** on all frequently queried columns (codes, status, active flags)
- **Foreign Key Constraints** to maintain referential integrity
- **Check Constraints** for data validation
- **View** (v_apl_data_complete) for complex joins

### Data Integrity
- UNIQUE constraints on code fields
- NOT NULL constraints on required fields
- CHECK constraints for status values and date ranges
- Foreign key relationships enforcing hierarchical structure

### Workflow Support
- Status tracking in WIP table (PENDING, APPROVED, REJECTED, CANCELLED)
- Approval timestamps and user tracking
- Remarks field for workflow comments

## File Structure

```
.
├── README.md                 # This file
├── db_design.md             # Original design requirements
├── schema.sql               # Database schema definition
├── sample_data.sql          # Sample data inserts
├── setup_database.sh        # Automated setup script
├── generate_data.py         # Python script to generate sample data
├── analyze_excel.py         # Python script to analyze Excel data
├── ATL.xlsx                 # Source Excel data
└── venv/                    # Python virtual environment
```

## Prerequisites

### Required Software
- PostgreSQL 12 or higher
- Python 3.8 or higher
- pip (Python package manager)

### Optional Tools
- pgAdmin 4 (GUI for PostgreSQL)
- DBeaver (Universal database tool)

## Installation

### Method 1: Automated Setup (Recommended)

1. **Clone/Download the project files**

2. **Run the setup script**
   ```bash
   ./setup_database.sh
   ```

   This script will:
   - Check PostgreSQL installation
   - Create the database
   - Create database user
   - Run schema creation
   - Load sample data
   - Verify installation

### Method 2: Manual Setup

1. **Create Python virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install pandas openpyxl
   ```

2. **Generate sample data**
   ```bash
   python generate_data.py
   ```

3. **Create the database**
   ```bash
   psql -U postgres
   CREATE DATABASE apl_scheme;
   CREATE USER apl_user WITH PASSWORD 'apl_password';
   GRANT ALL PRIVILEGES ON DATABASE apl_scheme TO apl_user;
   \q
   ```

4. **Run schema and data scripts**
   ```bash
   psql -U postgres -d apl_scheme -f schema.sql
   psql -U postgres -d apl_scheme -f sample_data.sql
   ```

## Configuration

### Database Connection Details
- **Database Name:** apl_scheme
- **Host:** localhost
- **Port:** 5432
- **User:** apl_user
- **Password:** apl_password

### Connection String
```
postgresql://apl_user:apl_password@localhost:5432/apl_scheme
```

## Usage Examples

### Connecting to the Database

**Using psql:**
```bash
psql -U apl_user -d apl_scheme -h localhost -p 5432
```

**Using Python (psycopg2):**
```python
import psycopg2

conn = psycopg2.connect(
    dbname="apl_scheme",
    user="apl_user",
    password="apl_password",
    host="localhost",
    port="5432"
)
```

### Sample Queries

**1. Get all active DFSO offices:**
```sql
SELECT dfso_code, description_en, description_ll 
FROM m_dfso 
WHERE is_active = true
ORDER BY dfso_code;
```

**2. Get FPS hierarchy:**
```sql
SELECT 
    d.description_en as dfso_name,
    a.description_en as afso_name,
    f.description_en as fps_name,
    f.fps_code
FROM m_fps f
JOIN m_afso a ON f.afso_code = a.afso_code
JOIN m_dfso d ON a.dfso_code = d.dfso_code
WHERE f.is_active = true
ORDER BY d.dfso_code, a.afso_code, f.fps_code;
```

**3. Get beneficiary count by district:**
```sql
SELECT 
    dist_name,
    COUNT(*) as beneficiary_count
FROM t_apl_data
WHERE is_active = true
GROUP BY dist_name
ORDER BY beneficiary_count DESC;
```

**4. Get pending approvals:**
```sql
SELECT 
    id,
    member_name,
    hof_name,
    status,
    total_disbursement_amount,
    created_at
FROM t_apl_wip_data
WHERE status = 'PENDING'
ORDER BY created_at DESC;
```

**5. Use the complete data view:**
```sql
SELECT * FROM v_apl_data_complete
WHERE dist_code = 501
LIMIT 10;
```

## Sample User Credentials

| Username   | Password   | Role   | Description              |
|------------|------------|--------|--------------------------|
| admin      | admin123   | ADMIN  | System Administrator     |
| dfso_user  | dfso123    | DFSO   | DFSO User               |
| afso_user  | afso123    | AFSO   | AFSO User               |
| fps_user   | fps123     | FPS    | FPS User                |
| viewer     | viewer123  | VIEWER | Read Only User          |

**⚠️ Important:** Change these passwords in production!

## Database Maintenance

### Backup Database
```bash
pg_dump -U apl_user -d apl_scheme -F c -f apl_scheme_backup.dump
```

### Restore Database
```bash
pg_restore -U apl_user -d apl_scheme -F c apl_scheme_backup.dump
```

### Vacuum and Analyze
```sql
VACUUM ANALYZE;
```

## Performance Considerations

### Indexes Created
- All primary key columns
- All foreign key columns
- Frequently queried columns (codes, status, active flags)
- Date columns for time-based queries

### Recommended Settings (postgresql.conf)
```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB
```

## Workflow: Adding New Beneficiary

1. **Insert into WIP table:**
   ```sql
   INSERT INTO t_apl_wip_data (
       sno, dist_code, dist_name, dfso_code, dfso_name,
       afso_code, afso_name, fps_code, fps_name,
       rc_no, hof_name, member_id, member_name,
       status, created_by
   ) VALUES (
       ..., 'PENDING', 1
   );
   ```

2. **Approve record:**
   ```sql
   UPDATE t_apl_wip_data
   SET status = 'APPROVED',
       approved_at = CURRENT_TIMESTAMP,
       approved_by = 1,
       modified_at = CURRENT_TIMESTAMP,
       modified_by = 1
   WHERE id = <wip_id>;
   ```

3. **Move to main table:**
   ```sql
   INSERT INTO t_apl_data (...)
   SELECT ... FROM t_apl_wip_data WHERE id = <wip_id>;
   ```

## Troubleshooting

### Issue: Cannot connect to database
**Solution:** Check if PostgreSQL service is running
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Issue: Permission denied
**Solution:** Grant necessary permissions
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO apl_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO apl_user;
```

### Issue: Foreign key constraint violation
**Solution:** Ensure referenced records exist in parent tables before inserting child records. Follow the order:
1. m_dfso
2. m_afso (references m_dfso)
3. m_fps (references m_afso)
4. t_apl_data (references m_dfso, m_afso, m_fps)
5. t_apl_wip_data (references m_dfso, m_afso, m_fps)

## Security Recommendations

1. **Change default passwords** immediately in production
2. Use **strong passwords** (minimum 12 characters)
3. Implement **password hashing** (bcrypt, scrypt) for user passwords
4. Enable **SSL/TLS** for database connections
5. Implement **row-level security** for multi-tenant scenarios
6. Regular **security audits** and updates
7. Use **prepared statements** to prevent SQL injection
8. Implement **rate limiting** on API endpoints
9. Enable **audit logging** for sensitive operations
10. Regular **backups** with encryption

## Future Enhancements

- [ ] Add triggers for audit logging
- [ ] Implement stored procedures for common operations
- [ ] Add materialized views for reporting
- [ ] Implement partitioning for large tables
- [ ] Add full-text search capabilities
- [ ] Implement soft delete mechanism
- [ ] Add data archival strategy
- [ ] Create database migration scripts
- [ ] Add automated testing suite
- [ ] Implement database replication

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the sample queries
3. Consult PostgreSQL documentation
4. Contact the database administrator

## License

This database implementation is provided as-is for the APL Scheme Management System.

## Version History

- **v1.0.0** (2026-04-14) - Initial implementation
  - Created all master and transaction tables
  - Added indexes and constraints
  - Generated sample data from Excel
  - Created setup automation scripts

---

**Last Updated:** 2026-04-14  
**Database Version:** PostgreSQL 12+  
**Schema Version:** 1.0.0
