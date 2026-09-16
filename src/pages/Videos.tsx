import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// const videos = [
//   { id: 1, title: "Python for Absolute Beginners", instructor: "Maya Chen", duration: "24:15", views: "142K", likes: "8.4K", tag: "Python", thumb: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=480&h=270&fit=crop&auto=format", date: "3 days ago" },
//   { id: 2, title: "JavaScript Arrow Functions Explained", instructor: "Alex Rivera", duration: "18:42", views: "98K", likes: "6.1K", tag: "JavaScript", thumb: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=480&h=270&fit=crop&auto=format", date: "1 week ago" },
//   { id: 3, title: "Mastering React Hooks: useState & useEffect", instructor: "Priya Patel", duration: "32:08", views: "87K", likes: "5.9K", tag: "React", thumb: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=480&h=270&fit=crop&auto=format", date: "2 weeks ago" },
//   { id: 4, title: "Binary Search — Step by Step", instructor: "Jordan Kim", duration: "15:30", views: "76K", likes: "4.8K", tag: "DSA", thumb: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=480&h=270&fit=crop&auto=format", date: "2 weeks ago" },
//   { id: 5, title: "CSS Grid vs Flexbox — When to Use Each", instructor: "Sam Torres", duration: "21:45", views: "65K", likes: "4.2K", tag: "CSS", thumb: "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=480&h=270&fit=crop&auto=format", date: "3 weeks ago" },
//   { id: 6, title: "SQL JOINs Explained Visually", instructor: "Lena Müller", duration: "19:20", views: "54K", likes: "3.7K", tag: "SQL", thumb: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=480&h=270&fit=crop&auto=format", date: "1 month ago" },
//   { id: 7, title: "Dynamic Programming: Top-Down vs Bottom-Up", instructor: "Rahul Sharma", duration: "38:15", views: "49K", likes: "3.5K", tag: "DSA", thumb: "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=480&h=270&fit=crop&auto=format", date: "1 month ago" },
//   { id: 8, title: "Java OOP: Classes, Interfaces & Inheritance", instructor: "Aisha Johnson", duration: "27:33", views: "41K", likes: "2.9K", tag: "Java", thumb: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=480&h=270&fit=crop&auto=format", date: "2 months ago" },
// ];

// const [videos, setVideos] = useState<Video[]>([]);

const tags = ["All", "Python", "JavaScript", "React", "DSA", "Java", "CSS", "SQL", "HTML", "Django"];

// const selectedVideo = videos[0];



export default function Videos() {
  const [activeTag, setActiveTag] = useState("All");
  const [view, setView] = useState<"list" | "watch">("list");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
      loadVideos();
  }, []);

  const loadVideos = async () => {
      try {
          const response = await getVideos();

          setVideos(response);
      } catch (error) {
          console.error(error);
      }
  };

  const filtered = videos.filter(v => activeTag === "All" || v.tag === activeTag);

  if (view === "watch") {
  
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Video Lessons</h1>
        <p className="text-slate-500">High-quality video tutorials by expert instructors</p>
      </div>

      {/* Continue watching */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row gap-5 items-center">
        <div className="relative w-32 h-20 rounded-xl overflow-hidden shrink-0">
          <img src={selectedVideo.thumb} alt="" className="w-full h-full object-cover" />
          <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-xs px-1 rounded font-mono">{selectedVideo.duration}</div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-white w-1/3" />
          </div>
        </div>
        <div className="flex-1 text-white">
          <p className="text-xs text-indigo-200 mb-1">Continue watching</p>
          <h3 className="font-bold text-lg leading-snug" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{selectedVideo.title}</h3>
          <p className="text-indigo-200 text-sm mt-1">{selectedVideo.instructor} &u+2022 33% completed</p>
        </div>
        <button onClick={() => setView("watch")} className="bg-white text-indigo-600 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition-colors shrink-0">
          Resume 
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
          </svg>
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tags.map(t => (
          <button
            key={t}
            onClick={() => setActiveTag(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTag === t ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map(v => (
          <button key={v.id} onClick={() => setView("watch")} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all text-left">
            <div className="relative h-36 overflow-hidden bg-slate-200">
              <img src={v.thumb} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">{v.duration}</div>
              <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">{v.tag}</div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1 group-hover:text-indigo-600 transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{v.title}</h3>
              <p className="text-xs text-slate-500 mb-2">{v.instructor}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                  </svg>
                  {v.views}</span>
                <span>
                  
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
                  <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
                </svg>
                  
                   {v.likes}</span>
                <span>{v.date}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
