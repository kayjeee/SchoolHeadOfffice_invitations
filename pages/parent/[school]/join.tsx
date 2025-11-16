import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token } = context.query;
  const { school } = context.params as { school: string };

  // Redirect into the main parent page with the token preserved
  return {
    redirect: {
      destination: `/parent?token=${token}&school=${school}`,
      permanent: false,
    },
  };
};

export default function JoinRedirect() {
  return null; // we never render this page
}

