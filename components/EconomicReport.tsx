import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChartBarIcon, LinkIcon } from './IconComponents';

// Fix: Update GroundingChunk interface to match the @google/genai library types,
// making the `web` property optional to resolve assignment errors.
interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

const EconomicReport: React.FC = () => {
  const [report, setReport] = useState<string>('');
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);
      setSources([]);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: '今日の経済市況について、最新のニュースを参考に初心者にも分かりやすく箇条書きでまとめてください。',
            config: {
              tools: [{googleSearch: {}}],
            },
        });
        
        setReport(response.text);

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
          setSources(groundingChunks);
        }

      } catch (err) {
        console.error("経済レポートの取得に失敗しました:", err);
        setError("レポートの取得に失敗しました。時間をおいて再試行してください。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-slate-500 text-center py-4">経済レポートを生成中...</p>;
    }
    if (error) {
      return <p className="text-red-500 text-center py-4">{error}</p>;
    }
    return (
      <div className="text-slate-600 space-y-2 text-sm whitespace-pre-wrap">
         {report}
      </div>
    );
  };

  const renderSources = () => {
    // Fix: Filter out sources that do not have a web URI to ensure all links are valid.
    const validSources = sources.filter(s => s.web?.uri);

    if (validSources.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-semibold text-slate-600">参考にしたWebサイト</h4>
        </div>
        <ul className="list-disc list-inside space-y-1">
          {validSources.map((source, index) => (
            <li key={index} className="text-sm text-indigo-600 truncate">
              <a 
                href={source.web!.uri!} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline"
                title={source.web!.title || source.web!.uri!}
              >
                {source.web!.title || source.web!.uri!}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
      <div className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">
        <ChartBarIcon className="w-6 h-6 text-indigo-500" />
        <h3>今日の経済レポート</h3>
      </div>
      {renderContent()}
      {renderSources()}
    </div>
  );
};

export default EconomicReport;