

import { useState, useEffect } from "react";
import { Share2 } from "lucide-react";
import { toast } from "react-toastify";

const Navbar = () => {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.name) setUserName(parsed.name);
      } catch (err) {
        console.error("Error parsing user object", err);
      }
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Bitcoin GPT",
        text: "Check out Bitcoin GPT - Your AI Partner for Bitcoin Intelligence",
        url: window.location.href,
      }).catch((err) => console.log("Error sharing:", err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 relative md:ml-14">
  {/* Left side - Logo (only visible on mobile) */}
  <div className="flex items-center md:hidden">
    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
      <span className="text-white font-bold text-lg">₿</span>
    </div>
    <h1 className="text-gray-800 text-lg font-semibold ml-2">
      Bitcoin GPT
    </h1>
  </div>

  {/* Right side - Share button only */}
  <div className="flex items-center gap-4 ml-auto">
    <button
      onClick={handleShare}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      <Share2 size={16} />
      Share
    </button>
  </div>
</div>
  );
};

export default Navbar;