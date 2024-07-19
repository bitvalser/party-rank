import { map } from 'rxjs/operators';

import useSubscription from '../../../core/hooks/useSubscription';
import { AppUser } from '../../../core/interfaces/app-user.interface';
import { RankItem } from '../../../core/interfaces/rank-item.interface';
import { IRankItemCommentsManager } from '../../../core/services/rank-item-comments/rank-item-comments.types';
import { ItemResultCommentsViewer } from './item-result-comments-viewer';

interface PreviewCommentsViewerProps {
  rankItem: RankItem;
  currentUser: AppUser;
  rankItemCommentsManager: IRankItemCommentsManager;
}

export const PreviewCommentsViewer = ({
  rankItem,
  currentUser,
  rankItemCommentsManager,
}: PreviewCommentsViewerProps) => {
  const { partyItemsComments$ } = rankItemCommentsManager;
  const currentComment = useSubscription(
    partyItemsComments$.pipe(
      map((partyItemsComments) =>
        (partyItemsComments[rankItem.id]?.comments || []).find((comment) => comment.authorId === currentUser.uid),
      ),
    ),
  );

  const comments = [currentComment].filter(Boolean);

  return comments.length > 0 ? <ItemResultCommentsViewer key={comments[0]?.body} comments={comments} /> : null;
};
