// components/schoolpage/CreateSchoolForm/steps/Step2Address.js
import React, { useState, useMemo, useCallback } from 'react';
import GoogleMapReact from 'google-map-react';
import Marker from '../../../Marker';

// Complete location data
const LOCATION_DATA = {
  'South Africa': {
    provinces: {
      'Eastern Cape': ['Port Elizabeth', 'East London', 'Mthatha', 'Grahamstown', 'Queenstown'],
      'Free State': ['Bloemfontein', 'Welkom', 'Kroonstad', 'Bethlehem', 'Sasolburg'],
      'Gauteng': ['Johannesburg', 'Pretoria', 'Soweto', 'Sandton', 'Centurion', 'Midrand', 'Roodepoort'],
      'KwaZulu-Natal': ['Durban', 'Pietermaritzburg', 'Richards Bay', 'Newcastle', 'Ladysmith'],
      'Limpopo': ['Polokwane', 'Tzaneen', 'Musina', 'Thohoyandou', 'Mokopane'],
      'Mpumalanga': ['Nelspruit', 'Witbank', 'Middelburg', 'Secunda', 'Standerton'],
      'Northern Cape': ['Kimberley', 'Upington', 'Springbok', 'Kuruman', 'De Aar'],
      'North West': ['Mahikeng', 'Rustenburg', 'Klerksdorp', 'Potchefstroom', 'Brits'],
      'Western Cape': ['Cape Town', 'Stellenbosch', 'Paarl', 'George', 'Worcester', 'Hermanus']
    }
  },
  'Kenya': {
    provinces: {
      'Nairobi': ['Nairobi City', 'Westlands', 'Karen', 'Kileleshwa', 'Parklands'],
      'Mombasa': ['Mombasa City', 'Nyali', 'Likoni', 'Changamwe'],
      'Kisumu': ['Kisumu City', 'Ahero', 'Maseno', 'Muhoroni'],
      'Nakuru': ['Nakuru City', 'Naivasha', 'Gilgil', 'Njoro'],
      'Uasin Gishu': ['Eldoret', 'Turbo', 'Burnt Forest', 'Soy'],
      'Kiambu': ['Thika', 'Kikuyu', 'Ruiru', 'Limuru', 'Kiambu Town']
    }
  },
  'Botswana': {
    provinces: {
      'South-East': ['Gaborone', 'Ramotswa', 'Mochudi', 'Lobatse'],
      'North-East': ['Francistown', 'Masunga', 'Nata'],
      'Kweneng': ['Molepolole', 'Thamaga', 'Mogoditshane'],
      'Southern': ['Kanye', 'Jwaneng', 'Tshabong'],
      'Central': ['Serowe', 'Palapye', 'Mahalapye', 'Tonota'],
      'North-West': ['Maun', 'Shakawe', 'Gumare']
    }
  },
  'Nigeria': {
    provinces: {
      'Lagos': ['Lagos Island', 'Ikeja', 'Surulere', 'Victoria Island', 'Lekki', 'Ikorodu'],
      'Kano': ['Kano City', 'Wudil', 'Bichi', 'Rano'],
      'Rivers': ['Port Harcourt', 'Bonny', 'Okrika', 'Eleme'],
      'Kaduna': ['Kaduna City', 'Zaria', 'Kafanchan', 'Kachia'],
      'Oyo': ['Ibadan', 'Ogbomosho', 'Oyo Town', 'Iseyin'],
      'Abuja': ['Abuja City', 'Gwagwalada', 'Kuje', 'Bwari']
    }
  },
  'Canada': {
    provinces: {
      'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London', 'Markham', 'Vaughan'],
      'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil'],
      'British Columbia': ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Victoria', 'Kelowna'],
      'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Fort McMurray'],
      'Manitoba': ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson'],
      'Saskatchewan': ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw']
    }
  },
  'United States': {
    provinces: {
      'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose', 'Oakland'],
      'New York': ['New York City', 'Buffalo', 'Rochester', 'Syracuse', 'Albany'],
      'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso'],
      'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'],
      'Illinois': ['Chicago', 'Aurora', 'Naperville', 'Rockford', 'Joliet'],
      'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading']
    }
  },
  'France': {
    provinces: {
      'Île-de-France': ['Paris', 'Versailles', 'Boulogne-Billancourt', 'Saint-Denis', 'Nanterre'],
      'Provence-Alpes-Côte d\'Azur': ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Cannes'],
      'Auvergne-Rhône-Alpes': ['Lyon', 'Grenoble', 'Saint-Étienne', 'Annecy', 'Chambéry'],
      'Nouvelle-Aquitaine': ['Bordeaux', 'Limoges', 'Poitiers', 'La Rochelle', 'Pau'],
      'Occitanie': ['Toulouse', 'Montpellier', 'Nîmes', 'Perpignan', 'Béziers'],
      'Grand Est': ['Strasbourg', 'Reims', 'Metz', 'Mulhouse', 'Nancy']
    }
  },
  'New Zealand': {
    provinces: {
      'Auckland': ['Auckland City', 'Manukau', 'North Shore', 'Waitakere'],
      'Wellington': ['Wellington City', 'Lower Hutt', 'Upper Hutt', 'Porirua'],
      'Canterbury': ['Christchurch', 'Timaru', 'Ashburton', 'Rangiora'],
      'Waikato': ['Hamilton', 'Tauranga', 'Rotorua', 'Tokoroa'],
      'Bay of Plenty': ['Tauranga', 'Rotorua', 'Whakatane'],
      'Otago': ['Dunedin', 'Queenstown', 'Oamaru', 'Alexandra']
    }
  },
  'Namibia': {
    provinces: {
      'Khomas': ['Windhoek', 'Rehoboth'],
      'Erongo': ['Swakopmund', 'Walvis Bay', 'Henties Bay', 'Arandis'],
      'Oshana': ['Oshakati', 'Ondangwa', 'Ongwediva'],
      'Otjozondjupa': ['Otjiwarongo', 'Grootfontein', 'Okahandja'],
      'Omaheke': ['Gobabis', 'Leonardville'],
      'Hardap': ['Mariental', 'Rehoboth', 'Aranos']
    }
  }
};

const Step2Address = ({
  formData,
  theme,
  onLine1Change,
  onLine2Change,
  onCountryChange,
  onProvinceChange,
  onCityChange,
  onPostalCodeChange,
  onMapClick,
  onNext,
  onPrevious,
  isLoading = false,
}) => {
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const themeColor = theme?.value || '#059669';
  const themeHover = adjustBrightness(themeColor, -10);

  const addressLine1 = formData.addressLine1 || '';
  const addressLine2 = formData.addressLine2 || '';
  const selectedLocation = formData.location || null;

  // Get available provinces based on selected country
  const availableProvinces = useMemo(() => {
    if (!formData.country || !LOCATION_DATA[formData.country]) return [];
    return Object.keys(LOCATION_DATA[formData.country].provinces);
  }, [formData.country]);

  // Get available cities based on selected country and province
  const availableCities = useMemo(() => {
    if (!formData.country || !formData.province || !LOCATION_DATA[formData.country]) return [];
    return LOCATION_DATA[formData.country].provinces[formData.province] || [];
  }, [formData.country, formData.province]);

  // Reset province and city when country changes
  const handleCountryChange = (e) => {
    onCountryChange(e);
    onProvinceChange({ target: { value: '' } });
    onCityChange({ target: { value: '' } });
  };

  // Reset city when province changes
  const handleProvinceChange = (e) => {
    onProvinceChange(e);
    onCityChange({ target: { value: '' } });
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!addressLine1.trim()) {
      newErrors.addressLine1 = 'Address Line 1 is required';
    }
    if (!(formData.country || '').trim()) {
      newErrors.country = 'Country is required';
    }
    if (!(formData.province || '').trim()) {
      newErrors.province = 'Province/State is required';
    }
    if (!(formData.city || '').trim()) {
      newErrors.city = 'City is required';
    }
    if (!(formData.postalCode || '').trim()) {
      newErrors.postalCode = 'Postal Code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [addressLine1, formData.country, formData.province, formData.city, formData.postalCode]);

  const handleNext = useCallback(() => {
    if (validateForm()) {
      onNext();
    }
  }, [validateForm, onNext]);

  const handleFieldChange = (field, onChange) => (e) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[field];
        return newErr;
      });
    }
    onChange(e);
  };

  const defaultProps = {
    center: {
      lat: selectedLocation?.lat || -30.5595,
      lng: selectedLocation?.lng || 22.9375,
    },
    zoom: selectedLocation ? 14 : 4,
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-white via-gray-100 to-white">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ background: `linear-gradient(to right, ${themeColor}20, transparent, ${themeColor}20)` }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 
              className="text-5xl md:text-7xl font-black mb-4 bg-clip-text text-transparent"
              style={{ 
                backgroundImage: `linear-gradient(to right, ${themeColor}, ${adjustBrightness(themeColor, 20)})` 
              }}
            >
              Welcome to SchoolHeadOffice
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light">
              Create your premium education experience
            </p>
            <div 
              className="mt-4 w-20 h-1 mx-auto rounded-full" 
              style={{ backgroundColor: themeColor }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200">
          <div className="p-8 md:p-12">
            {/* Progress Indicator */}
            <div className="mb-10">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Step 2 of 4</span>
                <span>50% Complete</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full w-1/2 transition-all duration-500 ease-out" 
                  style={{ backgroundColor: themeColor }}
                />
              </div>
            </div>

            {/* Address & Map Section */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center">
                <div 
                  className="w-2 h-8 rounded-full mr-4" 
                  style={{ backgroundColor: themeColor }}
                />
                School Address
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Please provide your school's physical address. You can also confirm the location by dropping a pin on the interactive map below.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Fields Column */}
                <div className="space-y-6">
                  <Field
                    label="Address Line 1 *"
                    id="addressLine1"
                    placeholder="1234 Main St"
                    value={addressLine1}
                    error={errors.addressLine1}
                    onChange={handleFieldChange('addressLine1', onLine1Change)}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    themeColor={themeColor}
                  />

                  <Field
                    label="Address Line 2"
                    id="addressLine2"
                    placeholder="Apartment, studio, or floor"
                    value={addressLine2}
                    onChange={onLine2Change}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    themeColor={themeColor}
                  />

                  <SelectField
                    label="Country *"
                    id="country"
                    value={formData.country || ''}
                    options={Object.keys(LOCATION_DATA)}
                    error={errors.country}
                    onChange={handleFieldChange('country', handleCountryChange)}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    placeholder="Select Country"
                    themeColor={themeColor}
                  />

                  <SelectField
                    label="Province/State *"
                    id="province"
                    value={formData.province || ''}
                    options={availableProvinces}
                    error={errors.province}
                    onChange={handleFieldChange('province', handleProvinceChange)}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    placeholder="Select Province/State"
                    disabled={!formData.country}
                    themeColor={themeColor}
                  />

                  <SelectField
                    label="City *"
                    id="city"
                    value={formData.city || ''}
                    options={availableCities}
                    error={errors.city}
                    onChange={handleFieldChange('city', onCityChange)}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    placeholder="Select City"
                    disabled={!formData.province}
                    themeColor={themeColor}
                  />

                  <Field
                    label="Postal Code *"
                    id="postalCode"
                    placeholder="Postal Code"
                    value={formData.postalCode || ''}
                    error={errors.postalCode}
                    onChange={handleFieldChange('postalCode', onPostalCodeChange)}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    themeColor={themeColor}
                  />
                </div>

                {/* Map Column */}
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold mb-4">Confirm Location on Map</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Click on the map to place a pin for your school's exact location. This will help students find you easily.
                  </p>
                  <div className="relative flex-grow min-h-[400px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
                    <GoogleMapReact
                      bootstrapURLKeys={{
                        key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
                      }}
                      defaultCenter={defaultProps.center}
                      defaultZoom={defaultProps.zoom}
                      onClick={onMapClick}
                      center={selectedLocation || defaultProps.center}
                      zoom={selectedLocation ? 14 : defaultProps.zoom}
                    >
                      {selectedLocation && (
                        <Marker
                          lat={selectedLocation.lat}
                          lng={selectedLocation.lng}
                          text="School Location"
                        />
                      )}
                    </GoogleMapReact>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-8 border-t border-gray-200 flex gap-4">
              <button
                type="button"
                onClick={onPrevious}
                className="flex-1 py-4 px-8 bg-white text-black font-bold text-lg rounded-xl border-2 border-gray-300 transition-all duration-300 hover:border-gray-400 hover:shadow-lg focus:outline-none focus:ring-0 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>←</span>
                  <span>Previous</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className={`flex-1 py-4 px-8 text-white font-bold text-lg rounded-xl transition-all duration-300 hover:shadow-2xl focus:outline-none focus:ring-0 transform hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-1 ${
                  isLoading ? 'cursor-wait opacity-50' : ''
                }`}
                style={{ 
                  backgroundColor: themeColor,
                  boxShadow: `0 10px 30px ${themeColor}40`
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = themeHover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = themeColor;
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Continue</span>
                    <span>→</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-5">
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(to bottom right, ${themeColor}20, transparent, ${themeColor}20)` 
          }}
        />
      </div>
    </div>
  );
};

// Field Component
const Field = ({
  label,
  id,
  placeholder,
  value,
  onChange,
  error,
  focusedField,
  setFocusedField,
  themeColor
}) => (
  <div className="group">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <input
        type="text"
        id={id}
        className={`w-full px-4 py-4 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500
          transition-all duration-300 focus:outline-none focus:ring-0
          ${error
            ? 'border-red-500 focus:border-red-400'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${focusedField === id ? 'transform scale-[1.02]' : ''}`}
        style={focusedField === id ? { borderColor: themeColor } : {}}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocusedField(id)}
        onBlur={() => setFocusedField(null)}
      />
      {focusedField === id && (
        <div 
          className="absolute -inset-1 rounded-lg opacity-20 blur-sm -z-10" 
          style={{ backgroundColor: themeColor }}
        />
      )}
    </div>
    {error && (
      <p className="text-red-600 text-sm mt-2 flex items-center">
        <span className="mr-2">⚠️</span>
        {error}
      </p>
    )}
  </div>
);

// SelectField Component
const SelectField = ({
  label,
  id,
  value,
  options,
  onChange,
  error,
  focusedField,
  setFocusedField,
  placeholder,
  disabled = false,
  themeColor
}) => (
  <div className="group">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        onFocus={() => setFocusedField(id)}
        onBlur={() => setFocusedField(null)}
        disabled={disabled}
        className={`w-full px-4 py-4 bg-gray-50 border rounded-lg text-gray-900
          transition-all duration-300 focus:outline-none focus:ring-0
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${error
            ? 'border-red-500 focus:border-red-400'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${focusedField === id ? 'transform scale-[1.02]' : ''}`}
        style={focusedField === id && !disabled ? { borderColor: themeColor } : {}}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {focusedField === id && !disabled && (
        <div 
          className="absolute -inset-1 rounded-lg opacity-20 blur-sm -z-10" 
          style={{ backgroundColor: themeColor }}
        />
      )}
    </div>
    {error && (
      <p className="text-red-600 text-sm mt-2 flex items-center">
        <span className="mr-2">⚠️</span>
        {error}
      </p>
    )}
  </div>
);

// Helper function
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, '0')}`;
}

export default Step2Address;