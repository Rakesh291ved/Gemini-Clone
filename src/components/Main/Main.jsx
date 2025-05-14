import React, { useContext, useRef, useState, useEffect } from "react";
import "./Main.css";
import { assets } from "../../assets/assets";
import { Context } from "../../context/ContextDefinition";

const Main = () => {
  const {
    onSent,
    recentPrompt,
    showResult,
    loading,
    resultData,
    setInput,
    input,
  } = useContext(Context);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [imageError, setImageError] = useState(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

        setInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [setInput]);

  // Reinitialize speech recognition when showResult changes
  useEffect(() => {
    // If we have an active recognition instance, stop it
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Reinitialize speech recognition
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

        setInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [showResult, setInput]);

  // Stop microphone recording
  const stopMicrophone = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Handle microphone click
  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      stopMicrophone();
    } else {
      // Create a new instance each time to ensure it works in all states
      if (
        "SpeechRecognition" in window ||
        "webkitSpeechRecognition" in window
      ) {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("");

          setInput(transcript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }

      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Validate image file
  const validateImageFile = (file) => {
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      return "Please select a valid image file.";
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return "Image size should be less than 10MB.";
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    setImageError(null);
    const file = e.target.files[0];

    if (!file) return;

    // Validate the file
    const error = validateImageFile(file);
    if (error) {
      setImageError(error);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage({
        data: event.target.result,
        file: file,
      });
      console.log("Image loaded successfully:", file.name, file.type);
    };

    reader.onerror = () => {
      setImageError("Failed to read the image file. Please try again.");
    };

    reader.readAsDataURL(file);
  };

  // Trigger file input click when gallery icon is clicked
  const handleGalleryClick = () => {
    fileInputRef.current.click();
  };

  // Handle sending prompt with image
  const handleSend = () => {
    if (imageError) {
      setImageError(null);
      setSelectedImage(null);
      return;
    }

    if (input.trim() || selectedImage) {
      // Stop microphone recording if active
      stopMicrophone();

      onSent(input, selectedImage);
      setSelectedImage(null);
      setImageError(null);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (input.trim() || selectedImage) && !imageError) {
      e.preventDefault();
      handleSend();
    }
  };

  // Remove selected image
  const removeImage = (e) => {
    e.stopPropagation();
    setSelectedImage(null);
    setImageError(null);
  };

  return (
    <div className="main">
      <div className="nav">
        <p>Gemini</p>
        <img src={assets.user_icon} alt="User" />
      </div>
      <div className="main-container">
        {!showResult ? (
          <div className="welcome-container">
            <div className="greet">
              <p>
                <span>Hello, Vedanth</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="result">
            <div className="result-title">
              <img src={assets.user_icon} alt="User" />
              <p>{recentPrompt}</p>
            </div>
            <div className="result-data">
              <img src={assets.gemini_icon} alt="Gemini" />
              {loading ? (
                <div className="loader">
                  <hr />
                  <hr />
                  <hr />
                </div>
              ) : (
                <p dangerouslySetInnerHTML={{ __html: resultData }}></p>
              )}
            </div>
          </div>
        )}

        <div className="main-bottom">
          <div className="search-box">
            {selectedImage && (
              <div className="selected-image-container">
                <img
                  src={selectedImage.data}
                  alt="Selected"
                  className="selected-image"
                />
                <button className="remove-image-btn" onClick={removeImage}>
                  ×
                </button>
              </div>
            )}
            {imageError && <div className="image-error">{imageError}</div>}
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              type="text"
              placeholder="Ask me anything"
              onKeyDown={handleKeyDown}
            />
            <div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileSelect}
              />
              <img
                src={assets.gallery_icon}
                alt="Gallery"
                onClick={handleGalleryClick}
                className={selectedImage ? "icon-active" : ""}
              />
              <img
                src={assets.mic_icon}
                alt="Microphone"
                onClick={handleMicClick}
                className={isListening ? "mic-active" : ""}
              />
              {input.trim() || (selectedImage && !imageError) ? (
                <img onClick={handleSend} src={assets.send_icon} alt="Send" />
              ) : null}
            </div>
          </div>
          <p className="bottom-info">
            Gemini is inaccurate sometimes use your brain instead you fuckers
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
