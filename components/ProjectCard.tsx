"use client";

import Image from "next/image";
import { Play } from "lucide-react";

interface ProjectCardProps {
  title: string;
  category: string;
  thumbnailUrl: string;
  onClick: () => void;
}

export default function ProjectCard({ title, category, thumbnailUrl, onClick }: ProjectCardProps) {
  return (
    <div 
      className="bg-black/60 backdrop-blur-md border border-[#facc15]/40 rounded-sm overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-[#facc15] shadow-[0_0_15px_rgba(250,204,21,0.1)] hover:shadow-[0_0_25px_rgba(250,204,21,0.2)]"
      onClick={onClick}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
      </div>
      <div className="p-6 border-t border-[#facc15]/20">
        <div className="text-xs text-[#facc15] font-bold tracking-widest uppercase mb-2">
          {category}
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tight">
          {title}
        </h3>
      </div>
    </div>
  );
}
