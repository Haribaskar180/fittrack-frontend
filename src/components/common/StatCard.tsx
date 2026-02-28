import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import { ElementType } from 'react';
import { SvgIconProps } from '@mui/material';

interface Props {
  icon: ElementType<SvgIconProps>;
  value: string | number;
  label: string;
  color?: string;
  trend?: { value: number; label: string };
}

export default function StatCard({ icon: Icon, value, label, color = 'primary.main', trend }: Props) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
            {trend && (
              <Chip
                label={`${trend.value >= 0 ? '+' : ''}${trend.value}% ${trend.label}`}
                size="small"
                color={trend.value >= 0 ? 'success' : 'error'}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          <Box sx={{ color, p: 1, bgcolor: `${color}20`, borderRadius: 2 }}>
            <Icon sx={{ fontSize: 32, color }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
