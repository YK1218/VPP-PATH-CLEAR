"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import LocationList from "@/components/home/LocationList";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-pathclear-bg">
      <Navbar />
      
      <main className="flex-1 flex flex-col relative z-10">
        <Hero />
        <LocationList />
      </main>

      <Footer />
    </div>
  );
}
