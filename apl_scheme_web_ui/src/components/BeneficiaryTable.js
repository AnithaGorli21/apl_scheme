import React, { useState, useEffect } from 'react';

/**
 * Reusable Beneficiary Table Component
 * Used for both New Scrutiny and Old Scrutiny Records
 * 
 * @param {Array} beneficiaries - Array of family beneficiary data
 * @param {Object} searchParams - Search parameters used to fetch data
 * @param {Function} onSelectionChange - Callback when selection changes (for final submit)
 * @param {string} tabType - Type of tab ('new' or 'old')
 */
const BeneficiaryTable = ({ 
  beneficiaries, 
  searchParams, 
  onSelectionChange,
  tabType = 'new'
}) => {
  const [selectedFamilies, setSelectedFamilies] = useState(new Set());
  const [selectedDisbursements, setSelectedDisbursements] = useState({});
  const [validationErrors, setValidationErrors] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  // Reset to page 1 when beneficiaries or rowsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [beneficiaries, rowsPerPage]);

  // Auto-select radio buttons based on business logic
  useEffect(() => {
    const autoSelections = {};
    beneficiaries.forEach((family) => {
      const hofMember = family.members.find(m => m.is_hof);
      
      // Auto-select if HOF has bank account
      if (hofMember && hofMember.bank_account === 'Yes') {
        autoSelections[family.rc_no] = {
          memberId: hofMember.member_id,
          locked: true // Disable other radio buttons
        };
      }
    });
    setSelectedDisbursements(autoSelections);
  }, [beneficiaries]);

  // Notify parent component of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedData = buildPayload();
      onSelectionChange(selectedData, tabType);
    }
  }, [selectedFamilies, selectedDisbursements]);

  // Pagination calculations
  const totalPages = Math.ceil(beneficiaries.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedFamilies = beneficiaries.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Calculate total benefit amount for a family
  const calculateBenefitAmount = (members) => {
    return members.length * 170;
  };

  // Handle Select All for current page
  const handleSelectAll = () => {
    const newSelected = new Set(selectedFamilies);
    
    if (selectAllChecked) {
      // Deselect all families on current page
      paginatedFamilies.forEach(family => {
        newSelected.delete(family.rc_no);
      });
      setSelectAllChecked(false);
    } else {
      // Select all families on current page
      paginatedFamilies.forEach(family => {
        newSelected.add(family.rc_no);
      });
      setSelectAllChecked(true);
    }
    
    setSelectedFamilies(newSelected);
    
    // Clear validation errors for selected families
    const newErrors = new Set(validationErrors);
    paginatedFamilies.forEach(family => {
      newErrors.delete(family.rc_no);
    });
    setValidationErrors(newErrors);
  };

  // Update Select All checkbox state when page changes or selections change
  useEffect(() => {
    const allPageFamiliesSelected = paginatedFamilies.length > 0 && 
      paginatedFamilies.every(family => selectedFamilies.has(family.rc_no));
    setSelectAllChecked(allPageFamiliesSelected);
  }, [currentPage, selectedFamilies, paginatedFamilies]);

  // Handle family checkbox toggle
  const handleFamilySelect = (rcNo) => {
    const newSelected = new Set(selectedFamilies);
    if (newSelected.has(rcNo)) {
      newSelected.delete(rcNo);
    } else {
      newSelected.add(rcNo);
    }
    setSelectedFamilies(newSelected);
    
    // Clear validation error for this family
    const newErrors = new Set(validationErrors);
    newErrors.delete(rcNo);
    setValidationErrors(newErrors);
  };

  // Handle radio button selection with unselect capability
  const handleDisbursementSelect = (rcNo, memberId) => {
    // Check if radio buttons are locked for this family
    if (selectedDisbursements[rcNo]?.locked) {
      return;
    }

    // Check if the same radio button is clicked again - unselect it
    if (selectedDisbursements[rcNo]?.memberId === memberId) {
      const newSelections = { ...selectedDisbursements };
      delete newSelections[rcNo];
      setSelectedDisbursements(newSelections);
    } else {
      // Select the new radio button
      setSelectedDisbursements({
        ...selectedDisbursements,
        [rcNo]: { memberId, locked: false }
      });
    }

    // Clear validation error for this family
    const newErrors = new Set(validationErrors);
    newErrors.delete(rcNo);
    setValidationErrors(newErrors);
  };

  // Build payload for selected families
  const buildPayload = () => {
    const payload = [];

    selectedFamilies.forEach((rcNo) => {
      const family = beneficiaries.find(f => f.rc_no === rcNo);
      const selectedMemberId = selectedDisbursements[rcNo]?.memberId;
      const selectedMember = family?.members.find(m => m.member_id === selectedMemberId);

      if (family && selectedMember) {
        const totalBenefitAmount = calculateBenefitAmount(family.members);

        payload.push({
          rc_no: parseInt(family.rc_no),
          hof_name: family.hof_name || "string",
          member_id: parseInt(selectedMember.member_id),
          dist_code: family.dist_code,
          dfso_code: family.dfso_code,
          afso_code: family.afso_code,
          fps_code: family.fps_code,
          fps_name: family.fps_name || "string",
          total_benefit_amount: totalBenefitAmount,
          is_disbursement_account: true,
          wf_status: "SCRUTINY_PENDING"
        });
      }
    });

    return payload;
  };

  // Validate selections
  const validateSelection = () => {
    const errors = new Set();

    // Check if at least one family is selected
    if (selectedFamilies.size === 0) {
      return { valid: false, message: 'Please select at least one family' };
    }

    // Check if each selected family has a disbursement member selected
    selectedFamilies.forEach((rcNo) => {
      if (!selectedDisbursements[rcNo] || !selectedDisbursements[rcNo].memberId) {
        errors.add(rcNo);
      }
    });

    if (errors.size > 0) {
      setValidationErrors(errors);
      return { 
        valid: false, 
        message: `Please select a disbursement member for ${errors.size} family(families) highlighted in red` 
      };
    }

    return { valid: true };
  };

  // Get validation result (exposed for parent component)
  const getValidationResult = () => {
    return validateSelection();
  };

  // Get selected data (exposed for parent component)
  const getSelectedData = () => {
    const validation = validateSelection();
    if (!validation.valid) {
      return { valid: false, message: validation.message, data: [] };
    }
    return { valid: true, data: buildPayload() };
  };

  // Expose methods to parent via ref or callback
  React.useImperativeHandle(React.useRef(), () => ({
    getSelectedData,
    getValidationResult
  }));

  if (beneficiaries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 text-lg">No records found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">List of Beneficiaries</h2>
        <p className="text-sm text-gray-600 mt-1">
          Total Families: {beneficiaries.length} | 
          Selected: {selectedFamilies.size}
        </p>
      </div>

      {/* Fixed header with scrollable body */}
      <div className="overflow-x-auto" style={{ maxHeight: '600px' }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">S.No.</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">District Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">DFSO Office</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">AFSO Office</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">FPS Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">RC Type</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">RC Number</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">HOF Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Member Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Member ID</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Gender</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Relationship with HOF</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Date of Birth</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Age</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Aadhaar No.</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Demographic Authentication Completed</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">EKYC Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Aadhaar Linked Bank account available?</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Select Account for Disbursement</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Benefit Amount</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectAllChecked}
                    onChange={handleSelectAll}
                    className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                  />
                  <span>Select</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedFamilies.map((family, familyIndex) => {
              const isSelected = selectedFamilies.has(family.rc_no);
              const hasValidationError = validationErrors.has(family.rc_no);
              const totalBenefit = calculateBenefitAmount(family.members);
              const isLocked = selectedDisbursements[family.rc_no]?.locked;

              return family.members.map((member, memberIndex) => {
                const isFirstMember = memberIndex === 0;
                const rowBgColor = hasValidationError && isSelected 
                  ? 'bg-red-50' 
                  : isSelected 
                  ? 'bg-blue-50' 
                  : 'bg-white hover:bg-gray-50';

                return (
                  <tr key={`${family.rc_no}-${member.member_id}`} className={rowBgColor}>
                    {/* S.No. - Adjust for pagination */}
                    <td className="px-4 py-3">
                      {isFirstMember ? startIndex + familyIndex + 1 : ''}
                    </td>

                    {/* District Name - Merged for family */}
                    <td className="px-4 py-3">
                      {isFirstMember ? family.dist_name : ''}
                    </td>

                    {/* DFSO Office - Merged */}
                    <td className="px-4 py-3">
                      {isFirstMember ? family.dfso_name : ''}
                    </td>

                    {/* AFSO Office - Merged */}
                    <td className="px-4 py-3">
                      {isFirstMember ? family.afso_name : ''}
                    </td>

                    {/* FPS Name - Merged */}
                    <td className="px-4 py-3">
                      {isFirstMember ? family.fps_name : ''}
                    </td>

                    {/* RC Type - Merged */}
                    <td className="px-4 py-3">
                      {isFirstMember ? family.rc_type : ''}
                    </td>

                    {/* RC Number - Merged */}
                    <td className="px-4 py-3 font-semibold">
                      {isFirstMember ? family.rc_no : ''}
                    </td>

                    {/* HOF Name - Merged */}
                    <td className="px-4 py-3">
                      {isFirstMember ? family.hof_name : ''}
                    </td>

                    {/* Member-specific columns */}
                    <td className="px-4 py-3">{member.member_name}</td>
                    <td className="px-4 py-3">{member.member_id}</td>
                    <td className="px-4 py-3">{member.gender}</td>
                    <td className="px-4 py-3">{member.relation}</td>
                    <td className="px-4 py-3">{member.dob}</td>
                    <td className="px-4 py-3">{member.age}</td>
                    <td className="px-4 py-3">{member.aadhaar}</td>
                    <td className="px-4 py-3 text-center">{member.demo_auth}</td>
                    <td className="px-4 py-3 text-center">{member.ekyc}</td>
                    <td className="px-4 py-3 text-center">{member.bank_account}</td>

                    {/* Radio Button for Disbursement - Hide when locked for non-HOF members */}
                    <td className="px-4 py-3 text-center">
                      {isLocked && selectedDisbursements[family.rc_no]?.memberId !== member.member_id ? (
                        // Hide radio button for other members when HOF is locked
                        <span className="text-gray-400">-</span>
                      ) : (
                        <>
                          <input
                            type="radio"
                            name={`disbursement-${tabType}-${family.rc_no}`}
                            checked={selectedDisbursements[family.rc_no]?.memberId === member.member_id}
                            onChange={() => handleDisbursementSelect(family.rc_no, member.member_id)}
                            disabled={isLocked}
                            className={`w-5 h-5 text-blue-600 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          />
                          {isLocked && selectedDisbursements[family.rc_no]?.memberId === member.member_id && (
                            <span className="ml-2 text-xs text-green-600 font-semibold">(Auto)</span>
                          )}
                        </>
                      )}
                    </td>

                    {/* Total Benefit Amount - Only on first row */}
                    <td className="px-4 py-3 font-bold text-green-600">
                      {isFirstMember ? `₹${totalBenefit}` : ''}
                    </td>

                    {/* Select Checkbox - Only on first row, MOVED TO LAST COLUMN */}
                    <td className={`px-4 py-3 ${!isFirstMember && 'border-l-4 border-gray-200'}`}>
                      {isFirstMember && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleFamilySelect(family.rc_no)}
                          className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                        />
                      )}
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left: Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Families per page:</span>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, beneficiaries.length)} of {beneficiaries.length}
          </span>
        </div>

        {/* Right: Page navigation */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : page === '...'
                  ? 'bg-white text-gray-400 cursor-default'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Validation Error Message */}
      {validationErrors.size > 0 && (
        <div className="px-6 pb-4">
          <p className="text-sm text-red-600 font-semibold">
            ⚠️ {validationErrors.size} family(families) missing disbursement selection
          </p>
        </div>
      )}
    </div>
  );
};

export default BeneficiaryTable;
