import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useSnackbar } from '../SnackbarContext';
import { useTranslation } from "react-i18next"
import config from '../config.js';

const ImageUpload = ({ onImageUpload }) => {
  const { t } = useTranslation(); 
  const { showSnackbar } = useSnackbar();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length) {
      const { errors } = fileRejections[0];
      if (errors.length) {
        showSnackbar(errors[0].message, "error");
        return;
      }
    }

    const totalImages = images.length + acceptedFiles.length;
    if (totalImages > config.UPLOAD_LIMIT) {
      showSnackbar(t("error.configuration.image_upload.max"), "error");
      return;
    }

    const newImages = acceptedFiles.map((file) => {
      return Object.assign(file, {
        preview: URL.createObjectURL(file),
        imageName: file.name,
      });
    });

    uploadImages(newImages);
  }, [images, onImageUpload, showSnackbar]);

  const uploadImages = async (images) => {
    const formData = new FormData();

    images.forEach((image) => {
      formData.append('file', image);
    });

    try {
      setLoading(true);
      const response = await axios.post(`${config.SERVER_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          let percentCompleted = Math.floor((loaded * 100) / total);
          setProgress(percentCompleted)
        }
      });
      showSnackbar(response.data.message, 'success');

      const uploadedFiles = response.data.files;
      const uploadedImages = uploadedFiles.map(file => ({
        preview: file.url,
        filename: file.filename,
      }));
      setImages(uploadedImages);
      onImageUpload(uploadedImages);
    } catch (error) {
      const errorResponse = error?.response?.data
      if (errorResponse) {
        showSnackbar(errorResponse?.message, 'error');
      }else {
        showSnackbar(t("error.server_connection"), 'error')
      }
      console.error('Error uploading images:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const deleteImage = async (filename) => {
    try {
      const response = await axios.delete(`${config.SERVER_URL}/uploads/${filename}`);
      showSnackbar(response.data.message, 'success');

      // Update the state to remove the deleted image
      const updatedImages = images.filter((image) => image.filename !== filename);
      setImages(updatedImages);
      onImageUpload(updatedImages);
    } catch (error) {
      if (error?.response?.data) {
        showSnackbar(error.response.data.message, 'error');
      } else {
        showSnackbar(t("error.server_connection"), 'error');
      }
      console.error('Error deleting image:', error);
    }
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = images[index];
    deleteImage(imageToRemove.filename);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
    multiple: true,
    maxFiles: config.UPLOAD_LIMIT,
  });

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          padding: '1rem',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '1rem',
          height: '250px', // Increase height
          width: '400px',  // Increase width
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          borderRadius: '4px',
        }}
      >
        <input {...getInputProps()}  data-testid="file-input"/>
        {isDragActive ? (
          <Typography sx={{fontSize: "14px", color: "rgb(117, 117, 117)" }}>{t("configuration.image_upload.file_drop")}</Typography>
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
            <Typography sx={{fontSize: "14px", color: "rgb(117, 117, 117)" }}>
              {t("configuration.image_upload.description")} {config.UPLOAD_LIMIT}
            </Typography>
          )}
        </>
        )}
      </Box>
      <Box display="flex" flexWrap="wrap" gap="1rem">
        {images.map((image, index) => (
          <Box
            key={index}
            position="relative"
            display="inline-flex"
            flexDirection="column"
            alignItems="center"
          >
            <img
              src={image.preview}
              alt="preview"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '4px',
                marginBottom: '0.5rem',
              }}
            />
            <IconButton
              size="small"
              onClick={() => handleRemoveImage(index)}
              sx={{ position: 'absolute', top: '0', right: '0' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ImageUpload;
