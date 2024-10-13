import React, { useState } from 'react';
import * as fal from "@fal-ai/serverless-client";
import { Image, Download } from 'lucide-react';

fal.config({
  credentials: "dc90dd1b-1826-4251-8db9-1dd21655ac72:387d2fbe137862a4bf10c117d88d40b0"
});

function App() {
  const [prompt, setPrompt] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateImages = async () => {
    setIsLoading(true);
    setImageUrls([]);
    try {
      const imagePromises = Array(3).fill(null).map(() => 
        fal.subscribe("fal-ai/flux-pro/v1.1", {
          input: {
            prompt: prompt,
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
              update.logs.map((log) => log.message).forEach(console.log);
            }
          },
        })
      );

      const results = await Promise.all(imagePromises);
      const urls = results.map(result => result.images[0].url);
      setImageUrls(urls);
    } catch (error) {
      console.error("Error generating images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">이미지 생성 앱</h1>
      <div className="w-full max-w-md">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="이미지 설명을 입력하세요"
          className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={generateImages}
          disabled={isLoading || !prompt}
          className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {isLoading ? '생성 중...' : '이미지 3장 생성'}
        </button>
      </div>
      {isLoading && (
        <div className="mt-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {imageUrls.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="flex flex-col items-center">
              <img src={url} alt={`Generated ${index + 1}`} className="w-full h-auto rounded shadow-lg" />
              <button
                onClick={() => downloadImage(url, index)}
                className="mt-2 flex items-center bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-sm"
              >
                <Download size={16} className="mr-1" />
                다운로드
              </button>
            </div>
          ))}
        </div>
      )}
      {imageUrls.length === 0 && !isLoading && (
        <div className="mt-8 flex flex-col items-center text-gray-500">
          <Image size={48} />
          <p className="mt-2">생성된 이미지가 여기에 표시됩니다</p>
        </div>
      )}
    </div>
  );
}

export default App;