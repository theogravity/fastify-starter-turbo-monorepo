// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type Options } from '@hey-api/client-fetch';
import type { CreateEMailUserData, CreateEMailUserResponse2 } from './types.gen';

export const client = createClient(createConfig());

/**
 * Create an e-mail-based account
 */
export const createEMailUser = <ThrowOnError extends boolean = false>(options?: Options<CreateEMailUserData, ThrowOnError>) => {
    return (options?.client ?? client).post<CreateEMailUserResponse2, unknown, ThrowOnError>({
        url: '/users/email',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};