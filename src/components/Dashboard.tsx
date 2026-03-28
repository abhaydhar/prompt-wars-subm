import React, { useState } from 'react';
import { 
  Box, Container, Typography, Grid, Card, CardContent, IconButton, 
  Button, Stack, Paper, Chip, Avatar, Tooltip
} from '@mui/material';
import { 
  Plus, Upload, Settings, LogOut, History, BookOpen, 
  Video, FileText, Fingerprint, Layers, Layout, Repeat 
} from 'lucide-react';
import { useStudentStore } from '../store/useStudentStore';
import FileUploader from './FileUploader';
import ContentResult from './ContentResult';

const Dashboard: React.FC = () => {
  const { profile, history, clearProfile } = useStudentStore();
  const [showUploader, setShowUploader] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  const activeContent = history.find(c => c.id === selectedContent);

  if (activeContent) {
    return (
      <ContentResult 
        content={activeContent} 
        onBack={() => setSelectedContent(null)} 
      />
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box className="glass" sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', py: 2, position: 'sticky', top: 0, zIndex: 10 }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 'bold' }}>
                {profile?.disability[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Welcome back,</Typography>
                <Typography variant="h6" fontWeight={700}>Student Explorer</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Accessibility Settings">
                <IconButton onClick={clearProfile}><Settings size={20} /></IconButton>
              </Tooltip>
              <Button 
                variant="contained" 
                startIcon={<Plus size={18} />}
                onClick={() => setShowUploader(true)}
              >
                New Material
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {history.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Box sx={{ 
              width: 120, height: 120, bgcolor: 'rgba(99,102,241,0.1)', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', margin: '0 auto mb 4'
            }}>
              <BookOpen size={64} color="#6366f1" />
            </Box>
            <Typography variant="h4" className="gradient-text" gutterBottom mt={4}>
              Start Your Learning Journey
            </Typography>
            <Typography color="text.secondary" mb={4}>
              Upload a lecture, textbook, or diagram to get instantly accessible formats.
            </Typography>
            <Button 
              variant="outlined" 
              size="large" 
              startIcon={<Upload size={20} />}
              onClick={() => setShowUploader(true)}
            >
              Upload Material
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h5" fontWeight={800} mb={4}>Recent Materials</Typography>
            <Grid container spacing={3}>
              {history.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.3)' }
                    }}
                    onClick={() => setSelectedContent(item.id)}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={1} mb={2}>
                        {item.formats.signLanguageVideo && <Chip size="small" icon={<Video size={14} />} label="Sign" color="primary" variant="outlined" />}
                        {item.formats.tactileDescription && <Chip size="small" icon={<Fingerprint size={14} />} label="Tactile" color="secondary" variant="outlined" />}
                      </Stack>
                      <Typography variant="h6" fontWeight={700} gutterBottom>{item.originalTitle}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.formats.simplifiedText?.substring(0, 100)}...
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      {/* Upload Dialog/Modal Overlay */}
      {showUploader && (
        <Box sx={{ 
          position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.8)', 
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)'
        }}>
          <Container maxWidth="sm">
            <Paper sx={{ p: 4, position: 'relative' }}>
              <IconButton 
                sx={{ position: 'absolute', top: 16, right: 16 }}
                onClick={() => setShowUploader(false)}
              >
                <LogOut size={20} />
              </IconButton>
              <FileUploader onComplete={() => setShowUploader(false)} />
            </Paper>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
