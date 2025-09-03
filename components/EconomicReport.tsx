import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChartBarIcon, LinkIcon } from './IconComponents';

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
            contents: '最新のニュースに基づき、今日の主要なニュースと経済市況の概要を初心者にも分かりやすくレポートしてください。',
            config: {
              tools: [{googleSearch: {}}],
            },
        });
        
        setReport(response.text);

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
           const validChunks: GroundingChunk[] = groundingChunks.filter(
            (chunk: any): chunk is GroundingChunk => chunk.web && chunk.web.uri
          );
          setSources(validChunks);
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
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 mt-4">ニュースと経済レポートを生成中...</p>
        </div>
      );
    }
    if (error) {
      return <p className="text-red-500 text-center py-4">{error}</p>;
    }
    return (
      <ul className="text-slate-700 space-y-2 text-sm list-disc list-outside ml-4">
         {report.split('\n').filter(line => line.trim() !== '').map((line, index) => {
            const cleanedLine = line.replace(/^[\s*-]+/, '');
            return <li key={index}>{cleanedLine}</li>
         })}
      </ul>
    );
  };

  const renderSources = () => {
    if (isLoading || sources.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-5 h-5 text-slate-500" />
            <h4 className="text-sm font-semibold text-slate-700">参照元サイト</h4>
        </div>
        <div className="space-y-2">
          {sources.map((source, index) => (
            <a 
              key={index}
              href={source.web!.uri!} 
              target="_blank" 
              rel="noopener noreferrer" 
              title={source.web!.title || source.web!.uri!}
              className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 hover:bg-fuchsia-50 border border-transparent hover:border-fuchsia-200 transition-all duration-200 group"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-white rounded-md border border-slate-200 flex items-center justify-center group-hover:border-fuchsia-300">
                <LinkIcon className="w-4 h-4 text-slate-400 group-hover:text-fuchsia-500"/>
              </div>
              <span className="text-sm text-fuchsia-800 font-medium truncate group-hover:underline">
                {source.web!.title || source.web!.uri!}
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
      <div className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">
        <ChartBarIcon className="w-6 h-6 text-fuchsia-500" />
        <h3>今日のニュースと経済レポート</h3>
      </div>
      {renderContent()}
      {renderSources()}
    </div>
  );
};

export default EconomicReport;