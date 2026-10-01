import { Button, Typography, Card } from "@material-tailwind/react";
import { useNavigate, Link } from "react-router-dom";

// Ensure this path is correct for your local setup
import collegeImage from 'D:/Reactjs/Erp-website/College-ERP-Using-Reactjs-And-Java-Spring-Boot/Fron-End/College-ERP/src/1200x630wa.jpg';

export default function LoginTypeSelection() {
  const navigate = useNavigate();

  const handleLoginType = (type) => {
    navigate(`/auth/${type}/sign-in`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black font-sans">
      
      {/* 1. Background Image - Immediate visibility */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${collegeImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          animation: "bgZoom 25s ease-in-out infinite alternate",
        }}
      />
      
      {/* 2. Soft Overlay - Starts transparent and darkens */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] z-10 animate-[overlayFade_1.5s_ease-in-out_forwards]"></div>

      {/* 3. The Login Container */}
      <Card 
        className="relative w-full max-w-md p-10 z-20 
                   bg-white/10 backdrop-blur-2xl shadow-2xl 
                   rounded-[2rem] border border-white/20
                   flex flex-col items-center
                   opacity-0 animate-[cardEntrance_1s_ease-out_1.2s_forwards]"
      >
        {/* Header Section */}
        <div className="text-center mb-10 w-full">
          <div className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-4">
            <Typography className="text-[10px] uppercase tracking-widest text-yellow-400 font-bold">
              Secure Access
            </Typography>
          </div>
          <Typography variant="h2" className="font-black text-white text-4xl mb-2 tracking-tight">
            CBIT <span className="text-yellow-400">ERP</span>
          </Typography>
          <div className="h-1 w-12 bg-yellow-400 mx-auto rounded-full mb-4"></div>
          <Typography className="text-white/80 font-medium text-sm">
            Please select your portal to log in
          </Typography>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 w-full">
          {[
            { type: "hod", label: "HOD Portal", color: "from-blue-600 to-indigo-700" },
            { type: "professor", label: "Faculty Portal", color: "from-emerald-500 to-teal-700" },
            { type: "student", label: "Student Portal", color: "from-purple-600 to-violet-800" },
          ].map((btn) => (
            <Button
              key={btn.type}
              size="lg"
              fullWidth
              onClick={() => handleLoginType(btn.type)}
              className={`
                relative group overflow-hidden bg-gradient-to-br ${btn.color} 
                text-white font-bold tracking-wider uppercase py-4 shadow-xl
                transition-all duration-300 transform hover:scale-[1.02] 
                active:scale-95 border border-white/10
              `}
            >
              <span className="relative z-10">{btn.label}</span>
              {/* Subtle Shimmer on Hover */}
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
            </Button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center pt-6 border-t border-white/10 w-full">
          <Typography variant="small" className="text-white/60">
            Need help? 
            <Link to="/contact" className="ml-2 text-yellow-400 font-bold hover:text-white transition-colors">
              Contact Support
            </Link>
          </Typography>
        </div>
      </Card>

      {/* Embedded CSS Animations */}
      <style>
        {`
          /* Slow Background Zoom */
          @keyframes bgZoom {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
          }

          /* Darken overlay slightly */
          @keyframes overlayFade {
            0% { background-color: rgba(0,0,0,0); }
            100% { background-color: rgba(0,0,0,0.4); }
          }

          /* Slide card up from the bottom with a blur-to-clear effect */
          @keyframes cardEntrance {
            0% { 
              opacity: 0; 
              transform: translateY(40px);
              filter: blur(10px);
            }
            100% { 
              opacity: 1; 
              transform: translateY(0);
              filter: blur(0);
            }
          }
        `}
      </style>
    </section>
  );
}