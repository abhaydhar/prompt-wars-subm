import React, { useState } from 'react';
import { 
  Box, Container, Typography, Stack, IconButton, Tab, Tabs, 
  Card, CardContent, Button, Divider, List, ListItem, 
  ListItemIcon, ListItemText, Checkbox, Chip, Paper
} from '@mui/material';
import { 
  ArrowLeft, Video, FileText, Fingerprint, Layers, 
  Layout, Repeat, Download, Share2
} from 'lucide-react';
import { ContentOutput } from '../types/student';

interface ContentResultProps {
  content: ContentOutput;
  onBack: () => void;
}

const ContentResult: React.FC<ContentResultProps> = ({ content, onBack }) => {
  const [tab, setTab] = useState(0);

  const renderSignLanguage = () => (
    <Box className="animate-in">
      <Paper sx={{ overflow: 'hidden', mb: 4, bgcolor: 'black', position: 'relative', pt: '56.25%' }}>
        <iframe 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          src={content.formats.signLanguageVideo} 
          title="Sign Language Explanation"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Paper>
      <Typography variant="h6" gutterBottom color="primary.main">Sign Language Script (ASL)</Typography>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
        {content.formats.signLanguageScript}
      </Typography>
    </Box>
  );

  const renderScreenReader = () => (
    <Box className="animate-in">
      <Card sx={{ p: 4, mb: 4 }}>
        <div dangerouslySetInnerHTML={{ __html: content.formats.screenReaderTranscript || '' }} />
      </Card>
      <Button variant="outlined" startIcon={<Download size={18} />}>Download Optimized HTML</Button>
    </Box>
  );

  const renderTactile = () => (
    <Box className="animate-in">
      <Card sx={{ p: 4, mb: 4, borderLeft: '4px solid', borderColor: 'secondary.main' }}>
        <Typography variant="h6" gutterBottom color="secondary.main">Tactile Guide & Spatial Blueprint</Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {content.formats.tactileDescription}
        </Typography>
      </Card>
      <Typography variant="body2" color="muted-foreground">This guide describes visual spatial relationships for screen reader users and tactile feedback.</Typography>
    </Box>
  );

  const renderSimplified = () => (
    <Box className="animate-in">
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip label="Grade 5 Level" color="info" variant="filled" />
        <Typography variant="body2" color="text.secondary">Simplified for cognitive clarity & dyslexia</Typography>
      </Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, lineHeight: 1.6 }}>
        {content.formats.simplifiedText}
      </Typography>
    </Box>
  );

  const renderKinesthetic = () => (
    <Box className="animate-in">
      <Typography variant="h6" gutterBottom>Step-by-Step Learning Guide</Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>Interactive checklist for practical application.</Typography>
      <List>
        {content.formats.kinestheticSteps?.map((step, idx) => (
          <ListItem key={idx} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', mb: 2, borderRadius: 3 }}>
            <ListItemIcon><Checkbox color="primary" /></ListItemIcon>
            <ListItemText primary={`Step ${idx + 1}: ${step}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderSummaries = () => (
    <Box className="animate-in">
      <Typography variant="h6" gutterBottom>Personalized Pace Summaries</Typography>
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderTop: '4px solid', borderColor: 'success.main' }}>
            <CardContent>
              <Chip label="Slow" size="small" color="success" sx={{ mb: 2 }} />
              <Typography variant="body2">{content.formats.summaryVariants?.slow}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderTop: '4px solid', borderColor: 'warning.main' }}>
            <CardContent>
              <Chip label="Medium" size="small" color="warning" sx={{ mb: 2 }} />
              <Typography variant="body2">{content.formats.summaryVariants?.medium}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderTop: '4px solid', borderColor: 'error.main' }}>
            <CardContent>
              <Chip label="Fast" size="small" color="error" sx={{ mb: 2 }} />
              <Typography variant="body2">{content.formats.summaryVariants?.fast}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {content.formats.flashcards && (
        <Box sx={{ mt: 6 }}>
           <Typography variant="h6" gutterBottom>Spaced Repetition Flashcards</Typography>
           <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 2 }}>
             {content.formats.flashcards.map((card, idx) => (
               <Card key={idx} sx={{ minWidth: 280, p: 2, bgcolor: 'rgba(99,102,241,0.05)' }}>
                 <Typography variant="subtitle2" color="primary.main" gutterBottom>QUESTION</Typography>
                 <Typography fontWeight={700} mb={2}>{card.question}</Typography>
                 <Divider sx={{ my: 1 }} />
                 <Typography variant="subtitle2" color="secondary.main" gutterBottom>ANSWER</Typography>
                 <Typography>{card.answer}</Typography>
               </Card>
             ))}
           </Stack>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box className="glass" sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', py: 2, position: 'sticky', top: 0, zIndex: 10 }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton onClick={onBack} size="small"><ArrowLeft size={20} /></IconButton>
              <Typography variant="h6" fontWeight={700}>{content.originalTitle}</Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <IconButton size="small"><Share2 size={20} /></IconButton>
              <Button variant="outlined" size="small" startIcon={<Download size={18} />}>Save All</Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 6 }}>
          <Tabs 
            value={tab} 
            onChange={(_, val) => setTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Tab icon={<Video size={18} />} label="Sign Language" iconPosition="start" sx={{ px: 4 }} />
            <Tab icon={<FileText size={18} />} label="Screen Reader" iconPosition="start" sx={{ px: 4 }} />
            <Tab icon={<Fingerprint size={18} />} label="Tactile Guide" iconPosition="start" sx={{ px: 4 }} />
            <Tab icon={<Layers size={18} />} label="Simplified" iconPosition="start" sx={{ px: 4 }} />
            <Tab icon={<Layout size={18} />} label="Kinesthetic" iconPosition="start" sx={{ px: 4 }} />
            <Tab icon={<Repeat size={18} />} label="Pace & Summary" iconPosition="start" sx={{ px: 4 }} />
          </Tabs>
        </Box>

        <Box sx={{ mt: 4 }}>
          {tab === 0 && renderSignLanguage()}
          {tab === 1 && renderScreenReader()}
          {tab === 2 && renderTactile()}
          {tab === 3 && renderSimplified()}
          {tab === 4 && renderKinesthetic()}
          {tab === 5 && renderSummaries()}
        </Box>
      </Container>
    </Box>
  );
};

export default ContentResult;
import { Grid } from '@mui/material';
