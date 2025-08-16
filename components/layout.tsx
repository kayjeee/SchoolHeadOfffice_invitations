import Head from "next/head";
import Header from "./Layouts/FrontPageLayout/Nav/header";
import { useState } from "react";

type LayoutProps = {
  user?: any;
  loading?: boolean;
  children: React.ReactNode;
};

const Layout = ({ user, loading = false, children }: LayoutProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [schools, setSchools] = useState<any[]>([]);

  return (
    <>
      <Head>
        <title>Next.js with Auth0</title>
      </Head>

      <Header
        user={user}
        loading={loading}
        schoolImage="/logo.png"
        schools={schools}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main>
        <div className="container">{children}</div>
      </main>

      <style jsx>{`
        .container {
          max-width: 42rem;
          margin: 1.5rem auto;
        }
      `}</style>
      <style jsx global>{`
        body {
          margin: 0;
          color: #333;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }
      `}</style>
    </>
  );
};

export default Layout;
