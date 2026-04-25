import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ease = [0.25, 0.1, 0.25, 1];

// =========================================================
// --- ROUTER SETUP ---
// =========================================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RFMWedding />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

// =========================================================
// --- FULLY DYNAMIC ADMIN PORTAL ---
// =========================================================
function AdminPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // States for All Dynamic Sections
  const [heroVideo, setHeroVideo] = useState("");
  const [youtubeIds, setYoutubeIds] = useState(["", "", "", ""]);
  const [featuredStoryImg, setFeaturedStoryImg] = useState("");
  const [showcaseImg, setShowcaseImg] = useState("");
  const [studioImg, setStudioImg] = useState("");
  
  const [visualNovelUrls, setVisualNovelUrls] = useState(Array(8).fill(""));
  const [portraitUrls, setPortraitUrls] = useState(Array(8).fill(""));
  const [archiveUrls, setArchiveUrls] = useState(Array(4).fill(""));
  const [destinationUrls, setDestinationUrls] = useState(Array(4).fill(""));

  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  // --- CLOUDINARY CREDENTIALS (YAHAN APNI DETAILS DAALEN) ---
  const CLOUDINARY_CLOUD_NAME = "daynxtwxm"; // Apna Cloud Name daalein
  const CLOUDINARY_UPLOAD_PRESET = "rfm_website_preset"; // Apna Preset daalein

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoggedIn(true);
      fetchData();
    } catch (err) {
      setError("Incorrect Access Credentials.");
    }
  };

  const fetchData = async () => {
    const docRef = doc(db, "siteData", "mainContent");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.heroVideo) setHeroVideo(data.heroVideo);
      if (data.youtubeIds) setYoutubeIds(data.youtubeIds);
      if (data.featuredStoryImg) setFeaturedStoryImg(data.featuredStoryImg);
      if (data.showcaseImg) setShowcaseImg(data.showcaseImg);
      if (data.studioImg) setStudioImg(data.studioImg);
      if (data.visualNovelUrls) setVisualNovelUrls(data.visualNovelUrls);
      if (data.portraitUrls) setPortraitUrls(data.portraitUrls);
      if (data.archiveUrls) setArchiveUrls(data.archiveUrls);
      if (data.destinationUrls) setDestinationUrls(data.destinationUrls);
    }
  };

  const handleCloudinaryUpload = async (file, type, fieldKey, index = null) => {
    if (!file) return;
    setUploadProgress(`Uploading... Please wait.`);
    setIsSaving(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const resourceType = type === "video" ? "video" : "image";

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (data.secure_url) {
        if (index !== null) {
          if (fieldKey === "visualNovelUrls") { const n = [...visualNovelUrls]; n[index] = data.secure_url; setVisualNovelUrls(n); }
          else if (fieldKey === "portraitUrls") { const n = [...portraitUrls]; n[index] = data.secure_url; setPortraitUrls(n); }
          else if (fieldKey === "archiveUrls") { const n = [...archiveUrls]; n[index] = data.secure_url; setArchiveUrls(n); }
          else if (fieldKey === "destinationUrls") { const n = [...destinationUrls]; n[index] = data.secure_url; setDestinationUrls(n); }
        } else {
          if (fieldKey === "heroVideo") setHeroVideo(data.secure_url);
          else if (fieldKey === "featuredStoryImg") setFeaturedStoryImg(data.secure_url);
          else if (fieldKey === "showcaseImg") setShowcaseImg(data.secure_url);
          else if (fieldKey === "studioImg") setStudioImg(data.secure_url);
        }
        setUploadProgress(null);
        alert(`Uploaded Successfully! Click 'Publish Changes' at the bottom.`);
      } else {
         alert("Upload failed. Please check Cloudinary Settings.");
         setUploadProgress(null);
      }
    } catch (err) {
      console.error(err);
      alert("Error during upload.");
      setUploadProgress(null);
    }
    setIsSaving(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "siteData", "mainContent"), {
        heroVideo, youtubeIds, featuredStoryImg, showcaseImg, studioImg,
        visualNovelUrls, portraitUrls, archiveUrls, destinationUrls
      }, { merge: true });
      alert("Changes Published Successfully!");
    } catch (err) {
      alert("Failed to save to database. Check Firestore Rules.");
    }
    setIsSaving(false);
  };

  const InfoText = ({text}) => <p className="text-[9px] uppercase tracking-widest text-white/40 mb-4">{text}</p>;

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
        <div className="max-w-6xl mx-auto pb-32">
          <div className="flex justify-between items-center border-b border-white/20 pb-8 mb-12">
            <h2 className="text-4xl font-serif">RFM. Control</h2>
            <button onClick={() => setIsLoggedIn(false)} className="text-[10px] uppercase tracking-widest border border-white/20 px-4 py-2 hover:bg-white hover:text-black">Logout</button>
          </div>

          {uploadProgress && (
            <div className="bg-white/10 border border-white/20 p-4 mb-8 text-center text-xs tracking-widest uppercase animate-pulse">
              {uploadProgress}
            </div>
          )}

          {/* VIDEOS SECTION */}
          <div className="mb-20">
            <h3 className="text-2xl font-serif mb-6 border-b border-white/10 pb-4">A. Video Content</h3>
            <div className="mb-10">
               <h4 className="text-lg font-serif mb-2">1. Main Hero Background Video</h4>
               <InfoText text="Format: MP4 | Size: Max 5MB | Aspect Ratio: 16:9 (Landscape)" />
               <div className="flex flex-col gap-4 max-w-md">
                  {heroVideo && <p className="text-[9px] text-white/50 break-all">Current: {heroVideo}</p>}
                  <label className="border border-white/20 p-4 text-center cursor-pointer hover:bg-white/10">
                     <span className="text-[10px] uppercase tracking-widest">Select Video File</span>
                     <input type="file" className="hidden" accept="video/mp4,video/webm" onChange={(e) => handleCloudinaryUpload(e.target.files[0], "video", "heroVideo")} />
                  </label>
               </div>
            </div>
            <div>
               <h4 className="text-lg font-serif mb-2">2. Featured Films (YouTube)</h4>
               <InfoText text="Format: 11-Character ID (e.g., KxJ449yAWnE)" />
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 {youtubeIds.map((id, i) => (
                   <input key={i} type="text" value={id} onChange={(e) => { const n = [...youtubeIds]; n[i] = e.target.value; setYoutubeIds(n); }} className="bg-[#0A0A0A] border border-white/20 p-4 text-xs focus:border-white outline-none" placeholder={`Video 0${i+1} ID`} />
                 ))}
               </div>
            </div>
          </div>

          {/* SINGLE IMAGES SECTION */}
          <div className="mb-20">
            <h3 className="text-2xl font-serif mb-6 border-b border-white/10 pb-4">B. Single Banner Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div>
                 <h4 className="text-lg font-serif mb-2">Featured Story Palace</h4>
                 <InfoText text="Ratio: 16:9 Landscape | Size: Max 400KB" />
                 <div className="aspect-video bg-[#111] border border-white/10 mb-4 overflow-hidden">
                   {featuredStoryImg ? <img src={featuredStoryImg} className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center text-[9px]">No Image</span>}
                 </div>
                 <label className="block border border-white/20 p-3 text-center cursor-pointer hover:bg-white/10 text-[9px] uppercase tracking-widest">
                   Upload Image <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCloudinaryUpload(e.target.files[0], "image", "featuredStoryImg")} />
                 </label>
               </div>
               <div>
                 <h4 className="text-lg font-serif mb-2">Massive Showcase Parallax</h4>
                 <InfoText text="Ratio: 16:9 High-Res | Size: Max 800KB" />
                 <div className="aspect-video bg-[#111] border border-white/10 mb-4 overflow-hidden">
                   {showcaseImg ? <img src={showcaseImg} className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center text-[9px]">No Image</span>}
                 </div>
                 <label className="block border border-white/20 p-3 text-center cursor-pointer hover:bg-white/10 text-[9px] uppercase tracking-widest">
                   Upload Image <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCloudinaryUpload(e.target.files[0], "image", "showcaseImg")} />
                 </label>
               </div>
               <div>
                 <h4 className="text-lg font-serif mb-2">Studio Founder Portrait</h4>
                 <InfoText text="Ratio: 4:5 Portrait | Size: Max 400KB" />
                 <div className="aspect-[4/5] w-3/4 bg-[#111] border border-white/10 mb-4 overflow-hidden">
                   {studioImg ? <img src={studioImg} className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center text-[9px]">No Image</span>}
                 </div>
                 <label className="block w-3/4 border border-white/20 p-3 text-center cursor-pointer hover:bg-white/10 text-[9px] uppercase tracking-widest">
                   Upload Image <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCloudinaryUpload(e.target.files[0], "image", "studioImg")} />
                 </label>
               </div>
            </div>
          </div>

          {/* GALLERIES SECTION */}
          <div className="mb-20">
            <h3 className="text-2xl font-serif mb-6 border-b border-white/10 pb-4">C. Dynamic Galleries</h3>
            <div className="mb-12">
               <h4 className="text-lg font-serif mb-2">1. Visual Novels (8 Images)</h4>
               <InfoText text="Ratio: 16:9 Landscape | Format: WebP/JPG | Size: Max 400KB each" />
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {visualNovelUrls.map((url, i) => (
                   <div key={i} className="flex flex-col gap-2">
                     <div className="aspect-video bg-[#111] border border-white/10 overflow-hidden">
                       {url ? <img src={url} className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center text-[9px]">Novel 0{i+1}</span>}
                     </div>
                     <label className="bg-white text-black p-2 text-center cursor-pointer hover:bg-white/80 text-[8px] uppercase tracking-widest">Upload <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCloudinaryUpload(e.target.files[0], "image", "visualNovelUrls", i)} /></label>
                   </div>
                 ))}
               </div>
            </div>
            <div className="mb-12">
               <h4 className="text-lg font-serif mb-2">2. The Archive (4 Images)</h4>
               <InfoText text="Ratio: 4:5 Portrait | Format: WebP/JPG | Size: Max 400KB each" />
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {archiveUrls.map((url, i) => (
                   <div key={i} className="flex flex-col gap-2">
                     <div className="aspect-[4/5] bg-[#111] border border-white/10 overflow-hidden">
                       {url ? <img src={url} className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center text-[9px]">Archive 0{i+1}</span>}
                     </div>
                     <label className="bg-white text-black p-2 text-center cursor-pointer hover:bg-white/80 text-[8px] uppercase tracking-widest">Upload <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCloudinaryUpload(e.target.files[0], "image", "archiveUrls", i)} /></label>
                   </div>
                 ))}
               </div>
            </div>
            <div className="mb-12">
               <h4 className="text-lg font-serif mb-2">3. Editorial Portraits (8 Images)</h4>
               <InfoText text="Ratio: 9:16 Vertical (Story Size) | Format: WebP/JPG | Size: Max 400KB each" />
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {portraitUrls.map((url, i) => (
                   <div key={i} className="flex flex-col gap-2">
                     <div className="aspect-[9/16] w-2/3 bg-[#111] border border-white/10 overflow-hidden">
                       {url ? <img src={url} className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center text-[9px] text-center">Portrait 0{i+1}</span>}
                     </div>
                     <label className="bg-white text-black w-2/3 p-2 text-center cursor-pointer hover:bg-white/80 text-[8px] uppercase tracking-widest">Upload <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCloudinaryUpload(e.target.files[0], "image", "portraitUrls", i)} /></label>
                   </div>
                 ))}
               </div>
            </div>
            <div className="mb-12">
               <h4 className="text-lg font-serif mb-2">4. Destinations (4 Images)</h4>
               <InfoText text="Ratio: 1:1 Square | Format: WebP/JPG | Size: Max 300KB each" />
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {destinationUrls.map((url, i) => (
                   <div key={i} className="flex flex-col gap-2">
                     <div className="aspect-square bg-[#111] border border-white/10 overflow-hidden">
                       {url ? <img src={url} className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center text-[9px]">Place 0{i+1}</span>}
                     </div>
                     <label className="bg-white text-black p-2 text-center cursor-pointer hover:bg-white/80 text-[8px] uppercase tracking-widest">Upload <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCloudinaryUpload(e.target.files[0], "image", "destinationUrls", i)} /></label>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 w-full bg-black border-t border-white/10 p-6 flex justify-center z-50">
            <button onClick={handleSave} disabled={isSaving} className="bg-white text-black px-12 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white/80 w-full max-w-sm">
              {isSaving ? "Publishing..." : "Publish Changes"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <form onSubmit={handleLogin} className="w-full max-w-md p-10 border border-white/10 bg-[#0A0A0A] flex flex-col gap-8">
        <h2 className="text-4xl font-serif text-center">RFM.</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent border-b border-white/20 pb-3 text-sm focus:border-white outline-none" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-transparent border-b border-white/20 pb-3 text-sm focus:border-white outline-none" required />
        <button type="submit" className="bg-white text-black py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-white/80">Access Portal</button>
      </form>
    </div>
  );
}

// =========================================================
// --- MAIN WEBSITE COMPONENT ---
// =========================================================
function RFMWedding() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className="bg-white text-black font-sans selection:bg-black selection:text-white min-h-screen overflow-x-hidden">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-black origin-left z-50" style={{ scaleX }} />
      <Navbar />
      <HeroSection />
      <PrologueSection />
      <ManifestoSection />
      <FeaturedStory />
      <VisualNovelsSection />
      <ShowcaseSection /> 
      <PhilosophySection />
      <EditorialArchive />
      <ImageBreakSection />
      <AccoladesSection />
      <DestinationsSection />
      <FeaturedFilm />
      <StudioSection />
      <InvestmentSection />
      <StudioMapSection />
      <FooterSection />
      <WhatsAppButton />
    </div>
  );
}

// --- 1. NAVBAR ---
function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <nav className="fixed top-0 w-full px-6 py-6 md:px-12 md:py-8 flex items-start justify-between z-50 mix-blend-difference text-white">
        <div className="hidden md:flex flex-1 items-center gap-6 mt-3">
          <a href="https://www.instagram.com/rfm_wedding_photography/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          <a href="https://www.youtube.com/@RFMWEDDINGPHOTOGRAPHY-z5t" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.1C2.5 7.1 2.3 5.4 3.1 4.6 4.1 3.6 5.3 3.6 5.8 3.5 8.4 3.3 12 3.3 12 3.3s3.6 0 6.2.2c.5.1 1.7.1 2.7 1.1.8.8.9 2.5.9 2.5s.2 2 .2 4v1.8c0 2-.2 4-.2 4s-.2 1.7-1 2.5c-1 1-2.2 1-2.8 1.1-3 .3-6.2.3-6.2.3s-3.6 0-6.2-.2c-.5-.1-1.7-.1-2.7-1.1-.8-.8-.9-2.5-.9-2.5s-.2-2-.2-4V9.1c0-2 .2-4 .2-4z"/><path d="M9.8 15L15.5 11.1 9.8 7.3z"/></svg>
          </a>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <a href="/" className="mb-4 hover:opacity-80 flex justify-center transition-opacity">
            <svg viewBox="0 0 300 80" className="w-[140px] md:w-[190px] h-auto fill-current text-white"><text x="50%" y="45" textAnchor="middle" fontFamily='"Playfair Display", serif' fontSize="46" fontWeight="500" letterSpacing="0.08em">RFM.</text><text x="50%" y="70" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fontWeight="500" letterSpacing="0.6em">PHOTOGRAPHY</text></svg>
          </a>
          <div className="hidden md:flex justify-center gap-8 md:gap-12 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-medium">
            <a href="/#films" className="hover:opacity-60 transition-opacity">Films</a><a href="/#archive" className="hover:opacity-60 transition-opacity">Archive</a><a href="/#about" className="hover:opacity-60 transition-opacity">About Us</a><a href="/#destinations" className="hover:opacity-60 transition-opacity">Destinations</a>
          </div>
        </div>
        <div className="flex-1 flex justify-end items-center mt-3">
          <a href="/#inquire" className="hidden md:block text-[10px] uppercase tracking-[0.2em] font-medium hover:opacity-60 transition-opacity">Inquire</a>
          <button onClick={() => setIsOpen(true)} className="md:hidden text-white flex items-center gap-2">
             <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Menu</span>
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
      </nav>
      {isOpen && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center text-white px-6">
          <button onClick={() => setIsOpen(false)} className="absolute top-8 right-6 text-[10px] uppercase tracking-[0.2em] font-medium flex items-center gap-2">CLOSE <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg></button>
          <div className="flex flex-col items-center gap-8 text-4xl" style={{ fontFamily: '"Playfair Display", serif' }}>
            <a href="/#films" onClick={() => setIsOpen(false)} className="hover:opacity-70 transition-opacity">Films</a>
            <a href="/#archive" onClick={() => setIsOpen(false)} className="hover:opacity-70 transition-opacity">Archive</a>
            <a href="/#about" onClick={() => setIsOpen(false)} className="hover:opacity-70 transition-opacity">About Us</a>
            <a href="/#destinations" onClick={() => setIsOpen(false)} className="hover:opacity-70 transition-opacity">Destinations</a>
            <a href="/#inquire" onClick={() => setIsOpen(false)} className="mt-6 text-xl uppercase tracking-widest font-sans border-b border-white/30 pb-2 transition-opacity">Inquire Now</a>
          </div>
        </div>
      )}
    </>
  );
}

// --- 2. HERO SECTION ---
function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200]);
  const [heroUrl, setHeroUrl] = React.useState("");
  React.useEffect(() => { getDoc(doc(db, "siteData", "mainContent")).then(s => { if(s.exists() && s.data().heroVideo) setHeroUrl(s.data().heroVideo) }) }, []);

  return (
    <section className="relative w-full h-[40vh] md:h-[110vh] overflow-hidden bg-black z-10">
      <motion.div style={{ y }} className="absolute inset-0 w-full h-full md:h-[120%] opacity-90">
        {heroUrl ? (
          <video src={heroUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center border border-white/10"><span className="text-white/50 tracking-[0.2em] uppercase text-[9px] md:text-xs text-center px-4">[ Hero Cinematic Video Placeholder ]</span></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      </motion.div>
      <div className="absolute inset-x-0 bottom-16 md:bottom-32 flex flex-col items-center justify-center text-center px-4 text-white z-10">
        <h1 className="text-2xl md:text-4xl lg:text-[2.5rem] leading-snug font-normal tracking-wide mb-6 md:mb-8 drop-shadow-md" style={{ fontFamily: '"Playfair Display", serif' }}>
          <span className="italic font-light">Poetry in</span> Motion.
        </h1>
        <a href="#archive" className="pointer-events-auto text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-medium border border-white/40 px-8 py-3 md:px-10 md:py-4 hover:bg-white hover:text-black transition-all duration-500 backdrop-blur-sm">
          A Curated Collection
        </a>
      </div>
    </section>
  );
}

// --- 3. PROLOGUE (UPDATED WITH CLIENT'S ABOUT US) ---
function PrologueSection() {
  return (
    <section className="relative w-full bg-white px-6 md:px-24 h-[40vh] md:h-auto md:py-48 flex items-center z-20">
      <div className="absolute top-0 left-0 w-full leading-none -translate-y-[98%] pointer-events-none"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-[15px] md:h-[70px] block"><path d="M0,100 L50,60 L100,100 Z" fill="white" /></svg></div>
      <div className="w-full max-w-5xl mx-auto text-center flex flex-col items-center justify-center pt-2 md:pt-0">
        <p className="text-[7px] md:text-[10px] uppercase tracking-[0.3em] font-semibold text-black/50 mb-4 md:mb-10">[ 01 ] Prologue</p>
        
        <h2 className="text-lg md:text-3xl lg:text-4xl leading-[1.5] md:leading-[1.6] text-black font-medium mb-6 md:mb-10" style={{ fontFamily: '"Playfair Display", serif' }}>
          At RFM Wedding Photography, we believe every wedding is not just an event, but a <span className="italic font-light">beautiful story</span> waiting to be told.
        </h2>
        
        <p className="text-xs md:text-base text-black/60 max-w-4xl leading-relaxed">
          Based in Rajasthan, we specialize in capturing timeless, emotional, and cinematic moments. From the vibrant colors of Haldi and Mehndi to the grand elegance of the wedding day, we don’t just take photos — we capture feelings, traditions, and the magic of your special day.
        </p>
      </div>
    </section>
  );
}

// --- 4. MANIFESTO ---
function ManifestoSection() {
  return (
    <section className="relative w-full bg-black text-white px-6 md:px-24 h-[25vh] md:h-auto md:py-48 flex items-center justify-center z-30">
      <div className="absolute top-0 left-0 w-full leading-none -translate-y-[98%] pointer-events-none"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-[15px] md:h-[70px] block"><path d="M0,100 L0,0 L50,40 L100,0 L100,100 Z" fill="black" /></svg></div>
      <p className="text-[10px] md:text-3xl lg:text-4xl max-w-4xl leading-[1.4] italic font-light text-center pt-2 md:pt-0" style={{ fontFamily: '"Playfair Display", serif' }}>
        "To capture a wedding is to distill an era. The chaotic joy, the quiet glances, all woven into a cinematic masterpiece."
      </p>
    </section>
  );
}

// --- 5. FEATURED STORY ---
function FeaturedStory() {
  const [img, setImg] = React.useState("");
  React.useEffect(() => { getDoc(doc(db, "siteData", "mainContent")).then(s => { if(s.exists() && s.data().featuredStoryImg) setImg(s.data().featuredStoryImg) }) }, []);

  return (
    <section className="py-32 px-8 md:px-24 bg-white">
      <div className="flex flex-col md:flex-row gap-16 items-center">
        <div className="w-full md:w-1/2 h-[70vh] bg-black relative overflow-hidden">
          {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><span className="text-white/40 tracking-[0.2em] uppercase text-[10px]">[ Featured Palace Image ]</span></div>}
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-8">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold border-b border-black/20 pb-2 w-fit text-black">Latest Editorial</span>
          <h3 className="font-serif text-5xl md:text-7xl tracking-tight text-black">A Royal Symphony at Umaid Bhawan.</h3>
          
          {/* Button ko Anchor tag banaya aur #films par redirect kiya */}
          <a href="#films" className="text-[10px] uppercase tracking-[0.2em] font-semibold self-start border border-black px-6 py-3 text-black hover:bg-black hover:text-white transition-colors inline-block text-center cursor-pointer">
            View Story
          </a>
          
        </div>
      </div>
    </section>
  );
}

// --- 6. VISUAL NOVELS ---
function VisualNovelsSection() {
  const [urls, setUrls] = React.useState(Array(8).fill(""));
  React.useEffect(() => { getDoc(doc(db, "siteData", "mainContent")).then(s => { if(s.exists() && s.data().visualNovelUrls) setUrls(s.data().visualNovelUrls) }) }, []);
  const frames = [{ label: "The Royal Baraat" }, { label: "Whispers of Mehendi" }, { label: "Heirloom Jewels" }, { label: "Vows under the Stars" }, { label: "The Blue City Sendoff" }, { label: "Palace Portraits" }, { label: "Haldi Morning" }, { label: "Sangeet Night" }];
  const loopFrames = [...frames, ...frames, ...frames];
  const loopUrls = [...urls, ...urls, ...urls];

  return (
    <section id="archive" className="py-24 md:py-40 bg-white overflow-hidden relative z-20">
      <style>{`.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <div className="px-6 md:px-24 mb-10 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <h3 className="text-5xl md:text-7xl tracking-tight text-black font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>Visual Novels</h3>
        <div className="flex gap-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-black/60"><span>Scroll</span><span>→</span></div>
      </div>
      <div className="pl-6 md:pl-24 w-full">
        <div className="flex gap-4 md:gap-6 overflow-x-auto hide-scroll pb-8 pr-6 md:pr-24 snap-x snap-mandatory">
          {loopFrames.map((frame, index) => (
            <div key={index} className="w-[85vw] md:w-[45vw] h-[55vh] md:h-[65vh] relative group flex flex-col justify-between shrink-0 snap-center md:snap-start">
               <div className="w-full h-full bg-black relative overflow-hidden border border-black/5">
                 {loopUrls[index] ? <img src={loopUrls[index]} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" /> : <span className="absolute inset-0 flex items-center justify-center text-white/40 tracking-[0.2em] uppercase text-[10px] px-4 text-center z-10">[ Frame: {frame.label} ]</span>}
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
               </div>
               <div className="flex justify-between w-full text-[9px] md:text-[10px] uppercase tracking-[0.2em] mt-4 font-semibold text-black">
                 <span>Chapter 0{(index % 8) + 1}</span><span className="hover:opacity-60 transition-opacity cursor-pointer">Explore ↗</span>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 16. CINEMATIC SHOWCASE ---
function ShowcaseSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const [img, setImg] = React.useState("");
  React.useEffect(() => { getDoc(doc(db, "siteData", "mainContent")).then(s => { if(s.exists() && s.data().showcaseImg) setImg(s.data().showcaseImg) }) }, []);

  return (
    <section ref={ref} className="relative w-full h-[120vh] md:h-[180vh] overflow-hidden bg-white z-20 border-t border-black/10">
      <div className="absolute inset-0 w-full h-full">
        <motion.div style={{ y }} className="relative w-full h-[140%] top-[-20%]">
          {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-black flex items-center justify-center"><span className="text-white/30 tracking-[0.3em] uppercase text-xs md:text-sm font-bold px-10 text-center">[ Massive Showcase Parallax ]</span></div>}
        </motion.div>
      </div>
      <div className="absolute bottom-12 md:bottom-24 left-6 md:left-24 z-30 text-white mix-blend-difference">
        <p className="text-[10px] uppercase tracking-[0.4em] mb-4 opacity-70">Editorial Showcase</p>
        <h3 className="font-serif text-3xl md:text-5xl italic font-light tracking-tight">The Art of the Heirloom</h3>
      </div>
    </section>
  );
}

// --- 7. PHILOSOPHY ---
function PhilosophySection() {
  return (
    <section className="py-32 md:py-48 px-8 md:px-24 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 border-t border-black/20 pt-16">
        {['The Approach', 'The Aesthetic', 'The Delivery'].map((title, i) => (
          <div key={i} className="flex flex-col gap-6">
            <h4 className="font-serif text-3xl italic text-black">{title}</h4>
            <p className="text-sm leading-relaxed text-black/70">We blend the raw authenticity of documentary journalism with the polished grandeur of high-fashion editorials. Every frame is deliberate, every lighting choice intentional.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- 8. EDITORIAL ARCHIVE ---
function EditorialArchive() {
  const [activeTab, setActiveTab] = React.useState('Wedding');
  const categories = ['Pre-Wedding', 'Wedding', 'Editorials', 'Details'];
  const [urls, setUrls] = React.useState(Array(4).fill(""));
  React.useEffect(() => { getDoc(doc(db, "siteData", "mainContent")).then(s => { if(s.exists() && s.data().archiveUrls) setUrls(s.data().archiveUrls) }) }, []);

  return (
    <section className="relative w-full bg-white px-6 md:px-24 py-32 md:py-48 z-20 overflow-hidden">
      <div className="mb-16 md:mb-24 text-center flex flex-col items-center">
        <h3 className="text-5xl md:text-7xl tracking-tight mb-8 font-bold text-black" style={{ fontFamily: '"Playfair Display", serif' }}>The Archive</h3>
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-semibold text-black/50">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveTab(cat)} className={`pb-2 border-b transition-all duration-500 ${activeTab === cat ? 'border-black text-black' : 'border-transparent hover:text-black'}`}>{cat}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {[1, 2, 3, 4].map((num, i) => (
          <motion.div key={`${activeTab}-${num}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: num * 0.1, ease: [0.25, 0.1, 0.25, 1] }} className={`w-full bg-black relative flex items-center justify-center overflow-hidden group cursor-pointer ${num === 1 || num === 4 ? 'h-[50vh] md:h-[75vh]' : 'h-[40vh] md:h-[55vh]'}`}>
             {urls[i] ? <img src={urls[i]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" /> : <span className="text-white/40 tracking-[0.2em] uppercase text-[10px] z-10">[ {activeTab} Image 0{num} ]</span>}
          </motion.div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 w-full leading-none translate-y-[2px] pointer-events-none"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-[40px] md:h-[120px] block"><path d="M0,100 L100,30 L100,100 Z" fill="black" /></svg></div>
    </section>
  );
}

// --- 9. EDITORIAL PORTRAITS ---
function ImageBreakSection() {
  const [urls, setUrls] = useState(Array(8).fill(""));
  React.useEffect(() => { getDoc(doc(db, "siteData", "mainContent")).then(s => { if (s.exists() && s.data().portraitUrls) setUrls(s.data().portraitUrls) }) }, []);
  const loopImages = [...urls, ...urls, ...urls];

  return (
    <section className="py-24 md:py-40 bg-black overflow-hidden relative z-20">
      <style>{`.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <div className="px-6 md:px-24 mb-10 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 text-white">
        <h3 className="text-5xl md:text-7xl tracking-tight font-bold font-serif">Editorial <span className="italic font-light opacity-60">Portraits</span></h3>
        <div className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-50">Scroll →</div>
      </div>
      <div className="pl-6 md:pl-24 w-full">
        <div className="flex gap-4 md:gap-6 overflow-x-auto hide-scroll pb-8 pr-6 md:pr-24 snap-x snap-mandatory">
          {loopImages.map((url, index) => (
            <div key={index} className="w-[75vw] md:w-[22vw] aspect-[9/16] bg-[#111] relative group overflow-hidden shrink-0 border border-white/5 snap-center md:snap-start">
               {url ? <img src={url} className="w-full h-full object-cover grayscale-0 md:grayscale hover:grayscale-0 transition-all duration-1000" /> : <span className="absolute inset-0 flex items-center justify-center text-white/20 tracking-[0.2em] uppercase text-[10px]">Photo Coming Soon</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 10. ACCOLADES ---
function AccoladesSection() {
  return (
    <section className="py-24 bg-black text-white px-8 border-b border-white/10 border-t border-white/10">
      <div className="flex flex-wrap justify-center gap-16 opacity-60 text-xs tracking-[0.3em] uppercase font-serif">
        <span>Featured in Vogue</span><span>Harper's Bazaar</span><span>Awwwards SOTD</span><span>Wedded Wonderland</span>
      </div>
    </section>
  );
}

// --- 11. DESTINATIONS ---
function DestinationsSection() {
  const [urls, setUrls] = React.useState(Array(4).fill(""));
  React.useEffect(() => { getDoc(doc(db, "siteData", "mainContent")).then(s => { if(s.exists() && s.data().destinationUrls) setUrls(s.data().destinationUrls) }) }, []);

  return (
    <section id="destinations" className="py-32 px-8 md:px-24 bg-white">
       <div className="mb-16"><h3 className="font-serif text-4xl md:text-6xl tracking-tight text-black">Destinations</h3></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Jodhpur', 'Udaipur', 'Jaipur', 'Lake Como'].map((place, i) => (
          <div key={i} className="aspect-square bg-black relative flex items-center justify-center group cursor-pointer overflow-hidden border border-black/5">
            {urls[i] ? <img src={urls[i]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" /> : <span className="text-white/40 tracking-[0.2em] uppercase text-[10px] z-10">[ {place} ]</span>}
            <div className="absolute inset-0 bg-black/90 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex items-center justify-center">
              <span className="text-white tracking-[0.2em] uppercase text-[10px]">{place}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- 12. FEATURED FILM ---
function FeaturedFilm() {
  const [activeVideo, setActiveVideo] = React.useState(0);
  const [videos, setVideos] = React.useState([{ id: "KxJ449yAWnE", title: "The Royal Symphony", location: "Jodhpur" }, { id: "_gv_OrH5rws", title: "Whispers of the Lake", location: "Udaipur" }, { id: "a4ADAhNWsP8", title: "A Heritage Tale", location: "Jaipur" }, { id: "nLGRqy013BM", title: "The Modern Dynasty", location: "New Delhi" }]);
  React.useEffect(() => { getDoc(doc(db, "siteData", "mainContent")).then(s => { if(s.exists() && s.data().youtubeIds) { const updated = videos.map((vid, i) => ({ ...vid, id: s.data().youtubeIds[i] || vid.id })); setVideos(updated); } }) }, []);

  return (
    <section className="py-32 px-6 md:px-24 bg-white z-20 relative" id="films">
       <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
         <h3 className="text-5xl md:text-7xl tracking-tight text-black font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>Cinematic <span className="italic font-light">Features</span></h3>
         <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-black/50 max-w-xs text-left md:text-right">Select a film below to experience our storytelling.</p>
       </div>
       <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
         <div className="w-full lg:w-3/4 aspect-video bg-black relative overflow-hidden rounded-sm shadow-2xl border border-black/10">
            <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${videos[activeVideo].id}?rel=0&modestbranding=1`} title={videos[activeVideo].title} frameBorder="0" allowFullScreen></iframe>
         </div>
         <div className="w-full lg:w-1/4 flex flex-col gap-6 justify-center">
            {videos.map((vid, index) => (
              <div key={index} onClick={() => setActiveVideo(index)} className={`cursor-pointer group border-b pb-4 transition-colors duration-500 ${activeVideo === index ? 'border-black' : 'border-black/20'}`}>
                <p className={`text-[10px] uppercase tracking-[0.2em] font-semibold mb-2 transition-colors duration-500 ${activeVideo === index ? 'text-black' : 'text-black/40 group-hover:text-black/70'}`}>[ 0{index + 1} ] &nbsp; {vid.location}</p>
                <h4 className={`text-2xl transition-colors duration-500 ${activeVideo === index ? 'text-black italic' : 'text-black/60 group-hover:text-black'}`} style={{ fontFamily: '"Playfair Display", serif' }}>{vid.title}</h4>
              </div>
            ))}
         </div>
       </div>
    </section>
  );
}

// --- 13. STUDIO SECTION (ENHANCED ABOUT US WITH CLIENT'S TEXT & KEYWORDS) ---
function StudioSection() {
  const [img, setImg] = React.useState("");
  React.useEffect(() => { getDoc(doc(db, "siteData", "mainContent")).then(s => { if(s.exists() && s.data().studioImg) setImg(s.data().studioImg) }) }, []);

  return (
    <section id="about" className="py-32 md:py-48 px-6 md:px-24 bg-white z-20 relative">
      <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-center max-w-7xl mx-auto">
        
        <div className="w-full md:w-5/12 flex flex-col items-start">
          <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-black/50 mb-6">About RFM</p>
          
          <h2 className="text-4xl md:text-6xl leading-[1.1] mb-8 text-black font-bold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
            Timeless. Emotional. <span className="italic font-light">Cinematic.</span>
          </h2>
          
          <p className="text-sm md:text-base leading-relaxed text-black/70 mb-4">
            Our team is passionate about turning real emotions into stunning visual memories. With a perfect blend of <span className="font-semibold text-black">traditional photography, candid shots, and cinematic filmmaking</span>, we create a complete wedding experience.
          </p>
          
          <p className="text-sm md:text-base leading-relaxed text-black/70 mb-8">
            Our goal is simple: to make your memories look as beautiful as they felt. We pride ourselves on delivering premium quality work with creativity and absolute professionalism.
          </p>
          
          {/* SEO Cities listed in a premium, subtle way */}
          <div className="mt-4 border-t border-black/10 pt-6 w-full">
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-black/40 mb-2">Documenting Love Across Rajasthan</p>
            <p className="text-[10px] uppercase tracking-[0.2em] leading-relaxed text-black/80 font-medium">
              Jodhpur • Pali • Jalore • Jaisalmer • Barmer • Jaipur • Udaipur • Ajmer • Pushkar
            </p>
          </div>
          
        </div>

        <div className="w-full md:w-7/12 h-[50vh] md:h-[70vh] bg-black flex items-center justify-center relative overflow-hidden group">
           {img ? <img src={img} className="w-full h-full object-cover" /> : <span className="text-white/40 tracking-[0.2em] uppercase text-[10px] z-10 text-center px-4">[ Studio / Founder Portrait Image ]</span>}
        </div>
        
      </div>
    </section>
  );
}

// --- 14. INVESTMENT & PREMIUM CONTACT FORM ---
function InvestmentSection() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const onChange = (dates) => { const [start, end] = dates; setStartDate(start); setEndDate(end); };

  return (
    <section id="inquire" className="relative w-full bg-white px-6 md:px-24 py-32 md:py-48 z-20">
      <div className="flex flex-col md:flex-row gap-16 md:gap-24 max-w-7xl mx-auto">
        <div className="w-full md:w-5/12 flex flex-col justify-start">
          <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-black/40 mb-6">Inquiry</p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl leading-[1.1] text-black mb-8 font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>Let's craft your <span className="italic font-light text-black/60">legacy.</span></h2>
          <p className="text-sm md:text-base leading-relaxed text-black/70 mb-8 max-w-md">Our collections are bespoke, tailored to the unique narrative of your celebration. Share your details, and we’ll reach out with a curated proposal.</p>
          <div className="mt-auto hidden md:block">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">Direct Correspondence</p>
            <p className="text-lg font-serif mt-2 text-black italic">inquire@rfmwedding.com</p>
          </div>
        </div>
        <div className="w-full md:w-7/12">
          <form className="flex flex-col gap-8 md:gap-10" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              <div className="w-full relative border-b border-black/10 focus-within:border-black transition-colors duration-500">
                <input type="text" placeholder="Your Name *" className="w-full bg-transparent pb-4 text-sm md:text-base outline-none placeholder:text-black/30" required />
              </div>
              <div className="w-full relative border-b border-black/10 focus-within:border-black transition-colors duration-500">
                <input type="email" placeholder="Email Address *" className="w-full bg-transparent pb-4 text-sm md:text-base outline-none placeholder:text-black/30" required />
              </div>
            </div>
            <div className="w-full relative border-b border-black/10 focus-within:border-black transition-colors duration-500 pb-2">
              <p className="text-[9px] uppercase tracking-widest text-black/40 mb-2">Event Date or Range</p>
              <DatePicker selected={startDate} onChange={onChange} startDate={startDate} endDate={endDate} selectsRange monthsShown={window.innerWidth > 768 ? 2 : 1} placeholderText="Select Date / Multi-day Event" className="w-full bg-transparent text-sm md:text-base outline-none cursor-pointer" dateFormat="dd MMM yyyy" />
              <svg className="absolute right-0 bottom-4 opacity-30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div className="w-full relative border-b border-black/10 focus-within:border-black transition-colors duration-500">
              <input type="text" placeholder="Venue & Destination" className="w-full bg-transparent pb-4 text-sm md:text-base outline-none placeholder:text-black/30" />
            </div>
            <div className="w-full relative border-b border-black/10 focus-within:border-black transition-colors duration-500">
              <textarea rows="2" placeholder="Tell us about your vision..." className="w-full bg-transparent pb-4 text-sm md:text-base outline-none placeholder:text-black/30 resize-none"></textarea>
            </div>
            <button type="submit" className="self-start group flex items-center gap-4 bg-black text-white px-10 py-5 text-[10px] uppercase tracking-[0.3em] font-medium hover:bg-black/90 transition-all mt-4">
              Request Brochure <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </form>
        </div>
      </div>
      <style>{`
        .react-datepicker { font-family: inherit; border: 1px solid #000 !important; border-radius: 0 !important; background: #fff !important; }
        .react-datepicker__header { background-color: #fff !important; border-bottom: 1px solid #eee !important; border-radius: 0 !important; padding-top: 15px !important; }
        .react-datepicker__day--selected, .react-datepicker__day--in-range, .react-datepicker__day--in-selecting-range { background-color: #000 !important; color: #fff !important; border-radius: 0 !important; }
        .react-datepicker__day:hover { border-radius: 0 !important; background-color: #f0f0f0 !important; }
        .react-datepicker__current-month { font-family: "Playfair Display", serif !important; text-transform: uppercase; letter-spacing: 0.1em; font-size: 14px !important; }
      `}</style>
    </section>
  );
}

// --- 14.5 STUDIO MAP SECTION ---
function StudioMapSection() {
  return (
    <section className="w-full bg-white px-6 md:px-24 pb-32 md:pb-48 z-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-t border-black/10 pt-16">
           <div>
             <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-black/40 mb-4">Location</p>
             <h3 className="font-serif text-4xl md:text-6xl tracking-tight text-black">Visit the <span className="italic font-light">Studio.</span></h3>
           </div>
           <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-black/60 text-left md:text-right max-w-xs">1st A Rd, Sardarpura<br/>Jodhpur, Rajasthan</p>
        </div>
        <div className="w-full h-[50vh] md:h-[70vh] bg-black relative overflow-hidden border border-black/10">
          {/* Grayscale Map iframe */}
          <iframe
            title="RFM Studio Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3577.2278453472096!2d73.00845357608889!3d26.28671608670731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39418c44bb0c68cd%3A0x8e8eb43fc8e03e05!2s1st%20A%20Rd%2C%20Sardarpura%2C%20Jodhpur%2C%20Rajasthan%20342003!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            className="absolute inset-0 w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-700 grayscale"
            style={{ border: 0, filter: 'grayscale(100%) contrast(110%)' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
}

// --- 15. MASSIVE FOOTER ---
function FooterSection() {
  const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return (
    <section className="relative w-full bg-black text-white pt-32 pb-8 px-6 md:px-16 lg:px-24 overflow-hidden border-t border-white/10">
      <div className="flex flex-col items-center justify-center mb-24 md:mb-32">
         <svg viewBox="0 0 300 80" className="w-[200px] md:w-[350px] h-auto fill-current text-white opacity-90 mb-6"><text x="50%" y="45" textAnchor="middle" fontFamily='"Playfair Display", serif' fontSize="46" fontWeight="500" letterSpacing="0.08em">RFM.</text><text x="50%" y="70" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fontWeight="500" letterSpacing="0.6em">PHOTOGRAPHY</text></svg>
         <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/40 text-center max-w-md">Documenting the poetry of human connection.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 border-t border-white/10 pt-16 mb-16">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h4 className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-4">Direct Inquiries</h4>
          <a href="mailto:inquire@rfmwedding.com" className="font-serif text-xl md:text-2xl italic hover:opacity-60 transition-opacity">inquire@rfmwedding.com</a>
        </div>
        <div className="flex flex-col items-center text-center">
          <h4 className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-4">The Studio</h4>
          <address className="not-italic font-serif text-lg md:text-xl text-white/80 leading-relaxed">1st A Rd, Sardarpura<br />Jodhpur, Rajasthan</address>
        </div>
        <div className="flex flex-col items-center md:items-end text-center md:text-right">
          <h4 className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-4">Connect</h4>
          <div className="flex flex-col gap-2 font-serif text-lg md:text-xl text-white/80">
            <a href="https://www.instagram.com/rfm_wedding_photography/" target="_blank" rel="noopener noreferrer" className="hover:italic hover:opacity-60 transition-all">Instagram</a>
            <a href="https://www.youtube.com/@RFMWEDDINGPHOTOGRAPHY-z5t" target="_blank" rel="noopener noreferrer" className="hover:italic hover:opacity-60 transition-all">YouTube</a>
            <a href="https://www.facebook.com/share/1K9B1LB438/" target="_blank" rel="noopener noreferrer" className="hover:italic hover:opacity-60 transition-all">Facebook</a>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/10 text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-white/30">
        <span>© 2026 RFM Wedding. All Rights Reserved.</span>
        <button onClick={scrollToTop} className="hover:text-white transition-colors flex items-center gap-2 group">Back to Top <span className="group-hover:-translate-y-1 transition-transform">↑</span></button>
        <div className="flex gap-4"><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a><span>/</span><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></div>
      </div>
    </section>
  );
}

// --- 17. WHATSAPP FLOATING BUTTON ---
function WhatsAppButton() {
  return (
    <a href="https://wa.me/919928588659" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] flex items-center gap-3 bg-black text-white px-5 py-3 md:px-6 md:py-4 rounded-full hover:scale-105 hover:bg-white hover:text-black border border-white/20 hover:border-black transition-all duration-500 shadow-2xl group backdrop-blur-sm">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:fill-black transition-colors"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      <span className="text-[9px] uppercase tracking-[0.2em] font-medium hidden md:block">Inquire on WhatsApp</span>
    </a>
  );
}

// --- 18. PRIVACY POLICY PAGE ---
function PrivacyPage() {
  React.useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="bg-white text-black min-h-screen font-sans selection:bg-black selection:text-white">
      <Navbar />
      <div className="pt-48 pb-32 px-6 md:px-24 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>Privacy <span className="italic font-light">Policy.</span></h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-black/40 mb-16 border-b border-black/10 pb-6">Last Updated: April 2026</p>
        <div className="space-y-12 text-sm md:text-base leading-relaxed text-black/80">
          <section><h2 className="font-serif text-2xl mb-4 text-black italic">1. Information We Collect</h2><p className="mb-4">We collect personal information that you voluntarily provide to us when you express an interest in obtaining information about our photography services. The personal information generally includes:</p><ul className="list-disc pl-5 space-y-2 text-black/70"><li>Names & Email Addresses</li><li>Phone Numbers</li><li>Wedding Dates and Venue Details</li></ul></section>
          <section><h2 className="font-serif text-2xl mb-4 text-black italic">2. How We Use Your Information</h2><p>We use the information we collect to communicate with you regarding your wedding inquiry, send you pricing brochures, curated proposals, and facilitate the booking and contract process.</p></section>
          <section><h2 className="font-serif text-2xl mb-4 text-black italic">3. Information Sharing</h2><p>We strictly do not sell, rent, or trade your personal information with third parties. We only share information with your consent, to comply with laws, or to fulfill business obligations.</p></section>
          <section><h2 className="font-serif text-2xl mb-4 text-black italic">4. Contact Us</h2><p>If you have questions or comments about this notice, you may email us at: <a href="mailto:inquire@rfmwedding.com" className="border-b border-black font-semibold">inquire@rfmwedding.com</a></p></section>
        </div>
      </div>
      <FooterSection />
    </div>
  );
}

// --- 19. TERMS OF SERVICE PAGE ---
function TermsPage() {
  React.useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="bg-white text-black min-h-screen font-sans selection:bg-black selection:text-white">
      <Navbar />
      <div className="pt-48 pb-32 px-6 md:px-24 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>Terms of <span className="italic font-light">Service.</span></h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-black/40 mb-16 border-b border-black/10 pb-6">Last Updated: April 2026</p>
        <div className="space-y-12 text-sm md:text-base leading-relaxed text-black/80">
          <section><h2 className="font-serif text-2xl mb-4 text-black italic">1. Agreement to Terms</h2><p>By accessing our website and submitting an inquiry, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.</p></section>
          <section><h2 className="font-serif text-2xl mb-4 text-black italic">2. Services and Bookings</h2><p>The information provided on this website is for general inquiry purposes. Submitting a contact form does not guarantee a booking or reserve a date. All official bookings require a signed legal contract and a non-refundable retainer fee.</p></section>
          <section><h2 className="font-serif text-2xl mb-4 text-black italic">3. Copyright & Intellectual Property</h2><p>All visual content, including but not limited to photographs, videos, logos, and website design elements, are the exclusive property of RFM Wedding Photography. You may not copy, reproduce, distribute, or create derivative works from our content without explicit written permission.</p></section>
          <section><h2 className="font-serif text-2xl mb-4 text-black italic">4. Client Usage Rights</h2><p>Upon booking and delivery of final galleries, clients are granted a personal print release for personal, non-commercial use. Commercial use of our images by vendors or other businesses is strictly prohibited without prior authorization.</p></section>
        </div>
      </div>
      <FooterSection />
    </div>
  );
}