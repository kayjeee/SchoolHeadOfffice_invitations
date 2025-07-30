import { useState, useEffect } from 'react';
import FrontPageLayout from '../../components/Layouts/FrontPageLayout';
import FrontPageLayoutMobileView from '../../components/Layouts/FrontPageLayoutMobile/FrontPageLayoutMobileView';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function PricingPage() {
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useUser();
  const schools = []; // Replace with actual schools data
  const [state, setState] = useState({

    chatOpen: false,
    dropdownOpen: false,
    userData: null,
    error: null,
    
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { chatOpen, dropdownOpen, error, userRoles, userData } = state;

  // Function to detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Check screen size on component mount
    window.addEventListener('resize', handleResize); // Add event listener for screen resize

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup on component unmount
    };
  }, []);

  const fetchUserRoles = async (accessToken, userId) => {
    const rolesUrl = `https://dev-t0o26rre86m7t8lo.us.auth0.com/api/v2/users/${userId}/roles`;
    const response = await fetch(rolesUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch user roles');
    const rolesData = await response.json();
    return rolesData.map(role => role.name);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const response = await fetch('/api/getAccessToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch access token');

        const { accessToken } = await response.json();
        const userId = encodeURIComponent(user.sub);

        const roles = await fetchUserRoles(accessToken, userId);
        setState((prev) => ({ ...prev, userRoles: roles }));

        const checkUserUrl = `http://localhost:4000/api/v1/users/${userId}`;
        const postUserUrl = `http://localhost:4000/api/v1/users/`;

        const userResponse = await fetch(checkUserUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (userResponse.status === 404) {
          const userPayload = {
            auth0_id: user.sub,
            name: user.name,
            email: user.email,
            roles: roles.length > 0 ? roles : ['default_role'],
          };

          const createResponse = await fetch(postUserUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(userPayload),
          });

          if (!createResponse.ok) throw new Error('Failed to create user');
          const createdUser = await createResponse.json();
          setState((prev) => ({ ...prev, userData: createdUser }));
        } else if (userResponse.ok) {
          const existingUser = await userResponse.json();
          setState((prev) => ({ ...prev, userData: existingUser }));
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (err) {
        setState((prev) => ({ ...prev, error: err.message }));
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  const plans = [
    { id: 1, name: 'Basic Plan', price: 500, features: ['Up to 200 users', 'Communication platform', 'Basic admin dashboard'] },
    { id: 2, name: 'Intermediate Plan', price: 1200, features: ['Fee management', 'Event calendar', 'White-labeled apps'] },
    { id: 3, name: 'Premium Plan', price: 3000, features: ['Advanced reporting', 'Unlimited users', 'Dedicated account manager'] },
  ];

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [hasDiscount, setHasDiscount] = useState(false);

  const handleApplyCoupon = () => {
    if (coupon.trim() === 'DISCOUNT20') {
      setHasDiscount(true);
      alert('20% discount applied!');
    } else {
      alert('Invalid coupon!');
    }
  };

  const calculatePrice = (price) => {
    const discountedPrice = hasDiscount ? price * 0.8 : price;
    return discountedPrice.toFixed(2);
  };

  const handleChoosePlan = async (plan) => {
    setSelectedPlan(plan);

    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_name: plan.name,
        amount: calculatePrice(plan.price),
        recurring: true,
        trial_period: '3 months',
      }),
    });

    const data = await response.json();
    if (data.paymentUrl) {
      window.location.href = data.paymentUrl;
    } else {
      alert('Failed to process payment.');
    }
  };

  const renderContent = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white shadow-lg rounded-lg p-6 hover:shadow-2xl transition-shadow">
            <h2 className="text-xl font-semibold mb-4">{plan.name}</h2>
            <p className="text-gray-600 text-lg mb-4">
              <span className="line-through text-gray-400">{hasDiscount && `R${plan.price}`}</span> R{calculatePrice(plan.price)} / month
            </p>
            <p className="text-sm text-green-600 font-semibold mb-4">3-Month Free Trial Included!</p>
            <ul className="mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="text-gray-700 text-sm mb-2">✔ {feature}</li>
              ))}
            </ul>
            <button
              onClick={() => handleChoosePlan(plan)}
              className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Choose Plan
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 max-w-md mx-auto text-center">
        <h3 className="text-lg font-semibold mb-4">Have a coupon?</h3>
        <input
          type="text"
          placeholder="Enter coupon code"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          className="border rounded-lg p-2 w-2/3 mb-4"
        />
        <button
          onClick={handleApplyCoupon}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          Apply Coupon
        </button>
      </div>
    </div>
  );

  return isMobile ? (
    <FrontPageLayoutMobileView user={user} schools={schools} userRoles={userRoles}>
      {renderContent()}
    </FrontPageLayoutMobileView>
  ) : (
    <FrontPageLayout user={user} schools={schools} userRoles={userRoles}>
      {renderContent()}
    </FrontPageLayout>
  );
}
