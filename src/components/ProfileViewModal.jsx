import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Collapse,
} from '@mui/material';
import {
  CloseRounded,
  PhotoCameraRounded,
  DeleteOutlineRounded,
  WarningAmberRounded,
} from '@mui/icons-material';

export default function ProfileViewModal({
  open,
  onClose,
  src,
  name,
  onChangePhoto,
  onRemovePhoto,
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const initialLetter = name ? name.charAt(0).toUpperCase() : 'U';

  const handleClose = () => {
    setConfirmRemove(false);
    onClose();
  };

  const handleConfirmRemove = () => {
    setConfirmRemove(false);
    onClose();
    onRemovePhoto();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '6px',
          overflow: 'hidden',
          p: 0,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Typography sx={{ fontWeight: 700, }}>
          Profile Picture
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseRounded fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          px: 3,
        }}
      >
        <Avatar
          src={src}
          alt={name}
          sx={{
            width: 200,
            height: 200,
            mb: 2.5,
            fontSize: '4.5rem',
            fontWeight: 800,
            bgcolor: '#2563EB',
            color: '#FFFFFF',
          }}
        >
          {initialLetter}
        </Avatar>

        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
          {name || 'User Profile'}
        </Typography>

        <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
          {src
            ? 'You can change, crop or remove your current profile picture.'
            : 'No profile picture set. Upload a photo or keep your initial badge.'}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', maxWidth: 280 }}>
          <Button
            variant="contained"
            onClick={() => {
              handleClose();
              onChangePhoto();
            }}
            startIcon={<PhotoCameraRounded />}
            sx={{
              bgcolor: '#2563EB',
              color: 'white',
              fontWeight: 700,
              borderRadius: '6px',
              py: 1.2,
              textTransform: 'none',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            {src ? 'Change & Edit Photo' : 'Upload New Photo'}
          </Button>

          {src && onRemovePhoto && (
            <>
              {/* Step 1 — trigger */}
              {!confirmRemove && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setConfirmRemove(true)}
                  startIcon={<DeleteOutlineRounded />}
                  sx={{
                    borderColor: '#EF4444',
                    color: '#EF4444',
                    fontWeight: 600,
                    borderRadius: '6px',
                    py: 1,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'rgba(239, 68, 68, 0.08)',
                      borderColor: '#DC2626',
                    },
                  }}
                >
                  Remove Photo
                </Button>
              )}

              {/* Step 2 — inline confirmation */}
              <Collapse in={confirmRemove} unmountOnExit>
                <Box
                  sx={{
                    border: '1.5px solid #EF4444',
                    borderRadius: '8px',
                    p: 2,
                    bgcolor: 'rgba(239,68,68,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <WarningAmberRounded sx={{ color: '#EF4444', fontSize: 20, mt: '2px', flexShrink: 0 }} />
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'text.primary',
                        lineHeight: 1.5,
                      }}
                    >
                      Are you sure you want to remove your profile picture? This action cannot be undone.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setConfirmRemove(false)}
                      sx={{
                        fontWeight: 600,
                        borderRadius: '6px',
                        py: 0.9,
                        textTransform: 'none',
                        fontSize: 13,
                        borderColor: 'divider',
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleConfirmRemove}
                      sx={{
                        fontWeight: 700,
                        borderRadius: '6px',
                        py: 0.9,
                        textTransform: 'none',
                        fontSize: 13,
                        bgcolor: '#EF4444',
                        color: '#fff',
                        '&:hover': { bgcolor: '#DC2626' },
                        boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
                      }}
                    >
                      Yes, Remove
                    </Button>
                  </Box>
                </Box>
              </Collapse>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
