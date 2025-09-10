# **Nano-Banana-AIO🍌**
### Description

Nano Banana AIO is a web application built with React and the Google Gemini API for image generation and editing. It provides an all-in-one interface for creating, editing, and manipulating images using AI-powered tools. The app supports multiple modes including text-to-image generation, single-image editing, multi-image editing, and canvas-based drawing with AI enhancements.
| Preview 1 | Preview 2 |
|-----------|-----------|
| ![Preview 1](https://cdn-uploads.huggingface.co/production/uploads/65bb837dbfb878f46c77de4c/HPWorlMZ54aAbYX5ZO42L.png) | ![Preview 2](https://cdn-uploads.huggingface.co/production/uploads/65bb837dbfb878f46c77de4c/9iJW5s27TsaFfUiantqNB.png) |

| Preview 3 | Preview 4 |
|-----------|-----------|
| ![Preview 3](https://cdn-uploads.huggingface.co/production/uploads/65bb837dbfb878f46c77de4c/3zvCL16T-U5_wHdxj7-iZ.png) | ![Preview 4](https://cdn-uploads.huggingface.co/production/uploads/65bb837dbfb878f46c77de4c/6ochDpdS_Uu28oAzOdYwB.png) |

This project demonstrates integration with the Gemini API for tasks like generating images from prompts and editing existing images based on textual instructions.

## Features

- **Image Generation Mode**: Create new images from text prompts using the Gemini Imagen model.
- **Editor Mode**: Upload a single image and apply AI edits via text prompts.
- **Multi-Image Mode**: Upload multiple images, combine or edit them collectively with a single prompt.
- **Canvas Mode**: Draw freely on a canvas and use AI to generate or refine images based on your sketches and prompts.
- **Drag-and-Drop Support**: Easily upload images by dragging files into the interface.
- **Clear Functionality**: Reset the canvas or remove uploaded images with a single click.
- **Error Handling**: Displays user-friendly error messages for API failures or invalid inputs.
- **Responsive Design**: Works on desktop and mobile devices, with touch support for drawing.

## Prerequisites

- Node.js (version 18 or higher recommended)
- A Google Gemini API key (obtain from [Google AI Studio](https://aistudio.google.com/app/apikey))

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/nano-banana-aio.git
   cd nano-banana-aio
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your API key:
   ```
   API_KEY=your_google_gemini_api_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

   The app will be available at `http://localhost:3000` (assuming Next.js setup; adjust if using Create React App).

## Usage

1. Open the app in your browser.
2. Select a mode from the toolbar:
   - **Editor**: Upload an image, enter a prompt (e.g., "Make the sky blue"), and submit.
   - **Multi-Image**: Upload multiple images, enter a prompt (e.g., "Combine into a collage"), and submit.
   - **Canvas**: Draw on the canvas, enter a prompt (e.g., "Turn this sketch into a landscape"), and submit.
   - **Image Gen**: Enter a prompt (e.g., "A futuristic city at night"), and generate an image.
3. Use the trash icon to clear the current content.
4. Submit prompts using the send button; results will appear in the display area.

Note: The app uses models like `imagen-4.0-generate-001` for generation and `gemini-2.5-flash-image-preview` for editing. Ensure your API key has access to these models.

## Dependencies

- React (v18+)
- Lucide React (for icons)
- Google GenAI SDK (`@google/genai`)
- TypeScript (for type safety)

Full list available in `package.json`.

## License

Licensed under the Apache License 2.0. See the license header in the source code for details.

## Credits

- Built by [Prithiv Sakthi](https://www.linkedin.com/in/prithiv-sakthi/)
- Powered by Google Gemini API

For issues or contributions, please open a pull request or issue on the repository.
