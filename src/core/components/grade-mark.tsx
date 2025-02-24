import { Box, Typography } from '@mui/material';

interface GradeMarkProps {
  value: number;
  size: number;
  backgroundColor?: string;
  fontSize?: string | number;
  showDecimal?: number;
  isAuthorRank?: boolean;
}

export const GRADE_MARK_COLORS = [
  '#FF0000',
  '#FF3300',
  '#FF6600',
  '#FF9900',
  '#FFCC00',
  '#FFFF00',
  '#B1DE00',
  '#CCFF00',
  '#99FF00',
  '#66FF00',
];

export const GradeMark = ({
  value: propsValue,
  size,
  fontSize = '16px',
  backgroundColor,
  isAuthorRank = false,
  showDecimal = 1,
}: GradeMarkProps) => {
  const value = propsValue ?? 0;
  const color = isAuthorRank ? '#00fff9' : value > 0 ? GRADE_MARK_COLORS[Math.round(value - 1)] || '#000' : '#fff';

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `conic-gradient(black ${360 - (value / 10) * 360}deg, ${color} ${360 - (value / 10) * 360}deg)`,
      }}
    >
      <Box
        sx={{
          width: size * 0.75,
          height: size * 0.75,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: (theme) => backgroundColor || theme.palette.grey[900],
        }}
      >
        <Typography
          sx={{
            mb: '-1px',
            letterSpacing: '-2px',
            ml: '-2px',
            textAlign: 'left',
          }}
          fontSize={fontSize}
          color={color}
          fontWeight="bold"
        >
          {value === 0 && '-'}
          {value > 0 && <>{showDecimal > 0 ? parseFloat(value.toFixed(showDecimal)) : value.toFixed(0)}</>}
        </Typography>
      </Box>
    </Box>
  );
};
