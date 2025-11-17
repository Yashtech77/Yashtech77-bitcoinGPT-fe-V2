import { useEffect, useState } from "react";
import { Play, Plus, Info, FileText, ExternalLink } from "lucide-react";
import { useChat } from "../context/ChatContext";

const RightNav = () => {
  const { youtubeLinks = [] } = useChat();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(true);
  const [isArticlesExpanded, setIsArticlesExpanded] = useState(true);
  const [showAllVideos, setShowAllVideos] = useState(false);

  const extractVideoId = (url) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes("youtube.com")) {
        return parsedUrl.searchParams.get("v");
      } else if (parsedUrl.hostname === "youtu.be") {
        return parsedUrl.pathname.slice(1);
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleOpenPopup = (video) => setSelectedVideo(video);
  const handleClosePopup = () => setSelectedVideo(null);

  // Mock data for related articles (you can replace with real data)
  const relatedArticles = [
    {
      title: "Bitcoin as Corporate Reserve",
      url: "https://example.com/article1",
      source: "example.com"
    },
    {
      title: "The Future of Decentralized Finance",
      url: "https://example.com/article2",
      source: "example.com"
    }
  ];

  return (
    <div className="w-full h-full rounded-lg flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        
        {/* Key Insights Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <button
            onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-2">
              <Info size={18} className="text-gray-600" />
              <span className="text-sm font-semibold text-gray-800">Key Insights</span>
            </div>
            <Plus 
              size={18} 
              className={`text-gray-600 transition-transform ${isInsightsExpanded ? 'rotate-45' : ''}`} 
            />
          </button>
          
          {isInsightsExpanded && (
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-600">
                No key insights available yet. Start a conversation to see insights here.
              </p>
            </div>
          )}
        </div>

        {/* Overview Section - Videos */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Play size={18} className="text-gray-600" />
              <span className="text-sm font-semibold text-gray-800">Overview</span>
            </div>
            {youtubeLinks.length > 4 && (
              <button 
                onClick={() => setShowAllVideos(!showAllVideos)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {showAllVideos ? 'Show Less' : 'View All'}
              </button>
            )}
          </div>

          <div className="p-4">
            {youtubeLinks.length > 0 ? (
              <div className={showAllVideos ? "space-y-3" : "grid grid-cols-2 gap-3"}>
                {(showAllVideos ? youtubeLinks : youtubeLinks.slice(0, 4)).map((video, index) => {
                  const videoId = extractVideoId(video.url);
                  const thumbnailUrl = videoId
                    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                    : "https://via.placeholder.com/640x360?text=No+Thumbnail";

                  return (
                    <div
                      key={`${video.url}-${index}`}
                      className={`relative rounded-lg overflow-hidden cursor-pointer group border border-gray-200 hover:border-indigo-300 transition ${
                        showAllVideos ? 'w-full' : ''
                      }`}
                      onClick={() => handleOpenPopup(video)}
                    >
                      <img
                        src={thumbnailUrl}
                        alt={video.title || "Video thumbnail"}
                        className={`w-full object-cover ${showAllVideos ? 'h-40' : 'h-24'}`}
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition flex items-center justify-center">
                        <div className="bg-white rounded-full p-2">
                          <Play className="text-indigo-600 w-4 h-4" fill="currentColor" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className={`text-white text-xs ${showAllVideos ? 'line-clamp-3' : 'line-clamp-2'}`}>
                          {video.title}
                        </p>
                      </div>
                      <div className="absolute top-2 right-2">
                        <a 
                          href={video.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white/90 hover:bg-white rounded-full p-1"
                        >
                          <ExternalLink className="w-3 h-3 text-gray-700" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-sm text-center py-4">
                No videos available yet.
              </p>
            )}
          </div>
        </div>

        {/* Related Articles Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <button
            onClick={() => setIsArticlesExpanded(!isArticlesExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-gray-600" />
              <span className="text-sm font-semibold text-gray-800">Related Articles</span>
            </div>
            <Plus 
              size={18} 
              className={`text-gray-600 transition-transform ${isArticlesExpanded ? 'rotate-45' : ''}`} 
            />
          </button>
          
          {isArticlesExpanded && (
            <div className="px-4 pb-4 space-y-2">
              {relatedArticles.length > 0 ? (
                relatedArticles.map((article, index) => (
                  <a
                    key={index}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition group"
                  >
                    <p className="text-sm font-medium text-gray-800 mb-1 group-hover:text-indigo-700">
                      {article.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{article.source}</p>
                      <ExternalLink size={12} className="text-gray-400 group-hover:text-indigo-600" />
                    </div>
                  </a>
                ))
              ) : (
                <p className="text-sm text-gray-600 py-2">
                  No related articles available.
                </p>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full relative">
            <button
              onClick={handleClosePopup}
              className="absolute -top-3 -right-3 bg-white hover:bg-gray-100 text-gray-700 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition z-10"
            >
              <span className="text-xl font-bold">×</span>
            </button>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {selectedVideo.title}
              </h3>
              <div className="relative w-full h-0 pb-[56.25%]">
                <iframe
                  src={`https://www.youtube.com/embed/${extractVideoId(
                    selectedVideo.url
                  )}`}
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="absolute rounded-lg top-0 left-0 w-full h-full"
                  title={selectedVideo.title}
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightNav;