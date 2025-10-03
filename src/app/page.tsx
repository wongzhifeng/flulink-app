"use client"

import MainLayout, { HeroSection, FeaturesSection, TechnologySection, CTASection } from '@/components/layout/MainLayout'

export default function HomePage() {
  return (
    <MainLayout currentPage="home">

      <HeroSection />
      <FeaturesSection />
      <TechnologySection />
      <CTASection />
    </MainLayout>
  )
}