import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import BeneficiaryTable from '../components/BeneficiaryTable';

const SchemeSearch = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    financialYear: '',
    month: '',
    afsoOffice: user?.afsoOffice || '',
    fpsName: ''
  });
  const [financialYears, setFinancialYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [fpsList, setFpsList] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      const [fyData, monthData, fpsData] = await Promise.all([
        apiService.getFinancialYears(),
        apiService.getMonths(),
        apiService.getFPSList()
      ]);
      
      setFinancialYears(fyData.data || []);
      setMonths(monthData.data || []);
      setFpsList(fpsData.data || []);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const isFormValid = () => {
    return formData.financialYear && formData.month && formData.fpsName;
  };

  const handleProceed = async () => {
    if (!isFormValid()) {
      alert('Please fill all mandatory fields');
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.getBeneficiaries(formData);
      setBeneficiaries(data);
      setShowTable(true);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      alert('Error fetching beneficiary data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">APL Scheme Management</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, <strong>{user?.username}</strong></span>
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
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Scheme Search</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Financial Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Year <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.financialYear}
                onChange={(e) => handleChange('financialYear', e.target.value)}
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
                onChange={(e) => handleChange('month', e.target.value)}
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

            {/* AFSO Office (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AFSO Office Name
              </label>
              <input
                type="text"
                value={formData.afsoOffice}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* FPS Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FPS Name <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.fpsName}
                onChange={(e) => handleChange('fpsName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select FPS</option>
                {fpsList.map((fps) => (
                  <option key={fps.id} value={fps.description_en}>
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
              className={`px-8 py-3 rounded-lg font-semibold text-white transition ${
                !isFormValid() || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? 'Loading...' : 'Proceed'}
            </button>
          </div>
        </div>

        {/* Beneficiary Table */}
        {showTable && (
          <BeneficiaryTable 
            beneficiaries={beneficiaries} 
            searchParams={formData}
          />
        )}
      </main>
    </div>
  );
};

export default SchemeSearch;
