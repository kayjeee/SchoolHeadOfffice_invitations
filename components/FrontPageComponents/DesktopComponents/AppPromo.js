// components/AppPromo.js
const AppPromo = () => (
    <div className="text-right">
      <h3 className="text-lg font-bold text-gray-800 mb-2">Available on</h3>
      <div className="flex justify-end items-center space-x-2">
        <div className="flex flex-col items-center">
          <img src="/android.png" alt="Android App" className="w-10 h-10 mb-1" />
          <span className="text-xs text-gray-600 font-medium">Android</span>
        </div>
        <div className="flex flex-col items-center">
          <img src="/ios.png" alt="iOS App" className="w-10 h-10 mb-1" />
          <span className="text-xs text-gray-600 font-medium">iOS</span>
        </div>
      </div>
    </div>
  );
  
  export default AppPromo;
  