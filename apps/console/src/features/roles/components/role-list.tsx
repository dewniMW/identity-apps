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

import {
    LoadableComponentInterface,
    RoleListInterface,
    RolesInterface,
    TestableComponentInterface
} from "@wso2is/core/models";
import { CommonUtils } from "@wso2is/core/utils";
import {
    AnimatedAvatar,
    ConfirmationModal,
    DataTable,
    EmptyPlaceholder,
    LinkButton,
    PrimaryButton,
    TableActionsInterface,
    TableColumnInterface
} from "@wso2is/react-components";
import React, { ReactElement, ReactNode, SyntheticEvent, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Header, Icon, Label, SemanticICONS } from "semantic-ui-react";
import { AppConstants, EmptyPlaceholderIllustrations, UIConstants, history } from "../../core";
import { APPLICATION_DOMAIN } from "../constants";

interface RoleListProps extends LoadableComponentInterface, TestableComponentInterface {
    /**
     * Advanced Search component.
     */
    advancedSearch?: ReactNode;
    /**
     * Default list item limit.
     */
    defaultListItemLimit?: number;
    /**
     * Flag for Group list.
     */
    isGroup: boolean;
    /**
     * Roles list.
     */
    roleList: RoleListInterface;
    /**
     * Role delete callback.
     * @param {RolesInterface} role - Deleting role.
     */
    handleRoleDelete?: (role: RolesInterface) => void;
    /**
     * On list item select callback.
     */
    onListItemClick?: (event: SyntheticEvent, role: RolesInterface) => void;
    /**
     * Callback for the search query clear action.
     */
    onSearchQueryClear?: () => void;
    /**
     * Callback to be fired when clicked on the empty list placeholder action.
     */
    onEmptyListPlaceholderActionClick?: () => void;
    /**
     * Search query for the list.
     */
    searchQuery?: string;
    /**
     * Enable selection styles.
     */
    selection?: boolean;
    /**
     * Show list item actions.
     */
    showListItemActions?: boolean;
    /**
     * Show/Hide meta content.
     */
    showMetaContent?: boolean;
}

/**
 * List component for Role Management list
 *
 * @param props contains the role list as a prop to populate
 */
export const RoleList: React.FunctionComponent<RoleListProps> = (props: RoleListProps): ReactElement => {

    const {
        advancedSearch,
        defaultListItemLimit,
        handleRoleDelete,
        isLoading,
        onEmptyListPlaceholderActionClick,
        onListItemClick,
        onSearchQueryClear,
        roleList,
        selection,
        searchQuery,
        showListItemActions,
        showMetaContent,
        [ "data-testid" ]: testId
    } = props;

    const { t } = useTranslation();

    const [ showRoleDeleteConfirmation, setShowDeleteConfirmationModal ] = useState<boolean>(false);
    const [ currentDeletedRole, setCurrentDeletedRole ] = useState<RolesInterface>();

    const handleRoleEdit = (roleId: string) => {
        history.push(AppConstants.PATHS.get("ROLE_EDIT").replace(":id", roleId));
    };

    /**
     * Util method to generate listing header content.
     *
     * @param displayName - display name of the role/group
     *
     * @returns - React element if containing a prefix or the string
     */
    const generateHeaderContent = (displayName: string): ReactElement | string => {
        if (displayName.includes(APPLICATION_DOMAIN)) {
            return  <>
                <Label
                    data-testid={ `${ testId }-role-${ displayName.split("/")[1] }-label` }
                    content={ "Application" }
                    size="mini"
                    className={ "application-label" }
                />
                { "/ " + displayName.split("/")[1] }
            </>
        } else {
            return <>
                <Label
                    data-testid={ `${ testId }-role-${ displayName }-label` }
                    content={ "Internal" }
                    size="mini"
                    className={ "internal-label" }
                />
                { "/ " + displayName }
            </>
        }
    };

    /**
     * Shows list placeholders.
     *
     * @return {React.ReactElement}
     */
    const showPlaceholders = (): ReactElement => {
        // When the search returns empty.
        if (searchQuery) {
            return (
                <EmptyPlaceholder
                    data-testid={ `${ testId }-search-empty-placeholder` }
                    action={ (
                        <LinkButton
                            data-testid={ `${ testId }-search-empty-placeholder-clear-button` }
                            onClick={ onSearchQueryClear }
                        >
                            { t("adminPortal:components.roles.list.emptyPlaceholders.search.action") }
                        </LinkButton>
                    ) }
                    image={ EmptyPlaceholderIllustrations.emptySearch }
                    imageSize="tiny"
                    title={ t("adminPortal:components.roles.list.emptyPlaceholders.search.title") }
                    subtitle={ [
                        t("adminPortal:components.roles.list.emptyPlaceholders.search.subtitles.0",
                            { searchQuery: searchQuery }),
                        t("adminPortal:components.roles.list.emptyPlaceholders.search.subtitles.1")
                    ] }
                />
            );
        }

        if (roleList?.totalResults === 0) {
            return (
                <EmptyPlaceholder
                    data-testid={ `${ testId }-empty-list-empty-placeholder` }
                    action={ (
                        <PrimaryButton
                            data-testid={ `${ testId }-empty-list-empty-placeholder-add-button` }
                            onClick={ onEmptyListPlaceholderActionClick }
                        >
                            <Icon name="add"/>
                            { t("adminPortal:components.roles.list.emptyPlaceholders.emptyRoleList.action",
                                { type: "Role" })}
                        </PrimaryButton>
                    ) }
                    image={ EmptyPlaceholderIllustrations.newList }
                    imageSize="tiny"
                    title={ t("adminPortal:components.roles.list.emptyPlaceholders.emptyRoleList.title",
                        { type: "role" }) }
                    subtitle={ [
                        t("adminPortal:components.roles.list.emptyPlaceholders.emptyRoleList.subtitles.0",
                            { type: "roles" }),
                        t("adminPortal:components.roles.list.emptyPlaceholders.emptyRoleList.subtitles.1",
                            { type: "role" }),
                        t("adminPortal:components.roles.list.emptyPlaceholders.emptyRoleList.subtitles.2",
                            { type: "role" })
                    ] }
                />
            );
        }

        return null;
    };

    /**
     * Resolves data table columns.
     *
     * @return {TableColumnInterface[]}
     */
    const resolveTableColumns = (): TableColumnInterface[] => {
        return [
            {
                allowToggleVisibility: false,
                dataIndex: "name",
                id: "name",
                key: "name",
                render: (role: RolesInterface): ReactNode => (
                    <Header as="h6" image>
                        <AnimatedAvatar
                            name={ role?.displayName[ 0 ] }
                            size="mini"
                            data-testid={ `${ testId }-item-image` }
                        />
                        <Header.Content>
                            { generateHeaderContent(role?.displayName) }
                        </Header.Content>
                    </Header>
                ),
                title: t("adminPortal:components.roles.list.columns.name")
            },
            {
                allowToggleVisibility: false,
                dataIndex: "lastModified",
                hidden: !showMetaContent,
                id: "lastModified",
                key: "lastModified",
                render: (role: RolesInterface) => CommonUtils.humanizeDateDifference(role?.meta?.created),
                title: t("adminPortal:components.roles.list.columns.lastModified")
            },
            {
                allowToggleVisibility: false,
                dataIndex: "action",
                id: "actions",
                key: "actions",
                textAlign: "right",
                title: t("adminPortal:components.roles.list.columns.actions")
            }
        ];
    };

    /**
     * Resolves data table actions.
     *
     * @return {TableActionsInterface[]}
     */
    const resolveTableActions = (): TableActionsInterface[] => {
        if (!showListItemActions) {
            return;
        }

        return [
            {
                icon: (): SemanticICONS => "pencil alternate",
                onClick: (e: SyntheticEvent, role: RolesInterface): void =>
                    handleRoleEdit(role?.id),
                popupText: (): string => t("adminPortal:components.roles.list.popups.edit",
                    { type: "Role" }),
                renderer: "semantic-icon"
            },
            {
                icon: (): SemanticICONS => "trash alternate",
                onClick: (e: SyntheticEvent, role: RolesInterface): void => {
                    setCurrentDeletedRole(role);
                    setShowDeleteConfirmationModal(!showRoleDeleteConfirmation);
                },
                popupText: (): string => t("adminPortal:components.roles.list.popups.delete",
                    { type: "Role" }),
                renderer: "semantic-icon"
            }
        ];
    };

    return (
        <>
            <DataTable<RolesInterface>
                className="roles-list"
                externalSearch={ advancedSearch }
                isLoading={ isLoading }
                loadingStateOptions={ {
                    count: defaultListItemLimit ?? UIConstants.DEFAULT_RESOURCE_LIST_ITEM_LIMIT,
                    imageType: "square"
                } }
                actions={ resolveTableActions() }
                columns={ resolveTableColumns() }
                data={ roleList?.Resources }
                onRowClick={
                    (e: SyntheticEvent, role: RolesInterface): void => {
                        handleRoleEdit(role?.id);
                        onListItemClick(e, role);
                    }
                }
                placeholders={ showPlaceholders() }
                selectable={ selection }
                showHeader={ false }
                transparent={ !isLoading && (showPlaceholders() !== null) }
                data-testid={ testId }
            />
            {
                showRoleDeleteConfirmation &&
                <ConfirmationModal
                    data-testid={ `${ testId }-delete-item-confirmation-modal` }
                    onClose={ (): void => setShowDeleteConfirmationModal(false) }
                    type="warning"
                    open={ showRoleDeleteConfirmation }
                    assertion={ currentDeletedRole.displayName }
                    assertionHint={
                        (
                            <p>
                                <Trans
                                    i18nKey={ "adminPortal:components.roles.list.confirmations.deleteItem." +
                                    "assertionHint" }
                                    tOptions={ { roleName: currentDeletedRole.displayName } }
                                >
                                    Please type <strong>{ currentDeletedRole.displayName }</strong> to confirm.
                                </Trans>
                            </p>
                        )
                    }
                    assertionType="input"
                    primaryAction="Confirm"
                    secondaryAction="Cancel"
                    onSecondaryActionClick={ (): void => setShowDeleteConfirmationModal(false) }
                    onPrimaryActionClick={ (): void => {
                        handleRoleDelete(currentDeletedRole);
                        setShowDeleteConfirmationModal(false);
                    } }
                >
                    <ConfirmationModal.Header>
                        { t("adminPortal:components.roles.list.confirmations.deleteItem.header") }
                    </ConfirmationModal.Header>
                    <ConfirmationModal.Message attached warning>
                        { t("adminPortal:components.roles.list.confirmations.deleteItem.message",
                            { type: "role" }) }
                    </ConfirmationModal.Message>
                    <ConfirmationModal.Content>
                        { t("adminPortal:components.roles.list.confirmations.deleteItem.content",
                            { type: "role" }) }
                    </ConfirmationModal.Content>
                </ConfirmationModal>
            }
        </>
    );
};

/**
 * Default props for the component.
 */
RoleList.defaultProps = {
    selection: true,
    showListItemActions: true,
    showMetaContent: true
};
