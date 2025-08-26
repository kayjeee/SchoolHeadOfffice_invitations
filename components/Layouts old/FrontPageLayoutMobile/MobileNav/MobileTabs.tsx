import Link from 'next/link';

const MobileTabs: React.FC = () => {
  return (
    <div className="flex gap-4">
      <Link href="/Personal" passHref>
        <span className="text-gray-800 cursor-pointer hover:underline">Personal</span>
      </Link>
      <Link href="/admin" passHref>
        <span className="text-gray-800 cursor-pointer hover:underline">Business</span>
      </Link>
    </div>
  );
};

export default MobileTabs;
