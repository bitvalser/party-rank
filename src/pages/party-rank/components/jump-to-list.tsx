import { MouseEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Menu, MenuItem, Typography } from '@mui/material';

import { RankItem } from '../../../core/interfaces/rank-item.interface';

interface JumpToListProps {
  partyItems: RankItem[];
  renderTitle?: ({ title, index }: { title: string; index: number }) => string;
  onJump: (index: number) => void;
}

export const JumpToList = ({ partyItems, renderTitle, onJump }: JumpToListProps) => {
  const [anchor, setAnchor] = useState(null);
  const { t } = useTranslation();

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
        {t('COMMON.GO')}
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
              {renderTitle ? renderTitle({ title: option.name, index }) : `${index + 1} - ${option.name}`}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
