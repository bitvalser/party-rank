import { useRef, useState } from 'react';
import { BehaviorSubject, concat, map, merge, of } from 'rxjs';
import { catchError, finalize, tap, withLatestFrom } from 'rxjs/operators';

import { Grid, LinearProgress } from '@mui/material';

import { OopsPage } from '../../core/components/oops-page';
import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { AppTypes } from '../../core/services/types';
import { AddNewParty, AddNewPartyProps } from './components/add-new-party';
import { PartyItem } from './components/party-item';

export const PartiesListPage = () => {
  const partyKeysRef = useRef(new BehaviorSubject<string[]>([]));
  const [loading, setLoading] = useState(true);
  const { parties$, getParties } = useInjectable(AppTypes.PartyRanks);
  const [error, setError] = useState(null);
  const parties = useSubscription(
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

  const handleNew: AddNewPartyProps['onAddNew'] = (item) => {
    partyKeysRef.current.next([item.id, ...partyKeysRef.current.getValue()]);
  };

  if (error) {
    return <OopsPage message={error?.message} code={error.code} />;
  }

  return (
    <>
      <Grid container direction="column" rowSpacing={2}>
        {loading && <LinearProgress />}
        {parties.map((item) => (
          <Grid key={item.id} item>
            <PartyItem data={item} />
          </Grid>
        ))}
      </Grid>
      <AddNewParty onAddNew={handleNew} />
    </>
  );
};
