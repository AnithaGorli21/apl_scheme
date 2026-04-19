import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import BeneficiaryTableAFSO from '../components/BeneficiaryTableAFSO';
import BeneficiaryTableDFSO from '../components/BeneficiaryTableDFSO';
import TabContainer from '../components/TabContainer';
import BeneficiaryTable from '../components/BeneficiaryTable';
import LoadingModal from '../components/modals/LoadingModal';
import SuccessModal from '../components/modals/SuccessModal';
import ErrorModal from '../components/modals/ErrorModal';
const SchemeSearch = () => {
  const { user, logout } = useAuth();


  console.log('SchemeSearch - User:', user);
  const userRole = user?.role || 'AFSO'; // Default to AFSO if not specified
  
  const [formData, setFormData] = useState({
    financialYear: '',
    month: '',
    dfsoOffice: userRole === 'DFSO' ? (user?.dfsoOffice || 'DFSO Office - Sample Location') : '',
    afsoOffice: userRole === 'AFSO' ? (user?.afsoOffice || 'AFSO Office - Sample Location') : '',
    afsoCode: userRole === 'AFSO' ? (user?.afsoCode || '1502308') : '',
    dfsoCode: userRole === 'DFSO' ? (user?.dfsoCode || '1502') : '',
    fpsName: ''
  });
  const [financialYears, setFinancialYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [dfsoList, setDfsoList] = useState([]);
  const [afsoList, setAfsoList] = useState([]);
  const [fpsList, setFpsList] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAFSO, setIsAFSO] = useState(userRole === 'AFSO');

  // State for AFSO tabbed interface
  const [activeTab, setActiveTab] = useState('new');
  const [newScrutinyData, setNewScrutinyData] = useState([]);
  const [oldScrutinyData, setOldScrutinyData] = useState([]);
  const [selectedDataFromTabs, setSelectedDataFromTabs] = useState({
    new: [],
    old: []
  });

  // Modal states
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', message: '' });

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = "";
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, []);


useEffect(() => {
  const handlePopState = () => {
    const confirmLeave = window.confirm(
      "Are you sure you want to go back?"
    );

    if (!confirmLeave) {
      window.history.pushState(null, "", window.location.href);
    }
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, []);

  const loadDropdownData = async () => {
    try {
      const promises = [
        apiService.getFinancialYears(),
        apiService.getMonths()
      ];
      
       // Load AFSO list only if user is AFSO
      if (userRole === 'AFSO') {
        promises.push(apiService.getFPSListByAFSOCode(formData.afsoCode));
      }
      // Load AFSO list only if user is DFSO
      if (userRole === 'DFSO') {
        promises.push(apiService.getAFSOListByDFSOCode(formData.dfsoCode));
      }
      
      const results = await Promise.all(promises);
      
      setFinancialYears(results[0].data || []);
      setMonths(results[1].data || []);
      
       if (userRole === 'AFSO' && results[2]) {
        setFpsList(results[2].data || []);
      }
      if (userRole === 'DFSO' && results[2]) {
        setAfsoList(results[2].data || []);
      }
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const isFormValid = () => {
    const baseValid = formData.financialYear && formData.month;// && formData.fpsName;
    // For DFSO role, AFSO office is also mandatory
    if (userRole === 'DFSO') {
      return baseValid && formData.afsoCode && formData.fpsCode;
    }
    return baseValid;
  };

  const handleProceed = async () => {
    if (!isFormValid()) {
      alert('Please fill all mandatory fields');
      return;
    }

    setLoading(true);
    try {
      if (userRole === 'DFSO') {
        // DFSO: Fetch from WIP table with SCRUTINY_PENDING status
        const data = await apiService.getWIPBeneficiaries(formData);
        setBeneficiaries(data);
      } else {
        // AFSO: Fetch both new and old scrutiny data
        const [newData, oldData] = await Promise.all([
          apiService.getBeneficiaries(formData),
          apiService.getOldScrutinyRecords(formData)
        ]);
        setNewScrutinyData(newData);
        setOldScrutinyData(oldData);
      }
      setShowTable(true);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      alert('Error fetching beneficiary data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAfsoChange = async (key, value) => {
    // update state
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));

    // call API only if value selected
    if (value) {
      try {
        console.log("Fetching FPS list for AFSO code:", value);
        const res = await apiService.getFPSListByAFSOCode(value);
        setFpsList(res.data || []);
      } catch (err) {
        console.error("Error fetching FPS list:", err);
      }
    }
  };

  // Handle selection changes from BeneficiaryTable components
  const handleSelectionChange = (selectedData, tabType) => {
    setSelectedDataFromTabs(prev => ({
      ...prev,
      [tabType]: selectedData
    }));
  };

  // Handle Final Submit (combines data from both tabs)
  const handleFinalSubmit = async () => {
    const newTabData = selectedDataFromTabs.new || [];
    const oldTabData = selectedDataFromTabs.old || [];

    // Validate that at least one tab has selections
    if (newTabData.length === 0 && oldTabData.length === 0) {
      setModalMessage({
        title: 'Validation Error',
        message: 'Please select at least one family from either tab before submitting.'
      });
      setShowErrorModal(true);
      return;
    }

    // Combine data from both tabs
    const combinedPayload = [...newTabData, ...oldTabData];

    console.log('Final Submit - Combined Payload:', JSON.stringify(combinedPayload, null, 2));
    console.log(`New Scrutiny: ${newTabData.length} records, Old Scrutiny: ${oldTabData.length} records`);

    // Show loading modal
    setShowLoadingModal(true);

    try {
      const response = await apiService.saveWIPData(combinedPayload, formData);
      console.log('Save response:', response);
      
      // Hide loading modal
      setShowLoadingModal(false);
      
      // Show success modal
      setModalMessage({
        title: 'Success!',
        message: `Data saved successfully! ${response.meta?.count || combinedPayload.length} records inserted.`
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving data:', error);
      
      // Hide loading modal
      setShowLoadingModal(false);
      
      // Show error modal
      setModalMessage({
        title: 'Operation Failed',
        message: `Failed to save data. ${error.response?.data?.message || error.message}`
      });
      setShowErrorModal(true);
    }
  };

  // Handle success modal close
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // Optionally reload the page
    window.location.reload();
  };

  // Handle error modal close
  const handleErrorClose = () => {
    setShowErrorModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            APL Scheme Management
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, <strong>{user?.username}</strong>
            </span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Scheme Search
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Financial Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Year <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.financialYear}
                onChange={(e) => handleChange("financialYear", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select Financial Year</option>
                {financialYears.map((fy) => (
                  <option key={fy.id} value={fy.financial_year}>
                    {fy.financial_year}
                  </option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.month}
                onChange={(e) => handleChange("month", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select Month</option>
                {months.map((month) => (
                  <option key={month.id} value={month.month_name}>
                    {month.month_name}
                  </option>
                ))}
              </select>
            </div>

            {/* DFSO Office - Shows for DFSO role (Read-only) */}
            {userRole === "DFSO" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DFSO Office Name
                </label>
                <input
                  type="text"
                  value={formData.dfsoOffice}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
            )}

            {/* AFSO Office - Dropdown for DFSO, Read-only for AFSO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AFSO Office Name{" "}
                {userRole === "DFSO" && <span className="text-red-500">*</span>}
              </label>
              {userRole === "DFSO" ? (
                <select
                  value={formData.afsoCode}
                  onChange={(e) => handleAfsoChange("afsoCode", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select AFSO Office</option>
                  {afsoList.map((afso) => (
                    <option key={afso.id} value={afso.afso_code}>
                      {afso.description_en} || {afso.afso_code}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.afsoOffice}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              )}
            </div>

            {/* FPS Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FPS Name <span className="text-red-500">*</span>
              </label>

              <select
                value={formData.fpsCode}
                onChange={(e) => handleChange("fpsCode", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select FPS</option>
                {fpsList.map((fps) => (
                  <option key={fps.id} value={fps.fps_code}>
                    {fps.description_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleProceed}
              disabled={!isFormValid() || loading}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition shadow-md hover:shadow-lg ${
                !isFormValid() || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "hover:opacity-90"
              }`}
              style={!isFormValid() && !loading ? {} : { backgroundColor: '#002B70' }}
            >
              {loading ? "Loading..." : "Proceed"}
            </button>
          </div>
        </div>

        {/* Beneficiary Tables */}
        {showTable && isAFSO && (
          <div className="bg-white rounded-lg shadow p-6">
            {/* Tab Navigation */}
            <TabContainer
              tabs={[
                { id: 'new', label: 'New Scrutiny', count: newScrutinyData.length },
                { id: 'old', label: 'Old Scrutiny Records', count: oldScrutinyData.length }
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Tab Content - Both tabs rendered but hidden to preserve state */}
            <div className="mt-6">
              <div style={{ display: activeTab === 'new' ? 'block' : 'none' }}>
                <BeneficiaryTable
                  beneficiaries={newScrutinyData}
                  searchParams={formData}
                  onSelectionChange={handleSelectionChange}
                  tabType="new"
                />
              </div>
              
              <div style={{ display: activeTab === 'old' ? 'block' : 'none' }}>
                <BeneficiaryTable
                  beneficiaries={oldScrutinyData}
                  searchParams={formData}
                  onSelectionChange={handleSelectionChange}
                  tabType="old"
                />
              </div>
            </div>

            {/* Final Submit Button */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Selected: </span>
                New Scrutiny: {selectedDataFromTabs.new.length} | 
                Old Scrutiny: {selectedDataFromTabs.old.length} | 
                Total: {selectedDataFromTabs.new.length + selectedDataFromTabs.old.length}
              </div>
              <button
                onClick={handleFinalSubmit}
                className="text-white font-semibold px-8 py-3 rounded-lg transition shadow-md hover:shadow-lg hover:opacity-90"
                style={{ backgroundColor: '#002B70' }}
              >
                Final Submit
              </button>
            </div>
          </div>
        )}

        {showTable && !isAFSO && (
          <BeneficiaryTableDFSO
            beneficiaries={beneficiaries}
            searchParams={formData}
            userRole={userRole}
          />
        )}
      </main>

      {/* Modal Components */}
      <LoadingModal
        isOpen={showLoadingModal}
        title="Saving Data..."
        subtitle="Please wait while we process your submission."
      />

      <SuccessModal
        isOpen={showSuccessModal}
        title={modalMessage.title}
        message={modalMessage.message}
        onClose={handleSuccessClose}
        buttonText="OK"
      />

      <ErrorModal
        isOpen={showErrorModal}
        title={modalMessage.title}
        message={modalMessage.message}
        onClose={handleErrorClose}
        buttonText="Close"
      />
    </div>
  );
};

export default SchemeSearch;
