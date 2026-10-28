'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { CtaSection } from '@/components/landing/cta-section';
import { examples, models } from '@/components/landing/data';
import '@/components/landing/hero-section.css';
import '@/components/landing/features-section.css';
import '@/components/landing/cta-section.css';

export default function Page() {
  const [selectedModel, setSelectedModel] = useState(0);
  const [selectedExample, setSelectedExample] = useState(0);
  const [copyStatus, setCopyStatus] = useState('Copy prompt ⧉');
  const [annual, setAnnual] = useState(false);

  const model = models[selectedModel];
  const example = examples[selectedExample];

  const selectExample = (index: number) => {
    setSelectedExample(index);
    setCopyStatus('Copy prompt ⧉');
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(example[2]);
      setCopyStatus('Copied ✓');
    } catch {
      setCopyStatus('Select the prompt above to copy');
    }
  };

  return (
    <div className="page-shell">
      <HeroSection />
      <FeaturesSection
        model={model}
        example={example}
        selectedModel={selectedModel}
        selectedExample={selectedExample}
        setSelectedModel={setSelectedModel}
        selectExample={selectExample}
        copyStatus={copyStatus}
        copyPrompt={copyPrompt}
      />
      <CtaSection annual={annual} setAnnual={setAnnual} />
    </div>
  );
}