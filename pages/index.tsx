import { useEffect, useRef, useState } from 'react';
import { useUser } from "@auth0/nextjs-auth0/client";
import FrontPageLayout from '../components/Layouts/FrontPageLayout';
import FrontPageLayoutMobileView from '../components/Layouts/FrontPageLayoutMobile/FrontPageLayoutMobileView';
import DesktopHome from '../components/FrontPageComponents/DesktopHome';
import MobileHome from '../components/FrontPageComponents/MobileHome';
import LoadingSpinner from '../components/spinners/LoadingSpinner';
import clientPromise from '../lib/mongodb';


const Home = ({ schools }) => {
  const { user, isLoading } = useUser();
  const dropdownRef = useRef(null);

  const [state, setState] = useState({
    isMobile: false,
    chatOpen: false,
    dropdownOpen: false,
    userData: null,
    error: null,
    userRoles: [],
  });

  const { isMobile, chatOpen, dropdownOpen, error, userRoles, userData } = state;

  useEffect(() => {
    const handleResize = () => {
      setState((prev) => ({ ...prev, isMobile: window.innerWidth < 768 }));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  return isMobile ? (
    <FrontPageLayoutMobileView user={user} schools={schools} userRoles={userRoles}>
      <MobileHome
        handleSearchClick={() => setState((prev) => ({ ...prev, dropdownOpen: !dropdownOpen }))}
        handleChatClick={() => setState((prev) => ({ ...prev, chatOpen: !chatOpen }))}
        dropdownOpen={dropdownOpen}
        dropdownRef={dropdownRef}
        schools={schools}
        toggleProfile={() => setState((prev) => ({ ...prev, chatOpen: !chatOpen }))}
      />
    </FrontPageLayoutMobileView>
  ) : (
    <FrontPageLayout user={user} schools={schools} userRoles={userRoles}>
      <DesktopHome
        handleSearchClick={() => setState((prev) => ({ ...prev, dropdownOpen: !dropdownOpen }))}
        handleChatClick={() => setState((prev) => ({ ...prev, chatOpen: !chatOpen }))}
        dropdownOpen={dropdownOpen}
        dropdownRef={dropdownRef}
        schools={schools}
        toggleProfile={() => setState((prev) => ({ ...prev, chatOpen: !chatOpen }))}
      />
    </FrontPageLayout>
  );
};

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db('tracker');
    const schools = await db.collection('School').find({}).sort({ metacritic: -1 }).limit(1000).toArray();
    return { props: { schools: JSON.parse(JSON.stringify(schools)) } };
  } catch (error) {
    console.error('Error fetching schools:', error);
    return { props: { schools: [] } };
  }
}

export default Home;
