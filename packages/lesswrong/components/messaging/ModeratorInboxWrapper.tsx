import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useLocation } from '../../lib/routeUtil';
import { useCurrentUser } from '../common/withUser';
import { userCanDo } from '../../lib/vulcan-users';

const ModeratorInboxWrapper = () => {
  const { ErrorAccessDenied } = Components
  const currentUser = useCurrentUser();
  const { query } = useLocation();
  
  if (!currentUser) {
    return <div>Log in to access private messages.</div>
  }
  if (!userCanDo(currentUser, 'conversations.moderate.all')) {
    return <ErrorAccessDenied/>
  }
  const showArchive = query.showArchive === "true"
  const terms: ConversationsViewTerms = {view: 'moderatorConversations', showArchive};
  return <div>
    <Components.InboxNavigation terms={terms} currentUser={currentUser} title="Moderator Conversations"/>
  </div>
}

const ModeratorInboxWrapperComponent = registerComponent('ModeratorInboxWrapper', ModeratorInboxWrapper);

declare global {
  interface ComponentTypes {
    ModeratorInboxWrapper: typeof ModeratorInboxWrapperComponent
  }
}
