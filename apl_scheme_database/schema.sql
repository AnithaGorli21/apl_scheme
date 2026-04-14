-- ============================================================
-- APL Scheme Database Schema - PostgreSQL
-- ============================================================
-- Database: apl_scheme
-- Description: Database for APL (Antyodaya Parivar Yojana) Scheme Management
-- Created: 2026-04-14
-- ============================================================

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS t_apl_wip_data CASCADE;
DROP TABLE IF EXISTS t_apl_data CASCADE;
DROP TABLE IF EXISTS t_user CASCADE;
DROP TABLE IF EXISTS m_fps CASCADE;
DROP TABLE IF EXISTS m_afso CASCADE;
DROP TABLE IF EXISTS m_dfso CASCADE;
DROP TABLE IF EXISTS m_month CASCADE;
DROP TABLE IF EXISTS m_financial_year CASCADE;

-- ============================================================
-- MASTER TABLE: m_financial_year
-- Description: Financial year master data
-- ============================================================
CREATE TABLE m_financial_year (
    id SERIAL PRIMARY KEY,
    financial_year VARCHAR(20) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by INTEGER NOT NULL,
    modified_at TIMESTAMP,
    modified_by INTEGER,
    CONSTRAINT chk_financial_year_dates CHECK (end_date > start_date)
);

-- Create indexes for better performance
CREATE INDEX idx_financial_year_active ON m_financial_year(is_active);
CREATE INDEX idx_financial_year_year ON m_financial_year(financial_year);

-- ============================================================
-- MASTER TABLE: m_month
-- Description: Month master data
-- ============================================================
CREATE TABLE m_month (
    id SERIAL PRIMARY KEY,
    month_number INTEGER NOT NULL UNIQUE CHECK (month_number BETWEEN 1 AND 12),
    month_name VARCHAR(20) NOT NULL,
    month_name_short VARCHAR(3) NOT NULL,
    quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by INTEGER NOT NULL,
    modified_at TIMESTAMP,
    modified_by INTEGER
);

-- Create indexes for better performance
CREATE INDEX idx_month_active ON m_month(is_active);
CREATE INDEX idx_month_number ON m_month(month_number);
CREATE INDEX idx_month_quarter ON m_month(quarter);

-- ============================================================
-- MASTER TABLE: m_dfso
-- Description: DFSO (District Food & Supplies Officer) master data
-- ============================================================
CREATE TABLE m_dfso (
    id SERIAL PRIMARY KEY,
    dfso_code INTEGER NOT NULL UNIQUE,
    description_en VARCHAR(255) NOT NULL,
    description_ll VARCHAR(255),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by INTEGER NOT NULL,
    modified_at TIMESTAMP,
    modified_by INTEGER
);

-- Create indexes for better performance
CREATE INDEX idx_dfso_code ON m_dfso(dfso_code);
CREATE INDEX idx_dfso_active ON m_dfso(is_active);

-- ============================================================
-- MASTER TABLE: m_afso
-- Description: AFSO (Assistant Food & Supplies Officer) master data
-- ============================================================
CREATE TABLE m_afso (
    id SERIAL PRIMARY KEY,
    dfso_code INTEGER NOT NULL,
    afso_code INTEGER NOT NULL UNIQUE,
    description_en VARCHAR(255) NOT NULL,
    description_ll VARCHAR(255),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by INTEGER NOT NULL,
    modified_at TIMESTAMP,
    modified_by INTEGER,
    CONSTRAINT fk_afso_dfso FOREIGN KEY (dfso_code) REFERENCES m_dfso(dfso_code)
);

-- Create indexes for better performance
CREATE INDEX idx_afso_code ON m_afso(afso_code);
CREATE INDEX idx_afso_dfso_code ON m_afso(dfso_code);
CREATE INDEX idx_afso_active ON m_afso(is_active);

-- ============================================================
-- MASTER TABLE: m_fps
-- Description: FPS (Fair Price Shop) master data
-- ============================================================
CREATE TABLE m_fps (
    id SERIAL PRIMARY KEY,
    fps_code BIGINT NOT NULL UNIQUE,
    afso_code INTEGER NOT NULL,
    description_en VARCHAR(255) NOT NULL,
    description_ll VARCHAR(255),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by INTEGER NOT NULL,
    modified_at TIMESTAMP,
    modified_by INTEGER,
    CONSTRAINT fk_fps_afso FOREIGN KEY (afso_code) REFERENCES m_afso(afso_code)
);

-- Create indexes for better performance
CREATE INDEX idx_fps_code ON m_fps(fps_code);
CREATE INDEX idx_fps_afso_code ON m_fps(afso_code);
CREATE INDEX idx_fps_active ON m_fps(is_active);

-- ============================================================
-- TRANSACTION TABLE: t_user
-- Description: User management table for authentication and authorization
-- ============================================================
CREATE TABLE t_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by INTEGER NOT NULL,
    modified_at TIMESTAMP,
    modified_by INTEGER,
    last_login TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_user_username ON t_user(username);
CREATE INDEX idx_user_role ON t_user(role);
CREATE INDEX idx_user_active ON t_user(is_active);

-- ============================================================
-- TRANSACTION TABLE: t_apl_data
-- Description: APL (Antyodaya Parivar Yojana) beneficiary data
-- ============================================================
CREATE TABLE t_apl_data (
    id SERIAL PRIMARY KEY,
    sno INTEGER NOT NULL,
    dist_code INTEGER NOT NULL,
    dist_name VARCHAR(255) NOT NULL,
    dfso_code INTEGER NOT NULL,
    dfso_name VARCHAR(255) NOT NULL,
    afso_code INTEGER NOT NULL,
    afso_name VARCHAR(255) NOT NULL,
    fps_code BIGINT NOT NULL,
    fps_name VARCHAR(255) NOT NULL,
    ct_card_desk VARCHAR(50),
    rc_no BIGINT NOT NULL,
    hof_name VARCHAR(255) NOT NULL,
    member_id BIGINT NOT NULL,
    member_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10),
    relation_name VARCHAR(100),
    member_dob DATE,
    uid VARCHAR(100),
    demo_auth VARCHAR(50),
    ekyc VARCHAR(50),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by INTEGER NOT NULL,
    modified_at TIMESTAMP,
    modified_by INTEGER,
    CONSTRAINT fk_apl_dfso FOREIGN KEY (dfso_code) REFERENCES m_dfso(dfso_code),
    CONSTRAINT fk_apl_afso FOREIGN KEY (afso_code) REFERENCES m_afso(afso_code)
    -- CONSTRAINT fk_apl_fps FOREIGN KEY (fps_code) REFERENCES m_fps(fps_code)
);

-- Create indexes for better performance
CREATE INDEX idx_apl_sno ON t_apl_data(sno);
CREATE INDEX idx_apl_dist_code ON t_apl_data(dist_code);
CREATE INDEX idx_apl_dfso_code ON t_apl_data(dfso_code);
CREATE INDEX idx_apl_afso_code ON t_apl_data(afso_code);
CREATE INDEX idx_apl_fps_code ON t_apl_data(fps_code);
CREATE INDEX idx_apl_rc_no ON t_apl_data(rc_no);
CREATE INDEX idx_apl_member_id ON t_apl_data(member_id);
CREATE INDEX idx_apl_uid ON t_apl_data(uid);
CREATE INDEX idx_apl_active ON t_apl_data(is_active);

-- ============================================================
-- TRANSACTION TABLE: t_apl_wip_data
-- Description: APL Work In Progress data for approval workflow
-- ============================================================
CREATE TABLE t_apl_wip_data (
    id SERIAL PRIMARY KEY,
    sno INTEGER NOT NULL,
    dist_code INTEGER NOT NULL,
    dist_name VARCHAR(255) NOT NULL,
    dfso_code INTEGER NOT NULL,
    dfso_name VARCHAR(255) NOT NULL,
    afso_code INTEGER NOT NULL,
    afso_name VARCHAR(255) NOT NULL,
    fps_code BIGINT NOT NULL,
    fps_name VARCHAR(255) NOT NULL,
    ct_card_desk VARCHAR(50),
    rc_no BIGINT NOT NULL,
    hof_name VARCHAR(255) NOT NULL,
    member_id BIGINT NOT NULL,
    member_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10),
    relation_name VARCHAR(100),
    member_dob DATE,
    uid VARCHAR(100),
    demo_auth VARCHAR(50),
    ekyc VARCHAR(50),
    -- Additional WIP-specific columns
    total_disbursement_amount DECIMAL(15,2) DEFAULT 0.00,
    is_disbursement_account BOOLEAN DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    -- Common columns
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by INTEGER NOT NULL,
    modified_at TIMESTAMP,
    modified_by INTEGER,
    approved_at TIMESTAMP,
    approved_by INTEGER,
    remarks TEXT,
    CONSTRAINT fk_apl_wip_dfso FOREIGN KEY (dfso_code) REFERENCES m_dfso(dfso_code),
    CONSTRAINT fk_apl_wip_afso FOREIGN KEY (afso_code) REFERENCES m_afso(afso_code),
    -- CONSTRAINT fk_apl_wip_fps FOREIGN KEY (fps_code) REFERENCES m_fps(fps_code),
    CONSTRAINT chk_wip_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'))
);

-- Create indexes for better performance
CREATE INDEX idx_apl_wip_sno ON t_apl_wip_data(sno);
CREATE INDEX idx_apl_wip_status ON t_apl_wip_data(status);
CREATE INDEX idx_apl_wip_dfso_code ON t_apl_wip_data(dfso_code);
CREATE INDEX idx_apl_wip_afso_code ON t_apl_wip_data(afso_code);
CREATE INDEX idx_apl_wip_fps_code ON t_apl_wip_data(fps_code);
CREATE INDEX idx_apl_wip_rc_no ON t_apl_wip_data(rc_no);
CREATE INDEX idx_apl_wip_created_by ON t_apl_wip_data(created_by);
CREATE INDEX idx_apl_wip_active ON t_apl_wip_data(is_active);

-- ============================================================
-- VIEWS FOR BETTER DATA ACCESS
-- ============================================================

-- View for APL Data with complete hierarchy
CREATE OR REPLACE VIEW v_apl_data_complete AS
SELECT 
    a.id,
    a.sno,
    a.dist_code,
    a.dist_name,
    d.dfso_code,
    d.description_en as dfso_name,
    af.afso_code,
    af.description_en as afso_name,
    f.fps_code,
    f.description_en as fps_name,
    a.ct_card_desk,
    a.rc_no,
    a.hof_name,
    a.member_id,
    a.member_name,
    a.gender,
    a.relation_name,
    a.member_dob,
    a.uid,
    a.demo_auth,
    a.ekyc,
    a.is_active,
    a.created_at,
    a.modified_at
FROM t_apl_data a
LEFT JOIN m_dfso d ON a.dfso_code = d.dfso_code
LEFT JOIN m_afso af ON a.afso_code = af.afso_code
LEFT JOIN m_fps f ON a.fps_code = f.fps_code;

-- ============================================================
-- COMMENTS ON TABLES AND COLUMNS
-- ============================================================

COMMENT ON TABLE m_financial_year IS 'Master table for financial years';
COMMENT ON TABLE m_month IS 'Master table for months with quarter information';
COMMENT ON TABLE m_dfso IS 'Master table for District Food & Supplies Officers';
COMMENT ON TABLE m_afso IS 'Master table for Assistant Food & Supplies Officers';
COMMENT ON TABLE m_fps IS 'Master table for Fair Price Shops';
COMMENT ON TABLE t_user IS 'User management for authentication and authorization';
COMMENT ON TABLE t_apl_data IS 'APL beneficiary master data';
COMMENT ON TABLE t_apl_wip_data IS 'APL work-in-progress data for approval workflow';

-- ============================================================
-- END OF SCHEMA
-- ============================================================
