import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Slider,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  RotateLeftRounded,
  RotateRightRounded,
  RestartAltRounded,
  ZoomInRounded,
  CloseRounded,
  CheckRounded,
} from '@mui/icons-material';

const CROP_SIZE = 280; // Size of circular crop viewport in UI
const OUTPUT_SIZE = 500; // Resolution of output cropped image (px)

export default function ImageCropModal({
  open,
  imageSrc,
  onClose,
  onCropComplete,
  isUploading = false,
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    setImageLoaded(false);
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw preview on canvas whenever zoom, rotation, offset, or imageLoaded changes
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    // Render at device pixel ratio so the preview itself is never blurry
    const dpr = window.devicePixelRatio || 1;
    const width = CROP_SIZE;
    const height = CROP_SIZE;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Calculate base scale so image fills the crop container
    const isRotated90 = rotation % 180 !== 0;
    const imgW = isRotated90 ? img.height : img.width;
    const imgH = isRotated90 ? img.width : img.height;
    const baseScale = Math.max(width / imgW, height / imgH);
    const totalScale = baseScale * zoom;

    ctx.save();
    // Center of canvas
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(totalScale, totalScale);
    ctx.translate(offset.x, offset.y);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  }, [zoom, rotation, offset, imageLoaded]);

  useEffect(() => {
    if (open && imageLoaded) {
      drawPreview();
    }
  }, [open, imageLoaded, drawPreview]);

  // Mouse / Touch handlers for dragging/panning
  const handleMouseDown = (e) => {
    if (isUploading) return;
    setIsDragging(true);
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isUploading) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handleRotateLeft = () => setRotation((r) => (r - 90 + 360) % 360);
  const handleRotateRight = () => setRotation((r) => (r + 90) % 360);

  // Generate cropped output blob
  const handleSave = () => {
    const img = imageRef.current;
    if (!img) return;

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = OUTPUT_SIZE;
    outputCanvas.height = OUTPUT_SIZE;
    const ctx = outputCanvas.getContext('2d');

    const isRotated90 = rotation % 180 !== 0;
    const imgW = isRotated90 ? img.height : img.width;
    const imgH = isRotated90 ? img.width : img.height;
    const baseScale = Math.max(OUTPUT_SIZE / imgW, OUTPUT_SIZE / imgH);
    const totalScale = baseScale * zoom;

    // Adjust pan offset ratio for output resolution
    const ratio = OUTPUT_SIZE / CROP_SIZE;

    ctx.save();
    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(totalScale, totalScale);
    ctx.translate(offset.x * ratio, offset.y * ratio);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    outputCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
        onCropComplete(file);
      },
      'image/jpeg',
      0.95
    );
  };

  return (
    <Dialog
      open={open}
      onClose={isUploading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '6px',
          p: 1,
          bgcolor: '#FFFFFF',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          fontWeight: 700,
          fontSize: '1.1rem',
          color: '#0F172A',
        }}
      >
        Adjust Profile Picture
        <IconButton onClick={onClose} disabled={isUploading} size="small">
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
        <Box
          sx={{
            width: CROP_SIZE,
            height: CROP_SIZE,
            borderRadius: '50%',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.25)',
            mt: 4,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              outline: '4px solid #0F172A',
              outlineOffset: '-1px',
              cursor: isDragging ? 'grabbing' : 'grab',
              bgcolor: '#0F172A',
              touchAction: 'none',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            {!imageLoaded && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#0F172A',
                }}
              >
                <CircularProgress size={32} sx={{ color: 'white' }} />
              </Box>
            )}

            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />

            {/*
              Upload overlay: solid tinted scrim, no backdropFilter.
              backdropFilter: blur() was smearing the photo underneath it —
              that's the "unwanted blurriness" from the original screenshot.
            */}
            {isUploading && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(15, 23, 42, 0.82)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  zIndex: 10,
                }}
              >
                <CircularProgress size={36} sx={{ color: '#F4A261' }} />
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                  Uploading photo...
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1.5, mb: 2 }}>
          Drag image to position within the circle
        </Typography>

        {/* Controls Toolbar */}
        <Box sx={{ width: '100%', px: 2 }}>
          {/* Zoom Slider */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <ZoomInRounded sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              onChange={(_, v) => setZoom(v)}
              disabled={isUploading || !imageLoaded}
              size="small"
              sx={{
                color: '#0F172A',
                '& .MuiSlider-thumb': { width: 16, height: 16 },
              }}
            />
          </Box>

          {/* Rotation & Reset Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Tooltip title="Rotate Left (-90°)">
              <span>
                <IconButton
                  onClick={handleRotateLeft}
                  disabled={isUploading || !imageLoaded}
                  size="small"
                  sx={{ border: '1px solid #E2E8F0' }}
                >
                  <RotateLeftRounded fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Rotate Right (+90°)">
              <span>
                <IconButton
                  onClick={handleRotateRight}
                  disabled={isUploading || !imageLoaded}
                  size="small"
                  sx={{ border: '1px solid #E2E8F0' }}
                >
                  <RotateRightRounded fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Reset Zoom & Rotation">
              <span>
                <IconButton
                  onClick={handleReset}
                  disabled={isUploading || !imageLoaded}
                  size="small"
                  sx={{ border: '1px solid #E2E8F0' }}
                >
                  <RestartAltRounded fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={isUploading}
          sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isUploading || !imageLoaded}
          startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <CheckRounded />}
          sx={{
            bgcolor: '#0F172A',
            color: 'white',
            fontWeight: 700,
            borderRadius: '6px',
            px: 3,
            textTransform: 'none',
            '&:hover': { bgcolor: '#1E293B' },
          }}
        >
          {isUploading ? 'Saving...' : 'Apply & Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}