import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import DashImg from "../../assets/images/proj2.jpg";
// ── Icons (inline SVG helpers) ─────────────────────────────────────────────
const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const MenuIcon = () => <Icon d="M3 12h18M3 6h18M3 18h18" />;
const XIcon = () => <Icon d="M18 6L6 18M6 6l12 12" />;
const ShieldIcon = () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;

const ZapIcon = () => <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />;
const HeadphonesIcon = () => <Icon d="M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" />;
const InfinityIcon = () => <Icon d="M12 12c-2-2.5-4-4-6-4a4 4 0 000 8c2 0 4-1.5 6-4zm0 0c2 2.5 4 4 6 4a4 4 0 000-8c-2 0-4 1.5-6 4z" />;
const CheckIcon = () => <Icon d="M20 6L9 17l-5-5" strokeWidth={2} />;
const ArrowRightIcon = () => <Icon d="M5 12h14M12 5l7 7-7 7" />;
const StarIcon = () => <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" stroke="none" />;
const TrendUpIcon = () => <Icon d={["M22 7l-8.5 8.5-5-5L2 17", "M16 7h6v6"]} />;
const PieIcon = () => <Icon d={["M21.21 15.89A10 10 0 118 2.83", "M22 12A10 10 0 0012 2v10z"]} />;
const SendIcon = () => <Icon d={["M22 2L11 13", "M22 2L15 22 11 13 2 9l20-7z"]} />;
const GitBranchIcon = () => <Icon d={["M6 3v12", "M18 9a3 3 0 100-6 3 3 0 000 6z", "M6 21a3 3 0 100-6 3 3 0 000 6z", "M18 9a9 9 0 01-9 9"]} />;

// ── Animated counter ────────────────────────────────────────────────────────
function useCountUp(end, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// ── Intersection Observer Hook ──────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}


// ── Feature Card ────────────────────────────────────────────────────────────
import React from 'react';
import {
  LockKeyhole as LockIcon,
  Bot as BotIcon,
  BarChart3 as BarChartIcon,
  Repeat as RepeatIcon,
  Mail as MailIcon,
  Filter as FilterIcon,
  CreditCard as CreditCardIcon,
  Zap,
  Shield,
  Lightbulb,

} from 'lucide-react';
import { useSendMessageMutation } from "@/features/contact/contactApi";

const bentoClassNameDiv = "rounded-xl flex flex-col  items-center justify-center shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(30,41,59,1)]";


function FeaturesBentoGrid() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans w-full">
      <div className="">
        
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* #1 */}
          <div   className={` ${bentoClassNameDiv} md:col-span-2 bg-[#F9F6EE] border-2 border-[#1E293B] text-[#1E293B] h-[200px] relative  `}>
          
            <div className={``}>


                {/* Punchy Graphic-Style Title */}
                <h3 className={`font-black flex flex-col tracking-tight leading-none uppercase mb-3 text-xl lg:text-4xl`}>
                 
                    <div className="flex items-center gap-3">
                      <Zap
                        size={38}
                        className="text-yellow-500 fill-yellow-300 shrink-0"
                      />
                      <span>Uncompromising</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[1.1rem] md:text-4xl">Bank-Grade Security</span>

                      <Shield
                        size={38}
                        className="text-blue-500 fill-blue-400 shrink-0"
                      />
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <span>& Insights</span>

                      <Lightbulb
                        size={38}
                        className="text-orange-500 fill-orange-300 shrink-0"
                      />
                    </div>
        
                   
                </h3>

                    {/* Description */}
                <p className={`text-[0.6rem] font-medium leading-relaxed opacity-90 mt-2`}>
            
                </p>
            </div>
          </div>

          {/* #2 */}
          <div   className={` ${bentoClassNameDiv} md:row-span-2 bg-[#3B82F6] text-white border-2 border-[#1E293B] h-[285px]  `}>
           

            <div className={`max-w-[20rem] flex flex-col gap-3 items-center justify-center md:items-start`}>
                <BotIcon size={60} className="text-black fill-white " strokeWidth={1.8}/>
                {/* Punchy Graphic-Style Title */}
                <h3 className={`font-black tracking-tight leading-none uppercase mb-4 text-xl md:text-[1.8rem] text-center md:text-left `}>
                    Automatic,<br></br>  AI-Powered <br></br> Receipt Scanning
                </h3>
                    {/* Description */}
                <p className={`text-[0.6rem] font-medium leading-relaxed opacity-90  w-[12rem] lg:w-full`}>
                  desc: Scan receipts with Gemini AI and instantly create categorized transactions automatically.
            
                </p>
            </div>

         

          </div>

          {/* #3 & 6 */}
          <div className="md:row-span-2 flex flex-col gap-4">
            <div   className={` ${bentoClassNameDiv}  bg-[#F59E0B] text-[#1E293B] border-2 border-[#1E293B] h-[230px] text-xl md:text-2xl `}>
              <div className="max-w-[20rem]  flex flex-col gap-3 items-center justify-center md:items-start">

                  <LockIcon   size={52} className=" text-black " strokeWidth={2}/>
                  {/* Punchy Graphic-Style Title */}
                  <h3 className={`font-black tracking-tight leading-none uppercase mb-3 text-xl md:text-2xl text-center md:text-left`}>
                      Protection
                  </h3>

                      {/* Description */}
                  <p className="mt-2 text-[0.6rem] text-gray-800 leading-relaxed w-[12rem] lg:w-full">
                      <span className="font-bold">desc:</span> JWT auth, refresh tokens, 2FA, email verification, rate limiting, and active session tracking.
                    </p>
              </div>


            </div>
            {/* #6 */}
          <div   className={` ${bentoClassNameDiv} bg-[#C6FF34]/80 text-white border-2 border-[#1E293B] h-[120px]`}>
            <div className="max-w-[20rem]  flex flex-col gap-3 items-center justify-center md:items-start">
             <div className="flex items-center gap-2  shadow-sm ">
              
              <span className="text-[0.8rem]  text-gray-700 font-medium bg-white rounded-sm md:text-md" style={{padding:"4px",borderRadius:"4px"}}>Generating your Monthly Report...</span>
              <span className="text-md md:text-xl">👨‍🦱</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-xl">👨</span>
              <span className="text-[0.8rem]  text-gray-700 font-medium  bg-white rounded-sm px-3 py-2 shadow-sm md:text-md" style={{padding:"4px"}}>Review the insights here.</span>
            </div>

            </div>



          </div>

          </div>


          {/* #4 */}
           <div className="md:row-span-2 flex flex-col gap-4">

          <div   className={` ${bentoClassNameDiv} bg-[#d4b8e8] text-[#1E293B] border-2 border-[#1E293B] h-[185px]`}>
            <div className={` max-w-[20rem]  flex flex-col gap-3 items-center justify-center md:items-start`}>

                <BarChartIcon size={40} className="text-black mb-2" strokeWidth={2.2} />

                {/* Punchy Graphic-Style Title */}
                <h3 className={`font-black tracking-tight leading-none uppercase mb-3 text-xl text-center md:text-left`}>
                    Smarter Visual Analytics & Trends
                </h3>

                    {/* Description */}
                <p className={`text-[0.6rem] font-medium leading-relaxed opacity-90 mt-2 w-[12rem] lg:w-full`}>
                  desc: Interactive charts and insights for income, expenses, categories, and spending trends with custom date filters.
            
                </p>
            </div>

          </div>

          <div   className={` ${bentoClassNameDiv} bg-[#f4a07a] text-black border-2 border-[#1E293B] h-[165px]`}>
            <div className={` max-w-[20rem]  flex flex-col gap-3 items-center justify-center md:items-start`}>
 {/* Icon Wrapper */}
                 <RepeatIcon size={40} className="text-gray-900 font-bold" strokeWidth={1.5} />
          
            <h3 className={`font-black tracking-tight leading-none uppercase mb-3 text-xl text-center md:text-left`}>
                Recurring Payment <br></br>Automation & Reminders 
            </h3>

            
            <p className={`text-[0.6rem] font-medium leading-relaxed opacity-90 mt-2 w-[13rem] lg:w-full`}>
             Automate recurring bills and income with reminders for upcoming payments.
        
            </p>
            </div>


          </div>

           </div>

          {/* #8 */}

          <div   className={` ${bentoClassNameDiv}  bg-[#5ec8c0]  text-white border-2 border-[#1E293B] h-[280px]`}>
    

                    <div className={` max-w-[20rem] flex flex-col gap-3 items-center justify-center md:items-start`}>
                  {/* Icon Wrapper */}
                      <CreditCardIcon size={50} className="text-gray-950 fill-amber-100" strokeWidth={2} />
                    <h3 className={`font-black tracking-tight  uppercase mb-3 text-2xl lg:text-[2rem] text-black  leading-tight text-left`}>
                      Stripe-Powered <br></br> Premium Plans <br></br> & Upgrades
                    
                    </h3>

                        {/* Description */}
                    <p className={`text-[0.6rem] font-medium  opacity-90  text-black mt-6 text-xs leading-relaxed w-[13rem] lg:w-full `}>
                      <span className="font-bold">desc:</span> Monthly and yearly subscriptions with free trials, billing portal, and seamless upgrades.
                    </p>
                      
                    </div>
                    {/* Punchy Graphic-Style Title */}


          </div>


        </div>

      </div>
    </div>
  );
}

// ── Pricing Card ────────────────────────────────────────────────────────────
function PricingCard({ plan, price, period, features, cta, highlighted, badge }) {
  return (
    <div style={{
      background: highlighted ? "#0057FF" : "#fff",
      border: highlighted ? "none" : "1px solid #E8E8E8",
      borderRadius: "20px",
      padding: "36px 32px",
      boxShadow: highlighted ? "0px 16px 48px rgba(0,87,255,0.3)" : "0px 1px 3px rgba(0,0,0,0.06)",
      position: "relative",
      transition: "transform 0.3s ease",
      flex: 1
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {badge && (
        <div style={{
          position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
          background: "#FFEEAA", color: "#191919", fontSize: "11px", fontWeight: 700,
          padding: "4px 14px", borderRadius: "100px", whiteSpace: "nowrap"
        }}>{badge}</div>
      )}
      <div style={{ fontSize: "13px", fontWeight: 700, color: highlighted ? "rgba(255,255,255,0.7)" : "#959595", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>{plan}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "4px" }}>
        <span style={{ fontSize: "40px", fontWeight: 900, color: highlighted ? "#fff" : "#191919", lineHeight: 1 }}>{price}</span>
        {period && <span style={{ fontSize: "14px", color: highlighted ? "rgba(255,255,255,0.6)" : "#959595", marginBottom: "6px" }}>/{period}</span>}
      </div>
      <div style={{ height: "1px", background: highlighted ? "rgba(255,255,255,0.15)" : "#E8E8E8", margin: "20px 0" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
        {features.map(f => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ color: highlighted ? "#FFEEAA" : "#0057FF", flexShrink: 0 }}>
              <CheckIcon />
            </div>
            <span style={{ fontSize: "14px", color: highlighted ? "rgba(255,255,255,0.85)" : "#191919", fontWeight: 500 }}>{f}</span>
          </div>
        ))}
      </div>
      <button style={{
        width: "100%", padding: "14px 24px", borderRadius: "100px",
        background: highlighted ? "#fff" : "#0057FF",
        color: highlighted ? "#0057FF" : "#fff",
        border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer",
        boxShadow: highlighted ? "none" : "0px 2px 8px rgba(0,87,255,0.24)",
        transition: "opacity 0.2s"
      }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
      >{cta}</button>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [billingYearly, setBillingYearly] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formSent, setFormSent] = useState(false);

  const [sendMessage,{isLoading}] = useSendMessageMutation();

  


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
    setActiveSection(id);
  };

  const navLinks = [
    { label: "Home", id: "home" },
    { label: "Features", id: "features" },
    { label: "Pricing", id: "pricing" },
  ];



const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    const res = await sendMessage({
      name: formData.name,
      email: formData.email,
      message: formData.message,
    }).unwrap();

    if (res.success) {
      setFormSent(true);

      setFormData({
        name: "",
        email: "",
        message: "",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

  const styles = {
    body: {
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: "#fff",
      color: "#191919",
      margin: 0,
      padding: 0,
      overflowX: "hidden",
    }
  };

  return (
    <div style={styles.body}>
      {/* ── Google Font ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400;1,9..40,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif}
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F9F9F9; }
        ::-webkit-scrollbar-thumb { background: #E8E8E8; border-radius: 3px; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .hero-float { animation: float 6s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.8s ease both; }
        .fade-up-1 { animation: fadeUp 0.8s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.8s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.8s 0.4s ease both; }
        .fade-up-4 { animation: fadeUp 0.8s 0.6s ease both; }
        input:focus, textarea:focus { outline: none; border-color: #0057FF !important; box-shadow: 0 0 0 3px rgba(0,87,255,0.1) !important; }
        .nav-link:hover { color: #0057FF !important; }
        .tag-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #E0EAFF; color: #0057FF; font-size: 12px; font-weight: 700;
          padding: 6px 14px; border-radius: 100px; letter-spacing: 0.3px;
        }
      `}</style>

      {/* ── NAVBAR ────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #E8E8E8" : "none",
        transition: "all 0.3s ease"
      }}>
        <div style={{ maxWidth: "1400px", margin: "10px auto", padding: "0 40px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => scrollTo("home")}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#0057FF", display: "flex", alignItems: "center", justifyContent: "center" ,color:"#fff"}}>
              <TrendUpIcon />
            </div>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#191919" }}>InFlow</span>
          </div>

          {/* Desktop nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }} className="desktop-nav">
            {navLinks.map(link => (
              <button key={link.id} className="nav-link" onClick={() => scrollTo(link.id)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: activeSection === link.id ? "#0057FF" : "#191919", transition: "color 0.2s" }}>
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => scrollTo("contact")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "#696969" }} className={`nav-link hidden lg:block`}>
              Contact
            </button>
            <button className="hidden lg:block" style={{
              background: "#0047CC", color: "#fff", border: "none", borderRadius: "100px",
              padding: "10px 22px", fontSize: "14px", fontWeight: 700, cursor: "pointer",
              boxShadow: "0px 2px 8px rgba(0,87,255,0.24)", transition: "all 0.2s"
              
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#0047CC"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#0057FF"; }}>
                <NavLink  key={"/sign-up"} to={"/sign-up"}> Get Started</NavLink>
           
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: "none", border: "none", cursor: "pointer", display: "none", color: "#191919" }} id="hamburger">
              {mobileOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: "#fff", borderTop: "1px solid #E8E8E8", padding: "16px 24px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[...navLinks, { label: "Contact", id: "contact" }].map(link => (
              <button key={link.id} onClick={() => scrollTo(link.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: 600, color: "#191919", padding: "12px 0", textAlign: "left", borderBottom: "1px solid #F5F5F5" }}>
                {link.label}
              </button>
            ))}
            <button onClick={() => scrollTo("pricing")} style={{ background: "#0057FF", color: "#fff", border: "none", borderRadius: "100px", padding: "14px", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginTop: "8px" }}>
                <NavLink  key={"/sign-up"} to={"/sign-up"}> Get Started</NavLink>
             
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section id="home" style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        backgroundColor: "#FOEDE5",
        paddingTop: "80px", overflow: "hidden", position: "relative"
      }} className="bg-[#FOEDE5]">
        {/* Background decorative elements */}
        <div style={{ position: "absolute", top: "10%", right: "5%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,87,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "5%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,87,255,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "50%", width: "1px", height: "200px", background: "linear-gradient(to bottom, transparent, rgba(0,87,255,0.1), transparent)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 40px", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }} >
          {/* Left: Copy */}
          <div>
            <div className="fade-up" style={{ marginBottom: "24px" }}>
              <span className="tag-badge">
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0057FF", display: "inline-block" }} />
                Personal Finance, Reimagined
              </span>
            </div>

            <h1 className="fade-up-1" style={{ fontSize: "clamp(36px, 5vw, 62px)", fontWeight: 900, color: "#191919", lineHeight: 1.05, marginBottom: "24px", letterSpacing: "-1.5px" }}>
              Track Every <span style={{ color: "#0057FF", fontStyle: "italic" }}>Expenses.</span>
              <br />Grow Every <span style={{ color: "#0057FF" }}>Goal.</span>
            </h1>

            <p className="fade-up-2 text-[15px] md:text-[18px]" style={{  fontWeight: 400, color: "#696969", lineHeight: 1.7, marginBottom: "40px", maxWidth: "480px" }}>
              A smart expense tracker with AI receipt scanning, advanced analytics, recurring bills, auto-generated reports, and bank-grade security — built for the modern money mind.
            </p>

            <div className="fade-up-3 flex" style={{ gap: "12px", flexWrap: "wrap", marginBottom: "48px" }}
            >
              <button className="text-[14px] md:text-[16px]"  onClick={() => scrollTo("pricing")} style={{
                background: "#0057FF", color: "#fff", border: "none", borderRadius: "100px",
                padding: "16px 32px", fontWeight: 700, cursor: "pointer",
                boxShadow: "0px 4px 16px rgba(0,87,255,0.3)", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s"
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0px 8px 24px rgba(0,87,255,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0px 4px 16px rgba(0,87,255,0.3)"; }}>
                Start Free Trial <ArrowRightIcon />
              </button>
              <button onClick={() => scrollTo("features")} style={{
                background: "#F5F8FF", color: "#0057FF", border: "1px solid #E0EAFF", borderRadius: "100px",
                padding: "16px 32px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#E0EAFF"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#F5F8FF"; }} className=" text-[12px] md:text-[16px] ">
                Explore Features
              </button>
            </div>

            {/* Social proof */}
            <div className="fade-up-4" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ display: "flex" }}>
                {["#0057FF","#E0EAFF","#0047CC","#F5F8FF"].map((c, i) => (
                  <div key={i} style={{ width: "32px", height: "32px", borderRadius: "50%", background: c, border: "2px solid #fff", marginLeft: i > 0 ? "-8px" : "0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: i % 2 === 0 ? "#fff" : "#0057FF" }}>
                    {["A","B","C","D"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: "flex", gap: "2px", marginBottom: "2px" }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color: "#FFBB00" }}><StarIcon /></span>)}
                </div>
                <span style={{ fontSize: "13px", color: "#696969", fontWeight: 500 }}>
                  <strong style={{ color: "#191919" }}>4.9/5</strong> from 1,200+ users
                </span>
              </div>
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="hero-float" style={{ display: "flex", justifyContent: "center" }}>
            {/* <DashboardMockup /> */}
            <div className="perspective-[1200px]">

            <div className="bg-white rounded-lg max-w-[550px] w-full border-[3px]  border-black/60 drop-shadow-[0_25px_28px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out   overflow-hidden  [transform:rotateX(12deg)_rotateY(-18deg)_rotateZ(6deg)]">

              <img src={DashImg} className=" "/>
            </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
{/* ── FEATURES ───────────────────────────────────────────── */}
      <section
        id="features"
        className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 py-28 px-6"
      >
        <div className="absolute -top-32 -left-24 h-[500px] w-[500px] max-w-[1400px] rounded-full bg-blue-500/10 blur-[120px] m-auto"/>
          <div className="relative z-10 mx-auto max-w-[1400px] flex flex-col items-center justify-center gap-10" style={{ margin: "0 auto", padding: "80px 40px", width: "100%"}}>
          {/* heading */}
            <div className="mx-auto mb-20 max-w-3xl text-center ">
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
              ✦ Powerful features,
            </span>
            <h2 className="mt-6 text-5xl font-black leading-none tracking-[-3px] text-gray-900 md:text-7xl">
              Finance tools that feel
              <br />
              <span className="text-blue-600">effortless</span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-500">
              AI automation, beautiful analytics, and smarter money
              management — all inside one modern experience.
            </p>
        
            </div>
            <FeaturesBentoGrid/>
          </div>
      </section>



      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 40px", background: "#fff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <span className="tag-badge" style={{ marginBottom: "16px", display: "inline-flex" }}>✦ How It Works</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#191919", letterSpacing: "-1px", marginTop: "16px", marginBottom: "56px" }}>
            Up and running in <span style={{ color: "#0057FF" }}>3 simple steps</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "40px" }}>
            {[
              { step: "01", title: "Create your account", desc: "Sign up with email or Google, verify your account, and optionally enable 2FA for maximum security." },
              { step: "02", title: "Add transactions", desc: "Log manually, scan a receipt with Gemini AI, or bulk-import via CSV from your bank. Your data, your way." },
              { step: "03", title: "Gain insights", desc: "Beautiful analytics, AI-powered reports delivered to your inbox, and smart alerts for upcoming bills." },
            ].map((step, i) => (
              <div key={step.step} style={{ textAlign: "center" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: i === 1 ? "#0057FF" : "#E0EAFF", color: i === 1 ? "#fff" : "#0057FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 900, margin: "0 auto 20px" }}>
                  {step.step}
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#191919", marginBottom: "12px" }}>{step.title}</h3>
                <p style={{ fontSize: "14px", color: "#696969", lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "100px 40px", background: "#F9F9F9" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="tag-badge" style={{ marginBottom: "16px", display: "inline-flex" }}>✦ Simple Pricing</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "#191919", letterSpacing: "-1px", marginTop: "16px", marginBottom: "16px" }}>
              Start free, upgrade when <span style={{ color: "#0057FF" }}>you're ready</span>
            </h2>
            <p style={{ fontSize: "18px", color: "#696969", marginBottom: "32px" }}>No credit card required for the 3-day trial.</p>

            {/* Toggle */}
            <div style={{ display: "inline-flex", background: "#E8E8E8", borderRadius: "100px", padding: "4px", gap: "4px" }}>
              {["Monthly", "Yearly"].map(period => (
                <button key={period} onClick={() => setBillingYearly(period === "Yearly")} style={{
                  padding: "8px 20px", borderRadius: "100px", border: "none",
                  background: (billingYearly ? period === "Yearly" : period === "Monthly") ? "#fff" : "transparent",
                  color: (billingYearly ? period === "Yearly" : period === "Monthly") ? "#191919" : "#696969",
                  fontSize: "14px", fontWeight: 700, cursor: "pointer",
                  boxShadow: (billingYearly ? period === "Yearly" : period === "Monthly") ? "0px 1px 4px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.2s"
                }}>
                  {period} {period === "Yearly" && <span style={{ color: "#16A34A", fontSize: "11px", fontWeight: 700 }}>Save 16%</span>}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>
            <PricingCard
              plan="Free Trial"
              price="$0"
              period="3 days"
              features={["Up to 3 days trial", "Basic analytics", "Email support", "Basic reports"]}
              cta="Start Free Trial"
              highlighted={false}
            />
            <PricingCard
              plan="Pro"
              price={billingYearly ? "$200" : "$20"}
              period={billingYearly ? "year" : "month"}
              badge={billingYearly ? "🎉 Save $40 / year" : "Most Popular"}
              features={["Unlimited transactions", "Advanced analytics", "Priority support", "MFA & session management", "Early access to new features"]}
              cta="Upgrade to Pro"
              highlighted={true}
            />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      {/* <section style={{ padding: "100px 40px", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span className="tag-badge" style={{ marginBottom: "16px", display: "inline-flex" }}>✦ What Users Say</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#191919", letterSpacing: "-1px", marginTop: "16px" }}>
              Real people, <span style={{ color: "#0057FF" }}>real results</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {[
              { name: "Sarah M.", role: "Freelance Designer", quote: "The AI receipt scanner is witchcraft. I scan my grocery receipt and everything auto-categorizes. Saved me an hour a week.", stars: 5 },
              { name: "James K.", role: "Software Engineer", quote: "Finally a finance app that respects my data. The 2FA + session management gives me confidence I know where I'm logged in.", stars: 5 },
              { name: "Priya T.", role: "Small Business Owner", quote: "The monthly AI report sent to my email is incredible. It actually gives me actionable advice, not just numbers.", stars: 5 },
            ].map(t => (
              <div key={t.name} style={{
                background: "#F9F9F9", border: "1px solid #E8E8E8", borderRadius: "16px", padding: "28px 24px",
                transition: "all 0.3s ease"
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0px 8px 24px rgba(0,87,255,0.08)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ display: "flex", gap: "2px", marginBottom: "16px" }}>
                  {[...Array(t.stars)].map((_, i) => <span key={i} style={{ color: "#FFBB00" }}><StarIcon /></span>)}
                </div>
                <p style={{ fontSize: "15px", color: "#191919", lineHeight: 1.7, marginBottom: "20px", fontStyle: "italic" }}>"{t.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#0057FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: 700 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#191919" }}>{t.name}</div>
                    <div style={{ fontSize: "12px", color: "#959595" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── CONTACT ───────────────────────────────────────────────────────── */}
      <section id="contact" style={{ padding: "100px 40px", background: "#F9F9F9" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="tag-badge" style={{ marginBottom: "16px", display: "inline-flex" }}>✦ Get In Touch</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#191919", letterSpacing: "-1px", marginTop: "16px", marginBottom: "12px" }}>
              Have a <span style={{ color: "#0057FF" }}>question?</span>
            </h2>
            <p style={{ fontSize: "16px", color: "#696969" }}>Send a message directly. I typically reply within 24 hours.</p>
          </div>

          {formSent ? (
            <div style={{ background: "#E0EAFF", border: "1px solid #0057FF", borderRadius: "16px", padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🎉</div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#0057FF", marginBottom: "8px" }}>Message Sent!</h3>
              <p style={{ color: "#696969" }}>Thank you for reaching out. I'll get back to you soon.</p>
              <button onClick={() => setFormSent(false)} style={{ marginTop: "20px", background: "#0057FF", color: "#fff", border: "none", borderRadius: "100px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid #E8E8E8", borderRadius: "20px", padding: "40px", boxShadow: "0px 4px 16px rgba(0,0,0,0.06)" }}>
              {[
                { key: "name", label: "Your Name", type: "text", placeholder: "John Doe" },
                { key: "email", label: "Email Address", type: "email", placeholder: "john@example.com" },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#191919", marginBottom: "8px" }}>{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.key]}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    required
                    style={{ width: "100%", padding: "14px 16px", border: "1px solid #E8E8E8", borderRadius: "10px", fontSize: "15px", fontWeight: 500, color: "#191919", background: "#F9F9F9", transition: "all 0.2s", fontFamily: "inherit" }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: "28px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#191919", marginBottom: "8px" }}>Message</label>
                <textarea
                  placeholder="Tell me what's on your mind..."
                  rows={5}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  required
                  style={{ width: "100%", padding: "14px 16px", border: "1px solid #E8E8E8", borderRadius: "10px", fontSize: "15px", fontWeight: 500, color: "#191919", background: "#F9F9F9", resize: "vertical", fontFamily: "inherit", transition: "all 0.2s" }}
                />
              </div>
              <button type="submit" style={{
                width: "100%", padding: "16px", background: "#0057FF", color: "#fff", border: "none", borderRadius: "100px",
                fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "0px 4px 16px rgba(0,87,255,0.24)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s"
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#0047CC"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#0057FF"; }}>
                <SendIcon />{isLoading ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 40px", background: "#191919" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: "16px" }}>
            Ready to take control of your <span style={{ color: "#0057FF" }}>finances?</span>
          </h2>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.6)", marginBottom: "36px" }}>
            Start your 3-day free trial. No credit card required.
          </p>
          <button onClick={() => scrollTo("pricing")} style={{
            background: "#0057FF", color: "#fff", border: "none", borderRadius: "100px",
            padding: "18px 40px", fontSize: "18px", fontWeight: 700, cursor: "pointer",
            boxShadow: "0px 8px 32px rgba(0,87,255,0.4)", display: "inline-flex", alignItems: "center", gap: "10px", transition: "all 0.3s"
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0px 12px 40px rgba(0,87,255,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0px 8px 32px rgba(0,87,255,0.4)"; }}>
            Get Started Free <ArrowRightIcon />
          </button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer style={{ background: "#0D0D0D", padding: "64px 40px 32px", color: "#fff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px", marginBottom: "56px" }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#0057FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrendUpIcon />
                </div>
                <span style={{ fontSize: "18px", fontWeight: 800 }}>InFlow</span>
              </div>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: "280px" }}>
                A smart money management platform designed to help you track expenses, manage budgets, and grow savings with ease.
              </p>
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                {["Twitter", "GitHub", "LinkedIn"].map(s => (
                  <a key={s} href="#" style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "16px", letterSpacing: "0.5px" }}>{col.title}</div>
                {col.links.map(link => (
                  <a key={link} href="#" style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.45)", textDecoration: "none", marginBottom: "10px", transition: "color 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}>
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>
              © {new Date().getFullYear()} FinTrackr. Built with ❤️ using MERN + TypeScript.
            </span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>
              Crafted for modern money management
            </span>
          </div>
        </div>
      </footer>

      {/* ── RESPONSIVE STYLES ─────────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 900px) {
          section > div { grid-template-columns: 1fr !important; }
          .desktop-nav { display: none !important; }
          #hamburger { display: block !important; }
        }
        @media (max-width: 768px) {
          section { padding: 64px 20px !important; }
          nav > div { padding: 0 20px !important; }
          footer > div > div:first-child { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}