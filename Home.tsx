/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import {Content, GoogleGenAI, Modality} from '@google/genai';
import {
  Library,
  LoaderCircle,
  Paintbrush,
  PictureInPicture,
  SendHorizontal,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

function parseError(error: string) {
  const regex = /{"error":(.*)}/gm;
  const m = regex.exec(error);
  try {
    const e = m[1];
    const err = JSON.parse(e);
    return err.message || error;
  } catch (e) {
    return error;
  }
}

export default function Home() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [multiImages, setMultiImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mode, setMode] = useState<
    'canvas' | 'editor' | 'imageGen' | 'multi-img-edit'
  >('editor');

  // Load background image when generatedImage changes
  useEffect(() => {
    if (generatedImage && canvasRef.current) {
      // Use the window.Image constructor to avoid conflict with Next.js Image component
      const img = new window.Image();
      img.onload = () => {
        backgroundImageRef.current = img;
        drawImageToCanvas();
      };
      img.src = generatedImage;
    }
  }, [generatedImage]);

  // Initialize canvas with white background when component mounts
  useEffect(() => {
    if (canvasRef.current) {
      initializeCanvas();
    }
  }, []);

  // Initialize canvas with white background
  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Fill canvas with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Draw the background image to the canvas
  const drawImageToCanvas = () => {
    if (!canvasRef.current || !backgroundImageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Fill with white background first
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the background image
    ctx.drawImage(
      backgroundImageRef.current,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  };

  // Get the correct coordinates based on canvas scaling
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Calculate the scaling factor between the internal canvas size and displayed size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Apply the scaling to get accurate coordinates
    return {
      x:
        (e.nativeEvent.offsetX ||
          e.nativeEvent.touches?.[0]?.clientX - rect.left) * scaleX,
      y:
        (e.nativeEvent.offsetY ||
          e.nativeEvent.touches?.[0]?.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const {x, y} = getCoordinates(e);

    // Prevent default behavior to avoid scrolling on touch devices
    if (e.type === 'touchstart') {
      e.preventDefault();
    }

    // Start a new path without clearing the canvas
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    // Prevent default behavior to avoid scrolling on touch devices
    if (e.type === 'touchmove') {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const {x, y} = getCoordinates(e);

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    // For canvas, we must clear the actual drawing strokes
    if (mode === 'canvas' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // For all modes, we clear the background/uploaded/generated image state
    setGeneratedImage(null);
    setMultiImages([]);
    backgroundImageRef.current = null;
  };

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith('image/'),
    );
    if (fileArray.length === 0) return;

    if (mode === 'multi-img-edit') {
      const readers = fileArray.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readers).then((newImages) => {
        setMultiImages((prev) => [...prev, ...newImages]);
      });
    } else {
      // single file modes
      const reader = new FileReader();
      reader.onload = () => {
        setGeneratedImage(reader.result as string);
      };
      reader.readAsDataURL(fileArray[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500');
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.add('border-blue-500');
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-blue-500');
  };

  const removeImage = (indexToRemove: number) => {
    setMultiImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'imageGen') {
        const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: prompt,
          config: {
            numberOfImages: 1,
          },
        });

        const base64ImageBytes: string =
          response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
        setGeneratedImage(imageUrl);
      } else {
        // Editor, Canvas, and Multi-Img modes
        if (mode === 'editor' && !generatedImage) {
          setErrorMessage('Please upload an image to edit.');
          setShowErrorModal(true);
          return;
        }

        if (mode === 'multi-img-edit' && multiImages.length === 0) {
          setErrorMessage('Please upload at least one image to edit.');
          setShowErrorModal(true);
          return;
        }

        const parts: any[] = [];
        if (mode === 'canvas') {
          if (!canvasRef.current) return;
          const canvas = canvasRef.current;
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.fillStyle = '#FFFFFF';
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          tempCtx.drawImage(canvas, 0, 0);
          const imageB64 = tempCanvas.toDataURL('image/png').split(',')[1];
          parts.push({inlineData: {data: imageB64, mimeType: 'image/png'}});
        } else if (mode === 'editor') {
          const imageB64 = generatedImage.split(',')[1];
          parts.push({inlineData: {data: imageB64, mimeType: 'image/png'}});
        } else if (mode === 'multi-img-edit') {
          multiImages.forEach((img) => {
            parts.push({
              inlineData: {data: img.split(',')[1], mimeType: 'image/png'},
            });
          });
        }

        parts.push({text: prompt});

        const contents: Content[] = [{role: 'USER', parts}];

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents,
          config: {
            responseModalities: [Modality.TEXT, Modality.IMAGE],
          },
        });

        const data = {
          success: true,
          message: '',
          imageData: null,
          error: undefined,
        };
        for (const part of response.candidates[0].content.parts) {
          if (part.text) {
            data.message = part.text;
          } else if (part.inlineData) {
            data.imageData = part.inlineData.data;
          }
        }

        if (data.imageData) {
          const imageUrl = `data:image/png;base64,${data.imageData}`;
          if (mode === 'multi-img-edit') {
            setGeneratedImage(imageUrl);
            setMultiImages([]);
            setMode('editor');
          } else {
            setGeneratedImage(imageUrl);
          }
        } else {
          setErrorMessage(
            data.message || 'Failed to generate image. Please try again.',
          );
          setShowErrorModal(true);
        }
      }
    } catch (error) {
      console.error('Error submitting:', error);
      setErrorMessage(error.message || 'An unexpected error occurred.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Close the error modal
  const closeErrorModal = () => {
    setShowErrorModal(false);
  };

  // Add touch event prevention function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Function to prevent default touch behavior on canvas
    const preventTouchDefault = (e) => {
      if (isDrawing) {
        e.preventDefault();
      }
    };

    canvas.addEventListener('touchstart', preventTouchDefault, {
      passive: false,
    });
    canvas.addEventListener('touchmove', preventTouchDefault, {
      passive: false,
    });

    // Remove event listener when component unmounts
    return () => {
      canvas.removeEventListener('touchstart', preventTouchDefault);
      canvas.removeEventListener('touchmove', preventTouchDefault);
    };
  }, [isDrawing]);

  const baseDisplayClass =
    'w-full sm:h-[60vh] h-[30vh] min-h-[320px] bg-white/90 touch-none flex items-center justify-center p-4 transition-colors';

  return (
    <>
      <div className="min-h-screen notebook-paper-bg text-gray-900 flex flex-col justify-start items-center">
        <main className="container mx-auto px-3 sm:px-6 py-5 sm:py-10 pb-32 max-w-5xl w-full">
          {/* Header section with title and tools */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 sm:mb-6 gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-0 leading-tight font-mega">
                Nano Banana AIO
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                constructed with the{' '}
                <a
                  className="underline"
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer">
                  gemini api
                </a>{' '}
                by{' '}
                <a
                  className="underline"
                  href="https://www.linkedin.com/in/prithiv-sakthi/"
                  target="_blank"
                  rel="noopener noreferrer">
                  prithivsakthi-ur
                </a>
              </p>
            </div>

            <menu className="flex items-center bg-gray-300 rounded-full p-2 shadow-sm self-start sm:self-auto">
              <div className="flex items-center bg-gray-200/80 rounded-full p-1 mr-2">
                <button
                  onClick={() => setMode('editor')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${
                    mode === 'editor'
                      ? 'bg-white shadow'
                      : 'text-gray-600 hover:bg-gray-300/50'
                  }`}
                  aria-pressed={mode === 'editor'}>
                  <PictureInPicture className="w-4 h-4" /> Editor
                </button>
                <button
                  onClick={() => setMode('multi-img-edit')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${
                    mode === 'multi-img-edit'
                      ? 'bg-white shadow'
                      : 'text-gray-600 hover:bg-gray-300/50'
                  }`}
                  aria-pressed={mode === 'multi-img-edit'}>
                  <Library className="w-4 h-4" /> Multi-Image
                </button>
                <button
                  onClick={() => setMode('canvas')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${
                    mode === 'canvas'
                      ? 'bg-white shadow'
                      : 'text-gray-600 hover:bg-gray-300/50'
                  }`}
                  aria-pressed={mode === 'canvas'}>
                  <Paintbrush className="w-4 h-4" /> Canvas
                </button>
                <button
                  onClick={() => setMode('imageGen')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${
                    mode === 'imageGen'
                      ? 'bg-white shadow'
                      : 'text-gray-600 hover:bg-gray-300/50'
                  }`}
                  aria-pressed={mode === 'imageGen'}>
                  <Sparkles className="w-4 h-4" /> Image Gen
                </button>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm transition-all hover:bg-gray-50 hover:scale-110">
                <Trash2
                  className="w-5 h-5 text-gray-700"
                  aria-label="Clear Canvas"
                />
              </button>
            </menu>
          </div>

          {/* Main display section */}
          <div className="w-full mb-6">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              aria-label="Upload image"
              multiple={mode === 'multi-img-edit'}
            />
            {mode === 'canvas' ? (
              <canvas
                ref={canvasRef}
                width={960}
                height={540}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="border-2 border-black w-full sm:h-[60vh] h-[30vh] min-h-[320px] bg-white/90 touch-none"
                style={{ cursor: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23FF0000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 5v14M5 12h14\"/></svg>') 12 12, crosshair" }}
              />
            ) : mode === 'editor' ? (
              <div
                className={`${baseDisplayClass} ${
                  generatedImage ? 'border-black' : 'border-gray-400'
                } border-2 border-dashed`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}>
                {generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Current image"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-center text-gray-500 hover:text-gray-700 p-8 rounded-lg">
                    <h3 className="font-semibold text-lg">Upload Image</h3>
                    <p>Click to upload or drag & drop</p>
                  </button>
                )}
              </div>
            ) : mode === 'multi-img-edit' ? (
              <div
                className={`${baseDisplayClass} ${
                  multiImages.length > 0
                    ? 'border-black items-start'
                    : 'border-gray-400'
                } border-2 border-dashed flex-col`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}>
                {multiImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 overflow-y-auto w-full h-full">
                    {multiImages.map((image, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={image}
                          alt={`upload preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remove image ${index + 1}`}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors aspect-square">
                      + Add more
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-center text-gray-500 hover:text-gray-700 p-8 rounded-lg m-auto">
                    <h3 className="font-semibold text-lg">Upload one or multiple images</h3>
                    <p>Click to upload or drag & drop</p>
                  </button>
                )}
              </div>
            ) : (
              // Image Gen mode display
              <div
                className={`${baseDisplayClass} border-2 ${
                  generatedImage ? 'border-black' : 'border-gray-400'
                }`}>
                {generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated image"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <h3 className="font-semibold text-lg">Image Generation</h3>
                    <p>Enter a prompt below to create an image</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === 'imageGen'
                    ? 'Describe the image you want to create...'
                    : 'Add your change...'
                }
                className="w-full p-3 sm:p-4 pr-12 sm:pr-14 text-sm sm:text-base border-2 border-black bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all font-mono"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-none bg-black text-white hover:cursor-pointer hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                {isLoading ? (
                  <LoaderCircle
                    className="w-5 sm:w-6 h-5 sm:h-6 animate-spin"
                    aria-label="Loading"
                  />
                ) : (
                  <SendHorizontal
                    className="w-5 sm:w-6 h-5 sm:h-6"
                    aria-label="Submit"
                  />
                )}
              </button>
            </div>
          </form>
        </main>
        {/* Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-700">
                  Failed to generate
                </h3>
                <button
                  onClick={closeErrorModal}
                  className="text-gray-400 hover:text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="font-medium text-gray-600">
                {parseError(errorMessage)}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}