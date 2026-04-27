/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Trophy, 
  Truck, 
  Package, 
  AlertCircle,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GeminiService } from './services/geminiService';
import { Deal, AppSpecs, ComparisonResult } from './types';

export default function App() {
  const [url, setUrl] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ComparisonResult | null>(null);
  const [showSpecs, setShowSpecs] = useState(false);
  const [copied, setCopied] = useState(false);

  // Specifications
  const [specs, setSpecs] = useState<AppSpecs>({
    location: 'Mumbai, Maharashtra',
    condition: 'New',
    sitesToSkip: []
  });

  const gemini = useMemo(() => new GeminiService(process.env.GEMINI_API_KEY || ''), []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      const data = await gemini.findDeals(
        url,
        specs.location,
        specs.condition,
        specs.sitesToSkip
      );
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch deals. Please check your API key and URL.');
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = () => {
    if (results?.rawResponse) {
      navigator.clipboard.writeText(results.rawResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 flex flex-col p-6 overflow-hidden max-w-[1440px] mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center text-[10px] font-bold italic text-white uppercase">D</div>
          <span className="text-sm font-medium tracking-widest uppercase text-white wordmark">Ddrop</span>
        </div>
      </header>

      {/* Search Hero */}
      <div className="max-w-4xl mx-auto w-full mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 p-1.5 bg-[#161616] border border-[#333] rounded-lg shadow-2xl focus-within:border-primary transition-all">
          <input
            type="text"
            placeholder="Paste Amazon.in product URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-transparent flex-1 px-3 py-2 text-sm outline-none placeholder-gray-600"
          />
          <button
            disabled={isSearching || !url}
            className="bg-white text-black px-6 py-2 rounded-md text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-tighter"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search Deals'}
          </button>
        </form>
        
        <AnimatePresence>
          {results && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 text-xs"
            >
              <div className="px-3 py-1 bg-green-950/30 border border-green-900/50 text-green-400 rounded-full font-medium shadow-lg shadow-green-950/20">
                ✨ {results.summary}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 overflow-auto lg:overflow-visible">
        
        {/* Left: Results List */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar min-h-[400px]">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center py-20 bg-[#121212]/30 rounded-xl border border-[#333]/30"
              >
                <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
                <p className="mt-4 text-sm font-medium text-gray-500 uppercase tracking-widest">Inquisitive Grounding...</p>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 bg-red-950/10 border border-red-900/30 rounded-xl flex items-start gap-4"
              >
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-400 text-sm uppercase tracking-wider">Search Failed</h3>
                  <p className="text-xs text-red-500/80 mt-1">{error}</p>
                </div>
              </motion.div>
            ) : results ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-3"
              >
                {results.deals.map((deal, idx) => (
                  <ResultCard key={`${deal.siteName}-${idx}`} deal={deal} />
                ))}
                
                {!results.deals.length && results.rawResponse && (
                  <div className="bg-[#161616] border border-[#333] rounded-xl p-6">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-4 tracking-widest">RAW_AI_OUTPUT</h3>
                    <pre className="text-[10px] text-gray-500 font-mono whitespace-pre-wrap leading-relaxed">
                      {results.rawResponse}
                    </pre>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-600 border border-dashed border-[#333] rounded-xl">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-xs uppercase tracking-widest font-bold">Waiting for input</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Specifications Panel */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-[#121212] border border-[#333] rounded-xl flex flex-col h-fit sticky top-0 shadow-xl">
            <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#161616] rounded-t-xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specifications</span>
              <div className={`w-2 h-2 rounded-full ${isSearching ? 'bg-primary animate-pulse' : 'bg-primary/30'}`}></div>
            </div>
            <div className="p-5 flex flex-col gap-6">
              
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-tighter">Delivery Location</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={specs.location} 
                    onChange={(e) => setSpecs({ ...specs, location: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#333] rounded-md px-3 py-2 text-xs text-white outline-none focus:border-primary transition-colors"
                  />
                  <Truck className="absolute right-3 top-2.5 w-3 h-3 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-tighter">Condition</label>
                <div className="flex bg-[#1c1c1c] p-1 rounded-md border border-[#333]/50">
                  <button 
                    onClick={() => setSpecs({ ...specs, condition: 'New' })}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${specs.condition === 'New' ? 'bg-[#333] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    New Only
                  </button>
                  <button 
                    onClick={() => setSpecs({ ...specs, condition: 'Any' })}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${specs.condition === 'Any' ? 'bg-[#333] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Any
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-tighter">Sites to Skip</label>
                <textarea 
                  value={specs.sitesToSkip.join(', ')}
                  onChange={(e) => setSpecs({ ...specs, sitesToSkip: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-md px-3 py-2 text-xs text-white outline-none h-20 resize-none focus:border-primary transition-colors"
                  placeholder="e.g. Snapdeal, Meesho"
                ></textarea>
              </div>

              <div className="mt-4 border-t border-[#333] pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-gray-500">Real-time Grounding</span>
                  <span className="text-[10px] text-primary uppercase font-bold italic">Active</span>
                </div>
                <div className="w-full bg-[#222] h-1 rounded-full overflow-hidden">
                  <div className={`bg-primary h-full transition-all duration-1000 ${isSearching ? 'w-full animate-pulse' : 'w-[85%]'}`}></div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="mt-8 flex justify-between items-center py-4 border-t border-[#222] text-[10px] text-gray-600 font-mono">
        <div>READY: ENGINE_v4.2 // GROUNDING ENABLED</div>
        <div className="uppercase">© 2024 DDROP SYSTEM</div>
      </footer>
    </div>
  );
}

const ResultCard: React.FC<{ deal: Deal }> = ({ deal }) => {
  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${new URL(deal.url).hostname}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-[#161616] border rounded-xl p-4 flex items-center justify-between shadow-lg relative group transition-all duration-300 ${deal.isBestDeal ? 'border-brand/30 bg-[#1a1a1a] ring-1 ring-brand/5' : 'border-[#333] hover:border-[#444]'}`}
    >
      {deal.isBestDeal && (
        <div className="absolute -top-3 -right-2 bg-brand text-black text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg shadow-brand/10 z-10">
          Best Deal 🏆
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg p-2 flex items-center justify-center shadow-inner transition-colors ${deal.isBestDeal ? 'bg-white' : 'bg-[#222] border border-[#333]'}`}>
          <img 
            src={faviconUrl} 
            alt={deal.siteName} 
            className="w-full h-full object-contain filter" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const textNode = document.createElement('span');
              textNode.innerText = deal.siteName.charAt(0);
              textNode.className = "text-sm font-bold uppercase";
              e.currentTarget.parentElement?.appendChild(textNode);
            }}
          />
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium">{deal.siteName}</div>
          <div className={`font-black tracking-tight ${deal.isBestDeal ? 'text-2xl text-white' : 'text-xl text-gray-200'}`}>
            <span className="text-gray-500 font-medium text-sm mr-1">₹</span>
            {deal.price.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="text-right flex flex-col items-end gap-2">
        <div className="flex flex-col items-end">
          <div className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${deal.stockStatus === 'In Stock' ? 'text-green-500' : 'text-gray-500'}`}>
            {deal.stockStatus || 'Available'}
          </div>
          <div className="text-[10px] text-gray-500 font-medium">
            {deal.deliveryInfo || 'Standard Delivery'}
          </div>
        </div>
        <a 
          href={deal.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-4 py-2 rounded-md text-xs font-bold transition-all shadow-lg ${deal.isBestDeal ? 'bg-primary text-white hover:bg-primary/90' : 'bg-[#2a2a2a] text-white border border-[#444] hover:bg-[#333]'}`}
        >
          Visit Site
        </a>
      </div>
    </motion.div>
  );
};
