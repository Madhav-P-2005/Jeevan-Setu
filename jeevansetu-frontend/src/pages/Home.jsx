// Path :- jeevansetu-frontend/src/pages/Home.jsx


import { Link } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Slider from "react-slick";
import { BiDonateBlood } from "react-icons/bi";
import { GiLifeSupport } from "react-icons/gi";

export default function Home(){

     const settings = {
      dots: true,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      speed: 600,
      autoplaySpeed: 3800,
      cssEase: "ease-in-out",
      arrows: false,
      responsive: [
        { breakpoint: 768, settings: { slidesToShow: 1, arrows: false } },
        { breakpoint: 1024, settings: { slidesToShow: 2, arrows: true } },
        { breakpoint: 9999, settings: { slidesToShow: 3, arrows: true } },
      ],
    }
    return (
      <div className="relative min-h-screen overflow-hidden bg-black">
        {/* Background layer */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-rose-900 via-neutral-900 to-black" />

        {/* Optional animated accent drop (subtle) */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-red-500/20 blur-3xl z-[1]" />

        {/* Optional sparse particles (kept light for performance) */}
        <div className="pointer-events-none absolute inset-0 z-[1]">
          {[...Array(12)].map((_, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/20 animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random().toFixed(2)}s`,
              }}
            />
          ))}
        </div>

        {/* Foreground content */}
        <div className="relative z-10">
          {/* Navbar */}
          <Navbar />

          {/* Hero Section */}
          <main className="px-6 md:px-8 py-16 md:py-24 max-w-7xl mx-auto text-white">


            {/* Main content */}
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Welcome to <span className="text-red-500">जीवन Setu</span> 🙏
            </h1>
            <p className="mt-4 max-w-3xl text-white/85 text-lg md:text-xl">
              Every drop 🩸 counts — real‑time connections between donors and recipients ❤️.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 font-semibold hover:translate-y-[-2px] transition-transform duration-300"
              >
                Become a Donor
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 font-semibold hover:translate-y-[-2px] transition-transform duration-300"
              >
                Find Donors
              </Link>
            </div>

            {/* Slideshow */}
            <div className="mt-12 relative slider-container">
              <Slider {...settings}>
                {/* Impact slide */}
                <div className="px-2">
                  <div className="h-40 md:h-44 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-between px-6">
                    <div>
                      <p className="text-sm text-white/70">Impact</p>
                      <h3 className="text-2xl md:text-3xl font-extrabold">2,143+</h3>
                      <p className="text-white/70 text-sm">Donations facilitated</p>
                    </div>
                    <BiDonateBlood className="w-10 h-10 text-red-400" />
                  </div>
                </div>

                {/* Urgent need slide */}
                <div className="px-2">
                  <div className="h-40 md:h-44 rounded-2xl bg-gradient-to-br from-red-600/30 to-rose-600/20 backdrop-blur-md border border-white/10 flex items-center justify-between px-6">
                    <div>
                      <p className="text-sm text-white/80">Urgent Need</p>
                      <h3 className="text-xl md:text-2xl font-bold">O- donors near you</h3>
                      <Link to="/register" className="text-red-300 hover:text-red-200 font-semibold underline underline-offset-4">Help now →</Link>
                    </div>
                    <GiLifeSupport className="w-10 h-10 text-rose-300" />
                  </div>
                </div>

                {/* Testimonial slide */}
                <div className="px-2">
                  <div className="h-40 md:h-44 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 flex flex-col justify-center">
                    <p className="text-white/90 text-sm leading-relaxed">“Found a donor within 30 minutes. Smooth process and great support.”</p>
                    <p className="mt-3 text-white/60 text-xs">— Aarav, Pune</p>
                  </div>
                </div>
              </Slider>
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    );
}