import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { finalize } from 'rxjs/operators';
import { useDebounce, useDebouncedCallback } from 'use-debounce';

import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  LinearProgress,
  TextField,
  Typography,
} from '@mui/material';

import { OopsPage } from '../../core/components/oops-page';
import { TagsAutocomplete } from '../../core/components/tags-autocomplete';
import { useInjectable } from '../../core/hooks/useInjectable';
import { useOnScreen } from '../../core/hooks/useOnScreen';
import { RankItem as IRankItem } from '../../core/interfaces/rank-item.interface';
import { IItemsFilters, IPartyRanksFilters } from '../../core/services/party-ranks/party-ranks.types';
import { AppTypes } from '../../core/services/types';
import { RankItem } from '../party-rank/components/rank-item';

const SEARCH_DELAY = 1000;
const ITEMS_PER_PAGE = 100;

export const ItemsListPage = () => {
  const offsetRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const { searchItems } = useInjectable(AppTypes.PartyRanks);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState<IItemsFilters>({});
  const [search, setSearch] = useState('');
  const prevSearchRef = useRef('');
  const [debouncedSearch] = useDebounce(search, SEARCH_DELAY);
  const { t } = useTranslation();
  const [items, setItems] = useState<IRankItem[]>([]);
  const [total, setTotal] = useState(0);
  const infiniteSpinnerRef = useRef<HTMLDivElement>(null);
  const infiniteContinue = useOnScreen(infiniteSpinnerRef);

  const doSearchItems = useCallback(
    (filters: IItemsFilters, searchQuery: string) => {
      const payload = { ...filters };
      if (searchQuery) {
        payload.name = searchQuery;
      }
      searchItems({ limit: ITEMS_PER_PAGE, offset: offsetRef.current, filters: payload })
        .pipe(finalize(() => setLoading(false)))
        .subscribe({
          next: ({ count, items }) => {
            if (typeof count === 'number') {
              setTotal(count);
            }
            offsetRef.current += ITEMS_PER_PAGE;
            setItems((prev) => [...prev, ...items]);
          },
          error: setError,
        });
    },
    [searchItems],
  );

  useEffect(() => {
    if (infiniteContinue && !loading && items.length < total) {
      doSearchItems(filters, prevSearchRef.current);
    }
  }, [doSearchItems, filters, infiniteContinue, items, loading, total]);

  useEffect(() => {
    offsetRef.current = 0;
    setItems([]);
    prevSearchRef.current = debouncedSearch;
    setLoading(true);
    doSearchItems(filters, debouncedSearch);
  }, [debouncedSearch, doSearchItems, filters]);

  const handleClearFilters = () => {
    offsetRef.current = 0;
    setItems([]);
    setFilters({});
    setSearch('');
  };

  if (error) {
    return <OopsPage message={error?.message} code={error.code} />;
  }

  const hasFilters = Object.values(filters).filter(Boolean).length > 0;

  return (
    <>
      <Grid container direction="column">
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
                  value={search}
                  label={t('MAIN.FILTER_NAME')}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </Grid>
              {/* <Grid item xs={3}>
                <TagsAutocomplete
                  label={t('MAIN.FILTER_TAGS')}
                  value={filters.tags}
                  onChange={handleChangeFilter('tags')}
                />
              </Grid> */}
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
        <Card
          sx={{
            mt: 2,
          }}
        >
          <LinearProgress sx={{ opacity: loading && items.length == 0 ? 1 : 0 }} />
          <CardContent>
            <Grid container direction="row" justifyContent="space-between">
              <Grid item>
                <Typography variant="h5" component="div">
                  {t('RANK.CONTENDERS_LIST', { quantity: total })}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        {items.map((item) => (
          <Grid key={item._id} item>
            <RankItem data={item} showRedirect />
          </Grid>
        ))}

        <Grid sx={{ display: items.length < total ? 'initial' : 'none' }} ref={infiniteSpinnerRef} item>
          <Grid sx={{ p: 3 }} container alignItems="center" justifyContent="center">
            <CircularProgress />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
