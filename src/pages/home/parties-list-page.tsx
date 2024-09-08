import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BehaviorSubject, map, merge, of } from 'rxjs';
import { finalize, withLatestFrom } from 'rxjs/operators';
import { useDebounce, useDebouncedCallback } from 'use-debounce';

import { Box, Button, Card, CardContent, Grid, LinearProgress, Tab, Tabs, TextField, Typography } from '@mui/material';

import { OopsPage } from '../../core/components/oops-page';
import { TagsAutocomplete } from '../../core/components/tags-autocomplete';
import { UsersAutocomplete } from '../../core/components/users-autocomplete';
import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { AppUser, UserRole } from '../../core/interfaces/app-user.interface';
import { PartyRank } from '../../core/interfaces/party-rank.interface';
import { IPartyRanksFilters } from '../../core/services/party-ranks/party-ranks.types';
import { AppTypes } from '../../core/services/types';
import { AddNewParty, AddNewPartyProps } from './components/add-new-party';
import { PartyItem } from './components/party-item';

const SEARCH_DELAY = 1000;

interface IPartyRanksFiltersLocal extends IPartyRanksFilters {
  creator?: AppUser;
}

enum PartyTabs {
  All = 'all',
  MyParties = 'my-parties',
  Active = 'active',
}

export const PartiesListPage = () => {
  const partyKeysRef = useRef(new BehaviorSubject<string[]>([]));
  const [loading, setLoading] = useState(true);
  const { parties$, getParties } = useInjectable(AppTypes.PartyRanks);
  const { user$ } = useInjectable(AppTypes.AuthService);
  const currentUser = useSubscription(user$);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState<IPartyRanksFiltersLocal>({});
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(PartyTabs.All);
  const [debouncedSearch] = useDebounce(search, SEARCH_DELAY);
  const parties = useSubscription<PartyRank[]>(
    merge(partyKeysRef.current, parties$).pipe(
      withLatestFrom(partyKeysRef.current, parties$),
      map(([, keys, parties]) => keys.map((key) => parties[key])),
    ),
    [],
  );

  const searchParties = useCallback(
    (filters: IPartyRanksFiltersLocal, search: string, tab: PartyTabs) => {
      const { creator, ...rest } = filters;
      const payload = { creatorId: creator?._id, ...rest };
      switch (tab) {
        case PartyTabs.Active:
          payload.active = true;
          break;
        case PartyTabs.MyParties:
          payload.myPartyRanks = true;
          break;
      }
      if (search) {
        payload.name = search;
      }
      getParties(payload)
        .pipe(finalize(() => setLoading(false)))
        .subscribe({
          next: (items) => {
            partyKeysRef.current.next(items.map((item) => item._id));
          },
          error: setError,
        });
    },
    [getParties],
  );

  useEffect(() => {
    partyKeysRef.current.next([]);
    setLoading(true);
    searchParties(filters, debouncedSearch, selectedTab);
  }, [debouncedSearch, filters, searchParties, selectedTab]);

  const handleNew: AddNewPartyProps['onAddNew'] = (item) => {
    partyKeysRef.current.next([item._id, ...partyKeysRef.current.getValue()]);
  };

  const handleChangeFilter =
    <T extends keyof IPartyRanksFiltersLocal>(filterName: T) =>
    (value: IPartyRanksFiltersLocal[T]) => {
      setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
    };

  const handleClearFilters = () => {
    setSearch('');
    setFilters({});
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: PartyTabs) => {
    setSelectedTab(newValue);
  };

  if (error) {
    return <OopsPage message={error?.message} code={error.code} />;
  }

  const hasFilters = Object.values(filters).filter(Boolean).length > 0;

  return (
    <>
      <Grid container direction="column" rowSpacing={2}>
        <LinearProgress style={{ opacity: loading ? 1 : 0 }} />
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
            {/* <Grid sx={{ mt: 1 }} container direction="row" alignItems="center" spacing={1}>
              <FormControlLabel
                sx={{
                  ml: 1,
                }}
                control={
                  <Checkbox
                    checked={filters.isParticipant}
                    onChange={(event) => handleChangeFilter('isParticipant')(event.target.checked)}
                  />
                }
                label={t('MAIN.FILTER_I_WAS_PARTICIPANT')}
              />
            </Grid> */}
            <Grid sx={{ mt: 1 }} container direction="row" alignItems="center" spacing={1}>
              <Grid item xs>
                <TextField
                  fullWidth
                  label={t('MAIN.FILTER_NAME')}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </Grid>
              <Grid item xs={3}>
                <UsersAutocomplete
                  label={t('MAIN.FILTER_CREATOR')}
                  multiple={false}
                  value={filters.creator}
                  onChange={(value) => handleChangeFilter('creator')(value)}
                />
              </Grid>
              <Grid item xs={3}>
                <TagsAutocomplete
                  label={t('MAIN.FILTER_TAGS')}
                  value={filters.tags}
                  onChange={handleChangeFilter('tags')}
                />
              </Grid>
            </Grid>
            <Grid
              sx={{
                mt: 2,
              }}
              container
              flexDirection="row"
              justifyContent="flex-end"
            >
              <Grid item>
                <Button onClick={handleClearFilters} variant="text">
                  {t('MAIN.FILTER_CLEAR')}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Box sx={{ mt: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange} aria-label="basic tabs example">
            <Tab label={t('MAIN.TABS.ALL')} value={PartyTabs.All} />
            <Tab label={t('MAIN.TABS.ACTIVE')} value={PartyTabs.Active} />
            <Tab label={t('MAIN.TABS.MY_RANKS')} value={PartyTabs.MyParties} />
          </Tabs>
        </Box>
        {parties.map((item) => (
          <Grid key={item._id} item>
            <PartyItem data={item} />
          </Grid>
        ))}
      </Grid>
      {currentUser?.role === UserRole.Creator && <AddNewParty onAddNew={handleNew} />}
    </>
  );
};
