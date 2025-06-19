
import Image from 'next/image';

export default function ProfilePage() {
  return (
    <div
      className="min-h-screen bg-black text-white relative overflow-hidden p-2 pt-6"
      style={{
        backgroundImage: "url('/background-wave.svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      

      {/* Profile Section */}
      <div className="max-w-4xl mx-auto bg-black bg-opacity-70 p-6 rounded-lg border border-purple-900/60 shadow-md">
        <h2 className="text-xl font-semibold mb-6">My Profile</h2>

        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center justify-center">
            <Image src="/logo/profile.svg" alt="Profile" width={48} height={48} />
          </div>
          <button className="px-3 py-1 rounded text-sm border border-purple-900 hover:bg-purple-600 transition">
            Upload Photo
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">User Id:</label>
            <input
              type="text"
              className="w-full px-3 py-1 rounded bg-black border border-purple-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email:</label>
            <input
              type="email"
              className="w-full px-3 py-1 rounded bg-black border border-purple-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">User Name:</label>
            <input
              type="text"
              className="w-full px-3 py-1 rounded bg-black border border-purple-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Contact No:</label>
            <input
              type="text"
              className="w-full px-3 py-1 rounded bg-black border border-purple-900 focus:outline-none"
            />
          </div>
        </div>

        {/* USDT Wallet Section */}
        <div className="mt-6">
          <h3 className="text-purple-400 text-lg font-semibold mb-2">USDT Wallet Details</h3>
          <p className="text-sm mb-1">USDT Wallet Address (BEP20 Network)</p>
          <div className="w-full text-sm px-3 py-2 rounded bg-purple-900 text-purple-100 break-all">
            dcjsj12880-qiwjsjjkxklix-jijnnbjhdjsssjsksl
          </div>
        </div>
      </div>
    </div>
  );
}
