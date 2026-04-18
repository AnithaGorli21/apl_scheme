# BeneficiaryTable Component Segregation

## Overview
This document outlines the requirements for creating separate BeneficiaryTable components for AFSO (Assistant Food Supply Officer) and DFSO (District Food Supply Officer) roles.

## Source Location
- **Base Component**: `apl_scheme_web_ui/src/components/BeneficiaryTable.js`
- **Target Directory**: `apl_scheme_web_ui/src/components/`

## Requirements

### 1. Component Duplication
- Duplicate the existing `BeneficiaryTable.js` component
- Create two separate components:
  - `BeneficiaryTableAFSO.js` - For AFSO role
  - `BeneficiaryTableDFSO.js` - For DFSO role

### 2. AFSO Component Features
- **Maintain all existing functionality** from the current BeneficiaryTable
- Keep checkbox functionality for individual record selection
- Keep radio button functionality (if applicable)
- Support individual record submission
- Retain all validation and approval workflows

### 3. DFSO Component Modifications
- **Remove checkbox functionality** - Not required for DFSO
- **Remove radio button functionality** - Not required for DFSO
- **Implement bulk submission** - Submit all records in one go
- Simplified UI for viewing and bulk operations
- Single submit button for all records

## Implementation Notes

### Key Differences

| Feature | AFSO Component | DFSO Component |
|---------|----------------|----------------|
| Checkboxes | ✅ Required | ❌ Not Required |
| Radio Buttons | ✅ Required | ❌ Not Required |
| Submission Mode | Individual Records | Bulk Submission |
| Selection UI | Interactive | Read-only/Simplified |

### Recommended Approach
1. Copy `BeneficiaryTable.js` to create both new files
2. For AFSO: Rename and keep all functionality
3. For DFSO: Rename and strip out selection mechanisms
4. Update parent components to use role-specific tables
5. Test both components independently

## Files to Update
- Create: `apl_scheme_web_ui/src/components/BeneficiaryTableAFSO.js`
- Create: `apl_scheme_web_ui/src/components/BeneficiaryTableDFSO.js`
- Update: Parent components that consume BeneficiaryTable (based on user role)

## Testing Checklist
- [ ] AFSO component maintains all original functionality
- [ ] DFSO component removes checkboxes and radio buttons
- [ ] DFSO bulk submission works correctly
- [ ] Both components handle data correctly
- [ ] Role-based routing displays correct component
- [ ] No breaking changes to existing functionality
