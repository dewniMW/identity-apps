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
 */

import { resolveUserDisplayName, resolveUserEmails } from "@wso2is/core/helpers";
import {
    AlertInterface,
    AlertLevels,
    ProfileInfoInterface,
    ProfileSchemaInterface,
    emptyProfileInfo
} from "@wso2is/core/models";
import { addAlert, getProfileInformation } from "@wso2is/core/store";
import { EditAvatarModal, PageLayout, UserAvatar } from "@wso2is/react-components";
import React, { MouseEvent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { AppConstants, AppState, FeatureConfigInterface, SharedUserStoreUtils, history } from "../../core";
import { getUserDetails, updateUserInfo } from "../api";
import { EditUser } from "../components";
import { UserManagementUtils } from "../utils";

/**
 * User Edit page.
 *
 * @return {React.ReactElement}
 */
const UserEditPage = (): ReactElement => {

    const { t } = useTranslation();
    
    const dispatch = useDispatch();

    const featureConfig: FeatureConfigInterface = useSelector((state: AppState) => state.config.ui.features);
    const profileInfo: ProfileInfoInterface = useSelector((state: AppState) => state.profile.profileInfo);
    const profileSchemas: ProfileSchemaInterface[] = useSelector((state: AppState) => state.profile.profileSchemas);

    const [ user, setUserProfile ] = useState<ProfileInfoInterface>(emptyProfileInfo);
    const [ isUserDetailsRequestLoading, setIsUserDetailsRequestLoading ] = useState<boolean>(false);
    const [ readOnlyUserStoresList, setReadOnlyUserStoresList ] = useState<string[]>(undefined);
    const [ showEditAvatarModal, setShowEditAvatarModal ] = useState<boolean>(false);

    useEffect(() => {
        const path = history.location.pathname.split("/");
        const id = path[ path.length - 1 ];

        getUser(id);
    }, []);

    useEffect(() => {
        SharedUserStoreUtils.getReadOnlyUserStores().then((response) => {
            setReadOnlyUserStoresList(response);
        });
    }, [ user ]);

    const getUser = (id: string) => {
        setIsUserDetailsRequestLoading(true);

        getUserDetails(id)
            .then((response) => {
                setUserProfile(response);
            })
            .catch(() => {
                // TODO add to notifications
            })
            .finally(() => {
                setIsUserDetailsRequestLoading(false);
            });
    };

    const handleUserUpdate = (id: string) => {
        getUser(id);
        
        if (UserManagementUtils.isAuthenticatedUser(profileInfo, user)) {
            dispatch(getProfileInformation(true, profileSchemas));
        }
    };

    const handleBackButtonClick = () => {
        history.push(AppConstants.PATHS.get("USERS"));
    };

    /**
     * Handles edit avatar modal submit action.
     *
     * @param {<HTMLButtonElement>} e - Event.
     * @param {string} url - Selected image URL.
     */
    const handleAvatarEditModalSubmit = (e: MouseEvent<HTMLButtonElement>, url: string): void => {
        const data = {
            Operations: [
                {
                    op: "replace",
                    value: {
                        profileUrl: url
                    }
                }
            ],
            schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"]
        };

        updateUserInfo(user?.id, data)
            .then(() => {
                dispatch(addAlert<AlertInterface>({
                    description: t(
                        "adminPortal:components.user.profile.notifications.updateProfileInfo.success.description"
                    ),
                    level: AlertLevels.SUCCESS,
                    message: t(
                        "adminPortal:components.user.profile.notifications.updateProfileInfo.success.message"
                    )
                }));

                handleUserUpdate(user?.id);
            })
            .catch((error) => {
                if (error.response
                    && error.response.data
                    && (error.response.data.description || error.response.data.detail)) {

                    dispatch(addAlert<AlertInterface>({
                        description: error.response.data.description || error.response.data.detail,
                        level: AlertLevels.SUCCESS,
                        message: t(
                            "adminPortal:components.user.profile.notifications.updateProfileInfo.error.message"
                        )
                    }));
                    
                    return;
                }

                dispatch(addAlert<AlertInterface>({
                    description: t(
                        "adminPortal:components.user.profile.notifications.updateProfileInfo.genericError.description"
                    ),
                    level: AlertLevels.SUCCESS,
                    message: t(
                        "adminPortal:components.user.profile.notifications.updateProfileInfo.genericError.message"
                    )
                }));
            })
            .finally(() => {
                setShowEditAvatarModal(false);
            });
    };

    return (
        <PageLayout
            isLoading={ isUserDetailsRequestLoading }
            title={ resolveUserDisplayName(user, null, "Administrator") }
            description={ t("" + user.emails && user.emails !== undefined ? user.emails[0].toString() :
                user.userName) }
            image={ (
                <UserAvatar
                    editable
                    name={ resolveUserDisplayName(user) }
                    size="tiny"
                    image={ user?.profileUrl }
                    onClick={ () => setShowEditAvatarModal(true) }
                />
            ) }
            backButton={ {
                "data-testid": "user-mgt-edit-user-back-button",
                onClick: handleBackButtonClick,
                text: t("adminPortal:pages.usersEdit.backButton")
            } }
            titleTextAlign="left"
            bottomMargin={ false }
        >
            <EditUser
                featureConfig={ featureConfig }
                user={ user }
                handleUserUpdate={ handleUserUpdate }
                readOnlyUserStores={ readOnlyUserStoresList }
            />
            {
                showEditAvatarModal && (
                    <EditAvatarModal
                        open={ showEditAvatarModal }
                        name={ resolveUserDisplayName(user) }
                        emails={ resolveUserEmails(user?.emails) }
                        onClose={ () => setShowEditAvatarModal(false) }
                        onCancel={ () => setShowEditAvatarModal(false) }
                        onSubmit={ handleAvatarEditModalSubmit }
                        heading={ t("console:common.modals.editAvatarModal.heading") }
                        submitButtonText={ t("console:common.modals.editAvatarModal.primaryButton") }
                        cancelButtonText={ t("console:common.modals.editAvatarModal.secondaryButton") }
                        translations={ {
                            gravatar: {
                                errors: {
                                    noAssociation: {
                                        content: t("console:common.modals.editAvatarModal.content.gravatar.errors" +
                                            ".noAssociation.content"),
                                        header: t("console:common.modals.editAvatarModal.content.gravatar.errors" +
                                            ".noAssociation.header")
                                    }
                                },
                                heading: t("console:common.modals.editAvatarModal.content.gravatar.heading")
                            },
                            hostedAvatar: {
                                heading: t("console:common.modals.editAvatarModal.content.hostedAvatar.heading"),
                                input: {
                                    errors: {
                                        http: {
                                            content: t("console:common.modals.editAvatarModal.content." +
                                                "hostedAvatar.input.errors.http.content"),
                                            header: t("console:common.modals.editAvatarModal.content." +
                                                "hostedAvatar.input.errors.http.header")
                                        },
                                        invalid: {
                                            content: t("console:common.modals.editAvatarModal.content." +
                                                "hostedAvatar.input.errors.invalid.content"),
                                            pointing: t("console:common.modals.editAvatarModal.content." +
                                                "hostedAvatar.input.errors.invalid.pointing")
                                        }
                                    },
                                    hint: t("console:common.modals.editAvatarModal.content.hostedAvatar.input.hint"),
                                    placeholder: t("console:common.modals.editAvatarModal.content." +
                                        "hostedAvatar.input.placeholder"),
                                    warnings: {
                                        dataURL: {
                                            content: t("console:common.modals.editAvatarModal.content." +
                                                "hostedAvatar.input.warnings.dataURL.content"),
                                            header: t("console:common.modals.editAvatarModal.content." +
                                                "hostedAvatar.input.warnings.dataURL.header")
                                        }
                                    }
                                }
                            },
                            systemGenAvatars: {
                                heading: t("console:common.modals.editAvatarModal.content.systemGenAvatars.heading"),
                                types: {
                                    initials: t("console:common.modals.editAvatarModal.content.systemGenAvatars." +
                                        "types.initials")
                                }
                            }
                        } }
                    />
                )
            }
        </PageLayout>
    );
};

/**
 * A default export was added to support React.lazy.
 * TODO: Change this to a named export once react starts supporting named exports for code splitting.
 * @see {@link https://reactjs.org/docs/code-splitting.html#reactlazy}
 */
export default UserEditPage;
