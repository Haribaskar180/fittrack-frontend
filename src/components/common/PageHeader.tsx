import { Box, Typography, Button } from '@mui/material';

interface Props {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
      <Box>
        <Typography variant="h4" fontWeight={700}>{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && (
        <Button variant="contained" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  );
}
