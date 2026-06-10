import React, { useCallback, useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { createTheme } from "@mui/material/styles";
import { CssBaseline, Box, Typography, IconButton, Button, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import axios from "axios";
import { useSnackbar } from "../SnackbarContext";
import { useTranslation, Trans } from "react-i18next";
import useMediaQuery from "@mui/material/useMediaQuery";
import config from "../config.js";

const theme = createTheme();

// Helper: generate a consistent color from a class name (HSL)
const getColorForClass = (className) => {
  let hash = 0;
  for (let i = 0; i < className.length; i++) {
    hash = className.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
};

// Draw image with bounding boxes, scaled to fit within maxWidth/maxHeight
const drawImageWithBoxes = (canvas, imageUrl, detections, maxWidth = 800, maxHeight = 600) => {
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = () => {
    // Calculate display size preserving aspect ratio
    let width = img.width;
    let height = img.height;
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    canvas.width = width;
    canvas.height = height;

    // Draw image scaled to display size
    ctx.drawImage(img, 0, 0, width, height);

    if (detections && detections.length) {
      const scaleX = width / img.width;
      const scaleY = height / img.height;

      detections.forEach((det) => {
        const [x1, y1, x2, y2] = det.bbox;
        // Scale coordinates to display size
        const sx1 = x1 * scaleX;
        const sy1 = y1 * scaleY;
        const sx2 = x2 * scaleX;
        const sy2 = y2 * scaleY;
        const boxWidth = sx2 - sx1;
        const boxHeight = sy2 - sy1;

        const classColor = getColorForClass(det.class);
        ctx.strokeStyle = classColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(sx1, sy1, boxWidth, boxHeight);

        // Draw label background
        const label = `[${det.class}] ${(det.confidence * 100).toFixed(1)}%`;
        ctx.font = "bold 16px Arial";
        const textMetrics = ctx.measureText(label);
        const textWidth = textMetrics.width;
        const textHeight = 20;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(sx1, sy1 - textHeight - 4, textWidth + 8, textHeight + 4);

        // Draw label text
        ctx.fillStyle = classColor;
        ctx.fillText(label, sx1 + 4, sy1 - 6);
      });
    }
  };
  img.src = imageUrl;
};

const ImageUpload = ({ onImageUpload, settingsImages }) => {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [images, setImages] = useState(settingsImages);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inferenceLoading, setInferenceLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [inferredImageUrl, setInferredImageUrl] = useState(null);
  const [inferredDetections, setInferredDetections] = useState([]);
  const largeCanvasRef = useRef(null);
  const isSmallDevice = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    setImages(settingsImages);
    // Reset inference preview when external images change
    setInferredImageUrl(null);
    setInferredDetections([]);
    setSelectedIndex(null);
  }, [settingsImages]);

  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      if (fileRejections.length) {
        const { errors } = fileRejections[0];
        if (errors.length) {
          showSnackbar(errors[0].message, "error");
          return;
        }
      }

      if (loading) {
        showSnackbar(t("error.upload_in_progress"), "info");
        return;
      }

      const totalImages = images.length + acceptedFiles.length;
      if (totalImages > config.UPLOAD_LIMIT) {
        showSnackbar(t("error.configuration.image_upload.max"), "error");
        return;
      }

      const newImages = acceptedFiles.map((file) => ({
        file: file,
        preview: URL.createObjectURL(file),
        imageName: file.name,
      }));

      uploadImages(newImages);
    },
    [images, onImageUpload, showSnackbar, loading]
  );

  const uploadImages = async (newImages) => {
    const formData = new FormData();
    newImages.forEach((image) => {
      formData.append("file", image.file);
    });

    try {
      setLoading(true);
      const response = await axios.post(`${config.SERVER_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          let percentCompleted = Math.floor((loaded * 100) / total);
          setProgress(percentCompleted);
        },
      });
      showSnackbar(response.data.message, "success");

      const uploadedFiles = response.data.files;
      const uploadedImages = uploadedFiles.map((file, idx) => ({
        preview: file.url,
        filename: file.filename,
        imageName: newImages[idx]?.imageName || file.filename,
      }));

      const updatedImages = [...images, ...uploadedImages];
      setImages(updatedImages);
      onImageUpload(updatedImages);
      // Clear inference preview after new upload
      setInferredImageUrl(null);
      setInferredDetections([]);
      setSelectedIndex(null);
    } catch (error) {
      const errorResponse = error?.response?.data;
      showSnackbar(errorResponse?.message || t("error.server_connection"), "error");
      console.error("Error uploading images:", error);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const deleteImage = async (filename, isNotFound = false) => {
    try {
      if (isNotFound) {
        const updatedImages = images.filter((image) => image.filename !== filename);
        setImages(updatedImages);
        onImageUpload(updatedImages);
      } else {
        const response = await axios.delete(`${config.SERVER_URL}/uploads/${filename}`);
        showSnackbar(response.data.message, "success");
        const updatedImages = images.filter((image) => image.filename !== filename);
        setImages(updatedImages);
        onImageUpload(updatedImages);
      }
      // If the deleted image was the one showing inference, clear preview
      if (selectedIndex !== null && images[selectedIndex]?.filename === filename) {
        setSelectedIndex(null);
        setInferredImageUrl(null);
        setInferredDetections([]);
      }
    } catch (error) {
      showSnackbar(error?.response?.data?.message || t("error.server_connection"), "error");
      console.error("Error deleting image:", error);
    }
  };

  const handleImageError = (index) => {
    const updatedImages = [...images];
    updatedImages[index].isNotFound = true;
    setImages(updatedImages);
    showSnackbar(t("error.image_not_found"), "error");
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = images[index];
    if (imageToRemove && !imageToRemove.filename) {
      let parts = imageToRemove.src?.split("/") || [];
      let filename = parts[parts.length - 1];
      imageToRemove.filename = filename;
    }
    if (imageToRemove && imageToRemove.filename) {
      deleteImage(imageToRemove.filename, imageToRemove.isNotFound);
    } else {
      console.error("Error deleting image: filename missing");
    }
  };

  // Run inference on selected image and display result in large preview area
  const runInferenceOnSelected = async () => {
    if (selectedIndex === null) {
      showSnackbar(t("menu.no_image_selected"), "warning");
      return;
    }

    const image = images[selectedIndex];
    if (!image) {
      showSnackbar(t("error.inference_failed"), "error");
      return;
    }

    // Extract filename from src
    let filename = null;
    if (image.src) {
      const parts = image.src.split('/');
      filename = parts[parts.length - 1];
    }
    if (!filename && image.filename) filename = image.filename;
    if (!filename && image.name) filename = image.name;

    if (!filename) {
      console.error("Could not determine filename for image", image);
      showSnackbar(t("error.inference_failed"), "error");
      return;
    }

    // Get labels from localStorage
    let labels = [];
    try {
      const settings = localStorage.getItem("settings_settings");
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.configuration && parsed.configuration.labels) {
          labels = parsed.configuration.labels.map(labelObj => labelObj.id);
        }
      }
    } catch (err) {
      console.error("Failed to read labels from localStorage", err);
    }

    setInferenceLoading(true);
    try {
      const response = await axios.post(`${config.SERVER_URL}/infer`, {
        filenames: [filename],
        labels: labels,
      });
      const detections = response.data.results?.[0] || [];

      setInferredImageUrl(image.preview || image.src);
      setInferredDetections(detections);

      // Draw on large canvas after a short delay (ensures ref is ready)
      setTimeout(() => {
        if (largeCanvasRef.current) {
          drawImageWithBoxes(largeCanvasRef.current, image.preview || image.src, detections, 800, 600);
        }
      }, 50);

      showSnackbar(t("menu.inference_success"), "success");
    } catch (error) {
      console.error("Inference error:", error);
      const errorMsg = error?.response?.data?.message || error.message || t("error.inference_failed");
      showSnackbar(errorMsg, "error");
    } finally {
      setInferenceLoading(false);
    }
  };

  const clearInference = () => {
    setInferredImageUrl(null);
    setInferredDetections([]);
    if (largeCanvasRef.current) {
      const ctx = largeCanvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, largeCanvasRef.current.width, largeCanvasRef.current.height);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: true,
    maxFiles: config.UPLOAD_LIMIT,
    disabled: loading,
  });

  return (
    <>
      <CssBaseline />
      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed #ccc",
          padding: isSmallDevice ? "0.5rem" : "1rem",
          textAlign: "center",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          borderRadius: "4px",
          minHeight: "200px",
          width: isSmallDevice ? "auto" : "52vw",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <input {...getInputProps()} data-testid="file-input" disabled={loading} />
        {isDragActive ? (
          <Typography sx={{ fontSize: "14px", color: "rgb(117, 117, 117)" }}>
            {t("configuration.image_upload.file_drop")}
          </Typography>
        ) : (
          <>
            {loading ? (
              <>
                {progress > 0 && progress < 100 ? (
                  <>
                    <progress value={progress} max={100} />
                    <p>{progress}%</p>
                  </>
                ) : (
                  <div className="loading">{t("loading")}</div>
                )}
              </>
            ) : (
              <Typography sx={{ fontSize: "14px", color: "rgb(117, 117, 117)" }}>
                <Trans
                  i18nKey="configuration.image_upload.description"
                  values={{ maxImages: config.UPLOAD_LIMIT }}
                />
              </Typography>
            )}
          </>
        )}
      </Box>

      {/* Inference Controls */}
      <Box display="flex" gap="1rem" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={inferenceLoading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
          onClick={runInferenceOnSelected}
          disabled={inferenceLoading || images.length === 0 || selectedIndex === null}
        >
          {t("menu.inference_button")}
        </Button>
        {inferredDetections.length > 0 && (
          <Button variant="outlined" onClick={clearInference}>
            {t("menu.clear_results")}
          </Button>
        )}
      </Box>

      {/* Large Inference Preview Area */}
      {inferenceLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        inferredImageUrl && (
          <Box
            sx={{
              mt: 2,
              mb: 2,
              p: 2,
              border: "1px solid #ccc",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
              textAlign: "center",
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
               {t("menu.inference_result")}
            </Typography>
            <canvas
              ref={largeCanvasRef}
              style={{
                maxWidth: "100%",
                height: "auto",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </Box>
        )
      )}

      {/* Image Gallery (Thumbnails) */}
      <Box display="flex" flexWrap="wrap" gap="1rem">
        {images.map((image, index) => {
          const isSelected = selectedIndex === index;
          return (
            <Box
              key={index}
              position="relative"
              display="inline-flex"
              flexDirection="column"
              alignItems="center"
              onClick={() => setSelectedIndex(index)}
              sx={{
                cursor: "pointer",
                border: isSelected ? "3px solid #1976d2" : "3px solid transparent",
                borderRadius: "8px",
                padding: "2px",
                transition: "all 0.2s",
                "&:hover": { opacity: 0.9 },
              }}
            >
              <img
                src={image.preview || image.src}
                alt="preview"
                onError={() => handleImageError(index)}
                style={{
                  width: isSmallDevice ? "65px" : "82px",
                  height: isSmallDevice ? "65px" : "82px",
                  objectFit: "cover",
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                }}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                sx={{ position: "absolute", top: "0", right: "0" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export default ImageUpload;