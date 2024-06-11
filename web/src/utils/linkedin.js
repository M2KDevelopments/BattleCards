/* eslint-disable no-undef */
/**
 * Author: Martin Kululanga
 * Github: https://github.com/m2kdevelopments
*/

import * as OAUTH from './oauth_window';
import * as API from './api';

export async function login(){
    //open window for the user to login
    const url = `${API.URL}/api/linkedin/oauth`;
    const result = await OAUTH.openOAuthWindow(url, "Google");
    return result;
}

