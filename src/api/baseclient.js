import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

import { mockEntities } from './mock-backend';

//Create a client with authentication required
export const base44 = createClient({
    appId: appId && appId !== 'null' ? appId : 'local_dev',
    token,
    functionsVersion,
    serverUrl: '',
    requiresAuth: false,
    appBaseUrl
});

// Use local storage mock for entities to make app work without a backend
base44.entities = mockEntities;
