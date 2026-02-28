import { Box, Typography, Button, SvgIconProps } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';
import { ElementType } from 'react';

interface Props {
  message?: string;
  icon?: ElementType<SvgIconProps>;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({
  message = 'No data found',
  icon: Icon = InboxOutlined,
  action,
}: Props) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Icon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {message}
      </Typography>
      {action && (
        <Button variant="outlined" onClick={action.onClick} sx={{ mt: 1 }}>
          {action.label}
        </Button>
      )}
    </Box>
  );
}
