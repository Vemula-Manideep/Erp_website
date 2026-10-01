import { Button, Typography, Card, Spinner } from "@material-tailwind/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Importing the same background image for brand consistency
import collegeImage from 'D:/Reactjs/Erp-website/College-ERP-Using-Reactjs-And-Java-Spring-Boot/Fron-End/College-ERP/src/1200x630wa.jpg';

export default function SignUpTypeSelection() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUpType = (type) => {
    setIsLoading(true);
    setTimeout(() => {
      navigate(`/auth/${type}/sign-up`);
      setIsLoading(false);
    }, 800); 
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black font-sans">
      
      {/* 1. Cinematic Background (Consistent with Login) */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${collegeImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          animation: "bgZoom 30s ease-in-out infinite alternate",
        }}
      />
      
      {/* 2. Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 animate-[overlayFade_1.5s_ease-in-out_forwards]"></div>

      {/* 3. Glassmorphism Card */}
      <Card 
        className="relative w-full max-w-md p-10 z-20 
                   bg-white/10 backdrop-blur-2xl shadow-2xl 
                   rounded-[2.5rem] border border-white/20
                   opacity-0 animate-[cardEntrance_0.8s_ease-out_0.5s_forwards]"
      >
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30 mb-4">
            <Typography className="text-[10px] uppercase tracking-[0.3em] text-yellow-400 font-bold">
              New Registration
            </Typography>
          </div>
          <Typography variant="h2" className="font-black text-white text-3xl mb-2 tracking-tight">
            Create <span className="text-yellow-400">Account</span>
          </Typography>
          <Typography className="text-white/70 font-medium text-sm">
            Join the CBIT Digital Ecosystem
          </Typography>
        </div>

        {/* Action Buttons */}
        <div className="space-y-5">
          {[
            { type: "hod", label: "HOD Registration", color: "from-blue-600 to-blue-800" },
            { type: "professor", label: "Faculty Registration", color: "from-emerald-600 to-emerald-800" },
            { type: "student", label: "Student Registration", color: "from-purple-600 to-purple-800" },
          ].map((btn) => (
            <Button
              key={btn.type}
              size="lg"
              fullWidth
              onClick={() => handleSignUpType(btn.type)}
              disabled={isLoading}
              className={`
                relative group overflow-hidden bg-gradient-to-r ${btn.color} 
                text-white font-bold tracking-wider uppercase py-4 shadow-xl
                transition-all duration-300 transform hover:scale-[1.02] 
                active:scale-95 border border-white/10 flex justify-center items-center
              `}
            >
              {isLoading ? (
                <Spinner className="h-5 w-5" />
              ) : (
                <>
                  <span className="relative z-10">{btn.label}</span>
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                </>
              )}
            </Button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center border-t border-white/10 pt-6">
          <Typography variant="small" className="text-white/60">
            Already have an account? 
            <Link to="/" className="ml-2 text-yellow-400 font-bold hover:text-white transition-colors underline underline-offset-4">
              Sign in here
            </Link>
          </Typography>
        </div>
      </Card>

      {/* Shared Animations */}
      <style>
        {`
          @keyframes bgZoom {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
          }
          @keyframes overlayFade {
            0% { background-color: rgba(0,0,0,0); }
            100% { background-color: rgba(0,0,0,0.5); }
          }
          @keyframes cardEntrance {
            0% { 
              opacity: 0; 
              transform: translateY(30px);
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