import React from "react";
import Image from "next/image";
import { Twitter, Linkedin, Instagram } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#343434] text-white py-4 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col items-start mb-4 md:mb-0">
          <div className="flex items-center">
            <Image src="/logo2.png" alt="auraX Logo" width={39} height={32} className="h-8 w-auto" />
          </div>
          <p className="text-sm text-white-400">Auradrishti Technologies private limited</p>
        </div>
        
        {/* Middle Section - Social Links */}
        <div className="flex flex-col items-center mb-4 md:mb-0">
          <div className="uppercase font-medium mb-2">FOLLOW ON</div>
          <div className="flex space-x-3">
            <a 
              href="https://x.com/aurax_world" 
              className="rounded-full bg-white p-2 flex items-center justify-center"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4 text-black" />
            </a>
            <a 
              href="https://www.linkedin.com/company/auraxworld" 
              className="rounded-full bg-white p-2 flex items-center justify-center"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4 text-black" />
            </a>
            <a 
              href="https://www.instagram.com/aurax.world" 
              className="rounded-full bg-white p-2 flex items-center justify-center"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4 text-black" />
            </a>
          </div>
        </div>
        
        {/* Right Section - Contact */}
        <div className="flex flex-col items-end">
          <div className="uppercase font-medium mb-2">EMAIL US</div>
          <a href="mailto:rahul@aurax.co.in" className="text-sm hover:text-emerald-400">
            rahul@aurax.co.in
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;