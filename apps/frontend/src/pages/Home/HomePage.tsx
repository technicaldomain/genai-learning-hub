/**
 * Home page — hero banner + feature grid + stats. Pure Tailwind.
 */

import * as React from "react";
import Section from "../../layout/Section";
import heroBanner from "../../assets/hero-banner.svg?url";
import iconSkills from "../../assets/icon-skills.svg?url";
import iconPrompts from "../../assets/icon-prompts.svg?url";
import iconTools from "../../assets/icon-tools.svg?url";
import iconLearning from "../../assets/icon-learning-paths.svg?url";
import iconNews from "../../assets/icon-news.svg?url";
import iconCommunity from "../../assets/icon-community.svg?url";

type FeatureCard = { title: string; description: string; icon: string; path: string };

const featureCards: FeatureCard[] = [
  { title: "AI Skills Marketplace", description: "Browse and share reusable AI skills and automations.", icon: iconSkills, path: "/skills" },
  { title: "Prompt Library", description: "Discover curated prompt templates for every use case.", icon: iconPrompts, path: "/prompts" },
  { title: "Tools & APIs", description: "Access approved AI tools and integrations.", icon: iconTools, path: "/resources" },
  { title: "Learning Paths", description: "Guided journeys from AI basics to advanced techniques.", icon: iconLearning, path: "/learning-paths" },
  { title: "News & Updates", description: "Stay current with the latest in AI developments.", icon: iconNews, path: "/news" },
  { title: "Community", description: "Share knowledge, tips, and lessons learned.", icon: iconCommunity, path: "/community" },
];

export default function HomePage() {
  return (
    <Section>
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden">
        <img src={heroBanner} alt="GenAI Learning Hub" className="w-full h-auto" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-10">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] mb-4">
            Welcome to the GenAI Learning Hub
          </h1>
          <p className="max-w-xl text-sm sm:text-base md:text-lg text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)] mb-6">
            Your centralized platform for learning AI, discovering tools, sharing
            knowledge, and driving innovation across the organization.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <a href="/skills" className="px-6 py-2.5 bg-white text-primary-500 dark:text-primary-400 font-bold rounded-lg hover:bg-neutral-100 transition-colors text-sm sm:text-base">
              Explore Skills
            </a>
            <a href="/resources" className="px-6 py-2.5 border border-white/60 text-white font-bold rounded-lg hover:bg-white/10 transition-colors text-sm sm:text-base">
              Browse Tools
            </a>
          </div>
        </div>
      </div>

      {/* Section heading */}
      <div>
        <h2 className="text-2xl font-bold mb-1">Get Started</h2>
        <p className="text-neutral-600 dark:text-neutral-400">Everything you need to learn, discover, and share AI knowledge.</p>
      </div>

      {/* Feature cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureCards.map((card) => (
          <a key={card.path} href={card.path} className="block bg-white dark:bg-neutral-900 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-neutral-200 dark:border-neutral-800">
            <div className="p-6 text-center">
              <div className="w-[72px] h-[72px] mx-auto mb-4">
                <img src={card.icon} alt={card.title} className="w-full h-full object-contain" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{card.description}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-8 md:gap-12 justify-center flex-wrap py-6 px-4 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        {[
          { label: "AI Skills", value: "12+" },
          { label: "Prompt Templates", value: "25+" },
          { label: "Approved Tools", value: "8" },
          { label: "Learning Paths", value: "5" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-extrabold text-primary-500 dark:text-primary-400">{stat.value}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
