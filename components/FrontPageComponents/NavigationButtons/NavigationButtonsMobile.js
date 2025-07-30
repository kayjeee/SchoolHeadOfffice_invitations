import Link from 'next/link';

const NavigationButtonsMobile = () => (
    <div className="relative p-6 bg-gray-100 mt-8 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Where would you like to start?</h3>
      <p className="text-lg text-gray-700 mb-4">
        Choose from simplified navigation in Personal, to building an enterprise in Business .
      </p>
      <div className="space-y-4">
        <button className="w-full py-4 bg-white rounded-lg shadow-md flex justify-between items-center px-6">
          <div className="flex items-center">
          
            <span className="font-bold text-lg">Business</span>
            <span className="ml-2 text-gray-600">Accountl</span>
          </div>
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        <button className="w-full py-4 bg-blue-800 text-white rounded-lg shadow-md flex justify-between items-center px-6">
          <div className="flex items-center">
        
            <span className="font-bold text-lg">Personal</span>
            <span className="ml-2">Account</span>
          </div>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      
      </div>
    </div>
  );
  
  export default NavigationButtonsMobile;
  