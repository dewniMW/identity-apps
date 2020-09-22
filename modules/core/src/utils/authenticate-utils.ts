/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { TokenConstants } from "../constants";

/**
 * Utility class for authenticate operations.
 */
export class AuthenticateUtils {
    /**
     * Private constructor to avoid object instantiation from outside
     * the class.
     *
     * @hideconstructor
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    /**
     * Checks if the logged in user has login scope.
     *
     * @return {boolean} True or false.
     */
    public static hasLoginPermission(allowedScopes: string): boolean {
        const scopes = allowedScopes?.split(" ");
        return scopes?.includes(TokenConstants.LOGIN_SCOPE);
    }

    /**
     * Checks if the logged in user has a specific scope.
     *
     * @return {boolean} True or false.
     */
    public static hasScope(scope: string, allowedScopes: string): boolean {
        const scopes = allowedScopes?.split(" ");
        return scopes?.includes(scope);
    }

    /**
     * Get the authentication callback URL from the session storage.
     *
     * @return {string} Authentication Callback from session.
     */
    public static getAuthenticationCallbackUrl(): string {
        return window.sessionStorage.getItem("auth_callback_url");
    }

    /**
     * Update the authentication callback URL in the session storage.
     * This is used to improve UX in automatic sign-out scenarios due to session timeouts etc.
     *
     * @param {string} location - history path.
     */
    public static updateAuthenticationCallbackUrl(location: string): void {
        window.sessionStorage.setItem("auth_callback_url", location);
    }

    /**
     * Removes the authentication callback URL from the session storage.
     */
    public static removeAuthenticationCallbackUrl(): void {
        window.sessionStorage.removeItem("auth_callback_url");
    }
}
