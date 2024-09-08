import { DateTime } from 'luxon';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Avatar, Button, Card, CardActions, CardContent, Chip, Grid, Typography } from '@mui/material';

import { TagChips } from '../../../core/components/tag-chips.component';
import { PartyRank, PartyRankStatus } from '../../../core/interfaces/party-rank.interface';

interface PartyItemProps {
  data: PartyRank;
}

export const PartyItem = memo(({ data }: PartyItemProps) => {
  const { createdDate, creator, deadlineDate, finishDate, _id, name, status, finishedDate, showTable, tags } = data;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleView = () => {
    navigate(`/party-rank/${_id}`);
  };

  const handleTableView = () => {
    navigate(`/party-rank/${_id}/table`);
  };

  return (
    <Card>
      <CardContent>
        <Grid container direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="div">
            {name}
          </Typography>
          <Grid item>
            {status === PartyRankStatus.Ongoing && <Chip color="primary" size="small" label={t('RANK.ONGOING')} />}
            {status === PartyRankStatus.Rating && <Chip color="secondary" size="small" label={t('RANK.VOTING')} />}
            {status === PartyRankStatus.Finished && <Chip color="success" size="small" label={t('RANK.FINISHED')} />}
            {status === PartyRankStatus.Registration && (
              <Chip color="error" size="small" label={t('RANK.REGISTRATION')} />
            )}
          </Grid>
        </Grid>
        {tags?.length > 0 && (
          <Grid
            sx={{
              marginTop: 1,
              paddingBottom: 0,
            }}
            item
          >
            <TagChips tags={tags} />
          </Grid>
        )}
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
            <Typography>
              {t('RANK.DEADLINE_AT', { time: DateTime.fromISO(deadlineDate).toLocaleString(DateTime.DATETIME_MED) })}
            </Typography>
          )}
          {status === PartyRankStatus.Rating && (
            <Typography>
              {t('RANK.VOTING_DEADLINE_AT', {
                time: DateTime.fromISO(finishDate).toLocaleString(DateTime.DATETIME_MED),
              })}
            </Typography>
          )}
          {status === PartyRankStatus.Finished && finishedDate && (
            <Typography>
              {t('RANK.FINISHED_AT', {
                time: DateTime.fromISO(finishedDate).toLocaleString(DateTime.DATETIME_MED),
              })}
            </Typography>
          )}
        </Grid>
      </CardContent>
      <CardActions>
        <Grid
          sx={{
            height: 32,
          }}
          container
          direction="row"
          alignItems="center"
        >
          {creator && (
            <Chip
              size="medium"
              avatar={<Avatar alt={creator.displayName} src={creator.photoURL} />}
              label={creator.displayName}
              variant="filled"
            />
          )}
          <Grid
            sx={{
              ml: 1,
            }}
            item
            xs
          >
            {createdDate && (
              <Typography fontSize={14} noWrap>
                {t('RANK.CREATED_AT', { time: DateTime.fromISO(createdDate).toLocaleString(DateTime.DATETIME_MED) })}
              </Typography>
            )}
          </Grid>
          <Grid item xs>
            <Grid container direction="row" justifyContent="flex-end" columnSpacing={1}>
              {status !== PartyRankStatus.Finished && (
                <Button size="small" onClick={handleView}>
                  {t('RANK.JOIN')}
                </Button>
              )}
              {status === PartyRankStatus.Finished && (
                <>
                  <Button disabled={!showTable} onClick={handleTableView} size="small">
                    {t('RANK.RESULT_TABLE')}
                  </Button>
                  <Button onClick={handleView} size="small">
                    {t('RANK.GO')}
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
});
