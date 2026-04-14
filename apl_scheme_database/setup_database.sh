#!/bin/bash

# ============================================================
# APL Scheme Database Setup Script
# ============================================================
# This script sets up the PostgreSQL database for APL Scheme
# ============================================================

# Configuration
DB_NAME="apl_scheme"
DB_USER="apl_user"
DB_PASSWORD="apl_password"
DB_HOST="localhost"
DB_PORT="5432"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Check if PostgreSQL is installed
check_postgres() {
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed or not in PATH"
        echo "Please install PostgreSQL first:"
        echo "  macOS: brew install postgresql"
        echo "  Ubuntu: sudo apt-get install postgresql"
        exit 1
    fi
    print_success "PostgreSQL is installed"
}

# Create database
create_database() {
    print_info "Creating database: $DB_NAME"
    
    # Check if database exists
    DB_EXISTS=$(psql -U postgres -h $DB_HOST -p $DB_PORT -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
    
    if [ "$DB_EXISTS" = "1" ]; then
        print_info "Database '$DB_NAME' already exists"
        read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            psql -U postgres -h $DB_HOST -p $DB_PORT -c "DROP DATABASE IF EXISTS $DB_NAME;"
            print_success "Dropped existing database"
        else
            print_info "Keeping existing database"
            return
        fi
    fi
    
    # Create database
    psql -U postgres -h $DB_HOST -p $DB_PORT -c "CREATE DATABASE $DB_NAME;"
    if [ $? -eq 0 ]; then
        print_success "Database '$DB_NAME' created successfully"
    else
        print_error "Failed to create database"
        exit 1
    fi
}

# Create database user
create_user() {
    print_info "Creating database user: $DB_USER"
    
    # Check if user exists
    USER_EXISTS=$(psql -U postgres -h $DB_HOST -p $DB_PORT -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")
    
    if [ "$USER_EXISTS" = "1" ]; then
        print_info "User '$DB_USER' already exists"
    else
        psql -U postgres -h $DB_HOST -p $DB_PORT -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
        print_success "User '$DB_USER' created"
    fi
    
    # Grant privileges
    psql -U postgres -h $DB_HOST -p $DB_PORT -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    print_success "Granted privileges to user"
}

# Run schema file
run_schema() {
    print_info "Creating database schema..."
    
    if [ ! -f "schema.sql" ]; then
        print_error "schema.sql file not found"
        exit 1
    fi
    
    psql -U postgres -h $DB_HOST -p $DB_PORT -d $DB_NAME -f schema.sql
    if [ $? -eq 0 ]; then
        print_success "Schema created successfully"
    else
        print_error "Failed to create schema"
        exit 1
    fi
}

# Load sample data
load_data() {
    print_info "Loading sample data..."
    
    if [ ! -f "sample_data.sql" ]; then
        print_error "sample_data.sql file not found"
        print_info "Run 'python generate_data.py' first to generate sample data"
        exit 1
    fi
    
    psql -U postgres -h $DB_HOST -p $DB_PORT -d $DB_NAME -f sample_data.sql
    if [ $? -eq 0 ]; then
        print_success "Sample data loaded successfully"
    else
        print_error "Failed to load sample data"
        exit 1
    fi
}

# Verify installation
verify_installation() {
    print_info "Verifying installation..."
    
    echo ""
    echo "Table counts:"
    psql -U postgres -h $DB_HOST -p $DB_PORT -d $DB_NAME -c "
        SELECT 
            schemaname,
            tablename,
            (xpath('/row/count/text()', xml_count))[1]::text::int as row_count
        FROM (
            SELECT 
                schemaname,
                tablename,
                query_to_xml(format('SELECT COUNT(*) AS count FROM %I.%I', schemaname, tablename), false, true, '') as xml_count
            FROM pg_tables
            WHERE schemaname = 'public'
        ) t
        ORDER BY tablename;
    "
    
    print_success "Database setup completed successfully!"
    echo ""
    echo "Connection Details:"
    echo "  Database: $DB_NAME"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  User: $DB_USER"
    echo "  Password: $DB_PASSWORD"
    echo ""
    echo "Connection String:"
    echo "  postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
}

# Main execution
main() {
    echo "============================================================"
    echo "APL Scheme Database Setup"
    echo "============================================================"
    echo ""
    
    check_postgres
    create_database
    create_user
    run_schema
    load_data
    verify_installation
    
    echo ""
    echo "============================================================"
    echo "Setup Complete!"
    echo "============================================================"
}

# Run main function
main
