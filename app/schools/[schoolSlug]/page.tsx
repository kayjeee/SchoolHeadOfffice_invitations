import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { schoolSlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // In a real application, you would fetch school data from your API/DB here
  // const school = await fetchSchoolBySlug(params.schoolSlug);
  const schoolName = params.schoolSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${schoolName} | School Profile`,
    description: `Official school profile for ${schoolName}. View details, contact information, and more.`,
    openGraph: {
      title: schoolName,
      description: `Official school profile for ${schoolName}.`,
      // images: [school.logoUrl],
    },
  };
}

export default function SchoolProfilePage({ params }: Props) {
  const schoolName = params.schoolSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="max-w-4xl mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">{schoolName}</h1>
        <p className="text-xl text-gray-500 mt-2">Public School Profile</p>
      </header>

      <section className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold mb-4">About Our School</h2>
        <p className="text-gray-700 leading-relaxed">
          Welcome to the public profile of {schoolName}. This page is accessible to anyone and is indexed by search engines to help parents and students find our school online.
        </p>
      </section>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="font-bold text-blue-800 mb-2">Contact Info</h3>
          <p className="text-blue-700 text-sm">Find our address, phone number, and email here.</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <h3 className="font-bold text-green-800 mb-2">Admissions</h3>
          <p className="text-green-700 text-sm">Learn how to enroll your child at {schoolName}.</p>
        </div>
      </div>
    </div>
  );
}
