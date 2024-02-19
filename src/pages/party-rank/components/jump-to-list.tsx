import { MouseEventHandler, useState } from 'react';

import { Button, Menu, MenuItem, Typography } from '@mui/material';

import { RankItem } from '../../../core/interfaces/rank-item.interface';

interface JumpToListProps {
  partyItems: RankItem[];
  onJump: (index: number) => void;
}

export const JumpToList = ({ partyItems, onJump }: JumpToListProps) => {
  const [anchor, setAnchor] = useState(null);

  const handleClose = () => {
    setAnchor(null);
  };

  const handleMenu: MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchor(event.target);
  };

  const handleSelect = (index: number) => () => {
    setAnchor(null);
    onJump(index);
  };

  return (
    <>
      <Button size="small" variant="text" onClick={handleMenu}>
        Перейти
      </Button>
      <Menu
        sx={{
          maxWidth: 520,
        }}
        id="lock-menu"
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={handleClose}
      >
        {partyItems.map((option, index) => (
          <MenuItem key={option.id} onClick={handleSelect(index)}>
            <Typography>
              {index + 1} - {option.name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
