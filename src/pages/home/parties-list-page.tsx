import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BehaviorSubject, concat, map, merge, of } from 'rxjs';
import { catchError, finalize, tap, withLatestFrom } from 'rxjs/operators';

import { Button, Card, CardContent, Grid, LinearProgress, TextField, Typography } from '@mui/material';

import { OopsPage } from '../../core/components/oops-page';
import { UsersAutocomplete } from '../../core/components/users-autocomplete';
import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { PartyRank } from '../../core/interfaces/party-rank.interface';
import { AppTypes } from '../../core/services/types';
import { AddNewParty, AddNewPartyProps } from './components/add-new-party';
import { PartyItem } from './components/party-item';

export const PartiesListPage = () => {
  const partyKeysRef = useRef(new BehaviorSubject<string[]>([]));
  const [loading, setLoading] = useState(true);
  const { parties$, getParties } = useInjectable(AppTypes.PartyRanks);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState<{ name?: string; author?: string }>({});
  const { t } = useTranslation();
  const parties = useSubscription<PartyRank[]>(
    concat(
      getParties().pipe(
        finalize(() => setLoading(false)),
        tap((items) => partyKeysRef.current.next(items.map((item) => item.id))),
        catchError((error, caught) => {
          setError(error);
          return of([]);
        }),
      ),
      merge(partyKeysRef.current, parties$).pipe(
        withLatestFrom(partyKeysRef.current, parties$),
        map(([, keys, parties]) => keys.map((key) => parties[key])),
      ),
    ).pipe(
      map((items) =>
        items.sort((partyA, partyB) => new Date(partyB.createdDate).getTime() - new Date(partyA.createdDate).getTime()),
      ),
    ),
    [],
  );

  const filteredParties = useMemo(
    () =>
      parties.filter((party) =>
        Object.entries(filters)
          .filter(([, value]) => value)
          .reduce((acc, [filter, value]) => {
            switch (filter) {
              case 'name':
                return acc && party.name.toLocaleLowerCase().includes(value.toLocaleLowerCase());
              case 'author':
                return acc && party.creatorId === value;
              default:
                return acc;
            }
          }, true),
      ),
    [filters, parties],
  );

  const handleNew: AddNewPartyProps['onAddNew'] = (item) => {
    partyKeysRef.current.next([item.id, ...partyKeysRef.current.getValue()]);
  };

  const handleChangeFilter = (filterName: string) => (value: string) => {
    setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (error) {
    return <OopsPage message={error?.message} code={error.code} />;
  }

  const hasFilters = Object.values(filters).filter(Boolean).length > 0;

  return (
    <>
      <Grid container direction="column" rowSpacing={2}>
        {loading && <LinearProgress />}
        <Card
          sx={{
            mt: 2,
            position: hasFilters ? 'sticky' : 'initial',
            top: '12px',
            zIndex: 99,
          }}
        >
          <CardContent>
            <Typography sx={{ mr: 2 }} variant="h6" component="div">
              {t('MAIN.FILTERS')}
            </Typography>
            <Grid sx={{ mt: 1 }} container direction="row" alignItems="center" spacing={1}>
              <Grid item xs>
                <TextField
                  fullWidth
                  label={t('MAIN.FILTER_NAME')}
                  onChange={(event) => handleChangeFilter('name')(event.target.value)}
                />
              </Grid>
              <Grid item xs={3}>
                <UsersAutocomplete
                  label={t('MAIN.FILTER_CREATOR')}
                  multiple={false}
                  onChange={handleChangeFilter('author')}
                />
              </Grid>
              <Grid item xs>
                <Button onClick={handleClearFilters} variant="text">
                  {t('MAIN.FILTER_CLEAR')}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        {filteredParties.map((item) => (
          <Grid key={item.id} item>
            <PartyItem data={item} />
          </Grid>
        ))}
      </Grid>
      <AddNewParty onAddNew={handleNew} />
    </>
  );
};
