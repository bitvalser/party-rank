import { DateTime } from 'luxon';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, Button, Card, CardActions, CardContent, Chip, Grid, Typography } from '@mui/material';

import { PartyRank, PartyRankStatus } from '../../../core/interfaces/party-rank.interface';

interface PartyItemProps {
  data: PartyRank;
}

export const PartyItem = memo(({ data }: PartyItemProps) => {
  const { createdDate, creator, deadlineDate, finishDate, id, name, status, finishedDate } = data;
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/party-rank/${id}`);
  };

  const handleTableView = () => {
    navigate(`/party-rank/${id}/table`);
  };

  return (
    <Card>
      <CardContent>
        <Grid container direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="div">
            {name}
          </Typography>
          <Grid item>
            {status === PartyRankStatus.Ongoing && <Chip color="primary" size="small" label="В процессе" />}
            {status === PartyRankStatus.Rating && <Chip color="secondary" size="small" label="Голосование" />}
            {status === PartyRankStatus.Finished && <Chip color="success" size="small" label="Завершён" />}
          </Grid>
        </Grid>
        <Grid
          sx={{
            marginTop: 1,
            padding: 1,
            paddingBottom: 0,
          }}
          container
          direction="column"
          spacing={1}
        >
          {status === PartyRankStatus.Ongoing && (
            <Typography>Дедлайн: {DateTime.fromISO(deadlineDate).toLocaleString(DateTime.DATETIME_MED)}</Typography>
          )}
          {status === PartyRankStatus.Rating && (
            <Typography>
              Конец голосования: {DateTime.fromISO(finishDate).toLocaleString(DateTime.DATETIME_MED)}
            </Typography>
          )}
          {status === PartyRankStatus.Finished && finishedDate && (
            <Typography>Завершён: {DateTime.fromISO(finishedDate).toLocaleString(DateTime.DATETIME_MED)}</Typography>
          )}
        </Grid>
      </CardContent>
      <CardActions>
        {creator && (
          <Chip
            size="medium"
            avatar={<Avatar alt={creator.displayName} src={creator.photoURL} />}
            label={creator.displayName}
            variant="filled"
          />
        )}
        <Grid item xs>
          {createdDate && (
            <Typography fontSize={14} noWrap>
              Создан {DateTime.fromISO(createdDate).toLocaleString(DateTime.DATETIME_MED)}
            </Typography>
          )}
        </Grid>
        <Grid xs container direction="row" justifyContent="flex-end" spacing={1}>
          {status !== PartyRankStatus.Finished && (
            <Button size="small" onClick={handleView}>
              Учавстовать
            </Button>
          )}
          {status === PartyRankStatus.Finished && (
            <>
              <Button onClick={handleTableView} size="small">
                Итоговая таблица
              </Button>
              <Button onClick={handleView} size="small">
                Перейти
              </Button>
            </>
          )}
        </Grid>
      </CardActions>
    </Card>
  );
});
