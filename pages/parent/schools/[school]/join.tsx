// pages/parent/[school]/join.tsx
export default function JoinRedirectPage() {
  return null;
}

export async function getServerSideProps(context) {
  const { school } = context.params;
  const token = context.query.token;

  if (!token) {
    return {
      redirect: {
        destination: `/parent?error=missing_token`,
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: `/parent?token=${token}&school=${school}`,
      permanent: false,
    },
  };
}
