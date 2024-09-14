import { memo } from 'react';

import { Box, Chip, ChipOwnProps } from '@mui/material';

import { useInjectable } from '../hooks/useInjectable';
import useSubscription from '../hooks/useSubscription';
import { AppTypes } from '../services/types';

interface TagChipsProps {
  tags: string[];
  size?: ChipOwnProps['size'];
}

export const TagChips = memo(({ tags, size = 'small' }: TagChipsProps) => {
  const { tags$ } = useInjectable(AppTypes.TagsService);
  const allTags = useSubscription(tags$, []);

  const items = allTags.filter((tag) => tags.includes(tag.name));

  return (
    <>
      {items.map((tag) => (
        <Chip
          avatar={
            <Box
              sx={{
                background: tag.color,
                borderRadius: '50%',
              }}
            />
          }
          size={size}
          variant="filled"
          label={tag.name}
        />
      ))}
    </>
  );
});
