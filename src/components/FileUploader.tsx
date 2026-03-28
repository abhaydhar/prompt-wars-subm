import React, { useState, useRef } from 'react';
import { 
  Box, Typography, Button, LinearProgress, Stack, Fade, Alert 
} from '@mui/material';
import { Upload, File, FileVideo, FileImage, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useStudentStore } from '../store/useStudentStore';
import { transformContent } from '../services/GeminiService';

interface FileUploaderProps {
  onComplete: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onComplete }) => {
  const { profile, addContent } = useStudentStore();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) return <FileVideo size={32} color="#818cf8" />;
    if (type.startsWith('image/')) return <FileImage size={32} color="#f472b6" />;
    return <FileText size={32} color="#6366f1" />;
  };

  const handleUpload = async () => {
    if (!file || !profile) return;
    
    setUploading(true);
    setError(null);
    setProgress(20);

    try {
      // Simulate progress while Gemini processes
      const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 5 : prev));
      }, 500);

      const result = await transformContent(file, profile);
      
      clearInterval(interval);
      setProgress(100);
      addContent(result);
      
      setTimeout(() => {
        onComplete();
      }, 800);
    } catch (err) {
      console.error(err);
      setError("Failed to process content. Ensure your API key is valid and file type is supported.");
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={800} gutterBottom>Transform Content</Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Upload any educational material to generate 6 accessible formats instantly.
      </Typography>

      {!file ? (
        <Box 
          onClick={() => fileInputRef.current?.click()}
          sx={{ 
            border: '2px dashed rgba(255,255,255,0.1)', 
            borderRadius: 4, py: 8, textAlign: 'center', cursor: 'pointer',
            transition: 'border-color 0.2s',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(255,255,255,0.02)' }
          }}
        >
          <Upload size={48} color="#64748b" style={{ marginBottom: 16 }} />
          <Typography variant="h6">Drag and drop file here</Typography>
          <Typography variant="body2" color="text.secondary">PDF, MP4, PNG, JPG, or Text (Max 500MB)</Typography>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept=".pdf,.mp4,.mov,.png,.jpg,.jpeg,.txt,.docx"
          />
        </Box>
      ) : (
        <Fade in>
          <Box>
            <Box sx={{ 
              p: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3, 
              display: 'flex', alignItems: 'center', gap: 3, mb: 4,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {getFileIcon(file.type)}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" noWrap fontWeight={600}>{file.name}</Typography>
                <Typography variant="body2" color="text.secondary">{(file.size / (1024 * 1024)).toFixed(2)} MB</Typography>
              </Box>
              {!uploading && (
                <Button variant="text" size="small" onClick={() => setFile(null)}>Remove</Button>
              )}
            </Box>

            {uploading ? (
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={600}>Transforming your content...</Typography>
                  <Typography variant="body2" color="primary.main">{progress}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                <Typography variant="body2" color="text.secondary" mt={2} sx={{ fontStyle: 'italic' }}>
                   Analyzing structure, generating sign language scripts, and simplifying language...
                </Typography>
              </Box>
            ) : (
              <Button 
                variant="contained" 
                fullWidth 
                size="large" 
                onClick={handleUpload}
                disabled={!file}
              >
                Start Transformation
              </Button>
            )}
          </Box>
        </Fade>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 3 }} icon={<AlertCircle size={20} />}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default FileUploader;
