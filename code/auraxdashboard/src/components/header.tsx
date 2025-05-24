import React from "react";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
    title: string;
    children: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, children }) => {
    return (
        <header className="bg-white shadow-xl py-3 px-6 flex justify-between items-center 
                   w-full rounded-xl mx-auto mt-2 max-w-8xl sticky top-0 z-50">
            <Link href="/" className="flex items-center">
                <Image src="/logo.png" alt="auraX Logo" width={32} height={32} className="h-8 w-auto cursor-pointer" />
            </Link>

            <h1 className="font-bold text-2xl absolute left-1/2 transform -translate-x-1/2 
                            text-black bg-clip-text">
                {title}
            </h1>
            {children}
        </header>
    );
};

export default Header;
