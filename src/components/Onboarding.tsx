import React, { useState } from 'react';
import { 
  Box, Container, Typography, Button, Card, CardContent, 
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, 
  Checkbox, FormGroup, Slider, Switch, Divider, Stack 
} from '@mui/material';
import { Accessibility, User, ArrowRight, Check } from 'lucide-react';
import { useStudentStore } from '../store/useStudentStore';
import { DisabilityType, LearningPreference, StudentProfile } from '../types/student';

const Onboarding: React.FC = () => {
  const setProfile = useStudentStore((state) => state.setProfile);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<StudentProfile>({
    disability: 'None',
    preferences: [],
    pace: 1,
    language: 'English',
    textSize: 16,
    highContrast: false,
    reduceAnimations: false,
    readingOrderSimplified: false,
  });

  const handlePreferenceChange = (pref: LearningPreference) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter(p => p !== pref)
        : [...prev.preferences, pref]
    }));
  };

  const handleComplete = () => {
    setProfile(formData);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Box className="animate-in">
            <Typography variant="h4" gutterBottom className="gradient-text">Which best describes you?</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>This helps us tailor your learning experience.</Typography>
            <RadioGroup 
              value={formData.disability} 
              onChange={(e) => setFormData({...formData, disability: e.target.value as DisabilityType})}
            >
              <Stack spacing={2}>
                {(['Deaf', 'Blind', 'Motor', 'Cognitive', 'Multiple', 'None'] as DisabilityType[]).map((type) => (
                  <Card 
                    key={type}
                    component="label"
                    sx={{ 
                      cursor: 'pointer',
                      border: formData.disability === type ? '2px solid' : '1px solid',
                      borderColor: formData.disability === type ? 'primary.main' : 'rgba(255,255,255,0.05)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }
                    }}
                  >
                    <CardContent sx={{ py: 2, display: 'flex', alignItems: 'center' }}>
                      <Radio value={type} />
                      <Typography variant="h6" sx={{ ml: 2 }}>{type === 'None' ? 'Prefer not to say' : type}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </RadioGroup>
          </Box>
        );
      case 2:
        return (
          <Box className="animate-in">
            <Typography variant="h4" gutterBottom className="gradient-text">Learning preferences?</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>How do you focus best?</Typography>
            <Stack spacing={2}>
              {(['Visual', 'Auditory', 'Reading', 'Kinesthetic'] as LearningPreference[]).map((pref) => (
                <Card 
                  key={pref}
                  component="label"
                  sx={{ 
                    cursor: 'pointer',
                    border: formData.preferences.includes(pref) ? '2px solid' : '1px solid',
                    borderColor: formData.preferences.includes(pref) ? 'secondary.main' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <CardContent sx={{ py: 2, display: 'flex', alignItems: 'center' }}>
                    <Checkbox checked={formData.preferences.includes(pref)} onChange={() => handlePreferenceChange(pref)} color="secondary" />
                    <Typography variant="h6" sx={{ ml: 2 }}>{pref}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        );
      case 3:
        return (
          <Box className="animate-in">
            <Typography variant="h4" gutterBottom className="gradient-text">Accessibility Settings</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>Adjust your interface controls.</Typography>
            <Stack spacing={4}>
              <Box>
                <Typography gutterBottom>Learning Pace: {formData.pace}x</Typography>
                <Slider 
                  value={formData.pace} 
                  min={0.5} max={2} step={0.1} 
                  onChange={(_, val) => setFormData({...formData, pace: val as number})}
                  marks={[{value: 1, label: 'Normal'}]}
                />
              </Box>
              <Box>
                <Typography gutterBottom>Text Size: {formData.textSize}px</Typography>
                <Slider 
                  value={formData.textSize} 
                  min={12} max={32} step={2} 
                  onChange={(_, val) => setFormData({...formData, textSize: val as number})}
                />
              </Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>High Contrast Mode</Typography>
                <Switch checked={formData.highContrast} onChange={(e) => setFormData({...formData, highContrast: e.target.checked})} />
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>Reduce Animations</Typography>
                <Switch checked={formData.reduceAnimations} onChange={(e) => setFormData({...formData, reduceAnimations: e.target.checked})} />
              </Stack>
            </Stack>
          </Box>
        );
      default: return null;
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', pt: 8, pb: 4 }}>
      <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 2, color: 'white' }}>
          <Accessibility size={32} />
        </Box>
        <Typography variant="h5" fontWeight={800}>AdaptiveEd</Typography>
      </Box>

      {renderStep()}

      <Box sx={{ mt: 'auto', pt: 6 }}>
        <Stack direction="row" spacing={2}>
          {step > 1 && (
            <Button variant="outlined" fullWidth onClick={() => setStep(step - 1)}>Back</Button>
          )}
          {step < 3 ? (
            <Button variant="contained" fullWidth endIcon={<ArrowRight />} onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button variant="contained" fullWidth color="secondary" startIcon={<Check />} onClick={handleComplete}>Finish Setup</Button>
          )}
        </Stack>
      </Box>
    </Container>
  );
};

export default Onboarding;
