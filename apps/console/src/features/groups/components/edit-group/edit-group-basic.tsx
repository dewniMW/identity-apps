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
 * under the License
 */

import {
    AlertInterface,
    AlertLevels,
    TestableComponentInterface
} from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { Field, FormValue, Forms } from "@wso2is/forms"
import { ConfirmationModal, DangerZone, DangerZoneGroup, EmphasizedSegment } from "@wso2is/react-components";
import React, { ChangeEvent, FunctionComponent, ReactElement, useEffect, useState } from "react"
import { Trans, useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Button, Divider, Form, Grid, InputOnChangeData, Label } from "semantic-ui-react"
import { AppConstants, history } from "../../../core";
import { PRIMARY_USERSTORE_PROPERTY_VALUES, validateInputAgainstRegEx } from "../../../userstores";
import { deleteGroupById, updateGroupDetails } from "../../api";
import { GroupsInterface, PatchGroupDataInterface } from "../../models";

/**
 * Interface to contain props needed for component
 */
interface BasicGroupProps extends TestableComponentInterface {
    /**
     * Group details
     */
    groupObject: GroupsInterface;
    /**
     * Show if it is group.
     */
    isGroup: boolean;
    /**
     * Handle group update callback.
     */
    onGroupUpdate: () => void;
    /**
     * Show if the user is read only.
     */
    isReadOnly?: boolean;
    /**
     * Enable group and groups separation.
     */
    isGroupAndRoleSeparationEnabled?: boolean;
}

/**
 * Component to edit basic group details.
 *
 * @param props Group object containing details which needs to be edited.
 */
export const BasicGroupDetails: FunctionComponent<BasicGroupProps> = (props: BasicGroupProps): ReactElement => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        groupObject,
        onGroupUpdate,
        isGroup,
        isReadOnly,
        [ "data-testid" ]: testId
    } = props;

    const [ showGroupDeleteConfirmation, setShowDeleteConfirmationModal ] = useState<boolean>(false);
    const [ labelText, setLableText ] = useState<string>("");
    const [ nameValue, setNameValue ] = useState<string>("");
    const [ userStoreRegEx, setUserStoreRegEx ] = useState<string>("");
    const [ isGroupNamePatternValid, setIsGroupNamePatternValid ] = useState<boolean>(true);
    const [ isRegExLoading, setRegExLoading ] = useState<boolean>(false);

    useEffect(() => {
        if (groupObject && groupObject.displayName.indexOf("/") !== -1) {
            setNameValue(groupObject.displayName.split("/")[1]);
            setLableText(groupObject.displayName.split("/")[0]);
        } else if (groupObject) {
            setNameValue(groupObject.displayName);
        }
    }, [ groupObject ]);

    useEffect(() => {
        if (userStoreRegEx !== "") {
            return;
        }
        fetchUserstoreRegEx()
            .then((response) => {
                setUserStoreRegEx(response);
                setRegExLoading(false);
            });
    }, [ nameValue ]);

    const fetchUserstoreRegEx = async (): Promise<string> => {
        // TODO: Enable when the group object includes user store.
        // if (roleObject && roleObject.displayName.indexOf("/") !== -1) {
        //     // Get the role name regEx for the secondary user store
        //     const userstore = roleObject.displayName.split("/")[0].toString().toLowerCase();
        //     await getUserstoreRegEx(userstore, USERSTORE_REGEX_PROPERTIES.RolenameRegEx)
        //         .then((response) => {
        //             setRegExLoading(true);
        //             regEx = response;
        //         })
        // } else if (roleObject) {
        //     // Get the role name regEx for the primary user store
        //     regEx = PRIMARY_USERSTORE_PROPERTY_VALUES.RolenameJavaScriptRegEx;
        // }
        return PRIMARY_USERSTORE_PROPERTY_VALUES.RolenameJavaScriptRegEx;
    };

    /**
     * The following function handles the group name change.
     *
     * @param event
     * @param data
     */
    const handleGroupNameChange = (event: ChangeEvent, data: InputOnChangeData): void => {
        setIsGroupNamePatternValid(validateInputAgainstRegEx(data?.value, userStoreRegEx));
    };

    /**
     * Dispatches the alert object to the redux store.
     *
     * @param {AlertInterface} alert - Alert object.
     */
    const handleAlerts = (alert: AlertInterface): void => {
        dispatch(addAlert(alert));
    };

    /**
     * Function which will handle group deletion action.
     *
     * @param id - Group ID which needs to be deleted
     */
    const handleOnDelete = (id: string): void => {
        deleteGroupById(id).then(() => {
            handleAlerts({
                description: t("adminPortal:components.groups.notifications.deleteGroup.success.description"),
                level: AlertLevels.SUCCESS,
                message: t("adminPortal:components.groups.notifications.deleteGroup.success.message")
            });
            if (isGroup) {
                history.push(AppConstants.getPaths().get("GROUPS"));
            } else {
                history.push(AppConstants.getPaths().get("ROLES"));
            }
        });
    };

    /**
     * Method to update group name for the selected group.
     *
     */
    const updateGroupName = (values: Map<string, FormValue>): void => {
        const newGroupName = values?.get("groupName")?.toString();

        const groupData: PatchGroupDataInterface = {
            Operations: [{
                "op": "replace",
                "path": "displayName",
                "value": labelText ? labelText + "/" + newGroupName : newGroupName
            }],
            schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"]
        };

        updateGroupDetails(groupObject.id, groupData)
            .then(() => {
                onGroupUpdate();
                handleAlerts({
                    description: t("adminPortal:components.groups.notifications.updateGroup.success.description"),
                    level: AlertLevels.SUCCESS,
                    message: t("adminPortal:components.groups.notifications.updateGroup.success.message")
                });
            }).catch(() => {
            handleAlerts({
                description: t("adminPortal:components.groups.notifications.updateGroup.error.description"),
                level: AlertLevels.ERROR,
                message: t("adminPortal:components.groups.notifications.updateGroup.error.message")
            });
        });
    };

    return (
        <>
            <EmphasizedSegment>
                <Forms
                    onSubmit={ (values) => {
                        updateGroupName(values)
                    } }
                >
                    <Grid>
                        <Grid.Row columns={ 1 }>
                            <Grid.Column mobile={ 12 } tablet={ 12 } computer={ 6 }>
                                <Form.Field
                                    error={ !isGroupNamePatternValid }
                                >
                                    <label
                                        data-testid={
                                            isGroup
                                                ? `${ testId }-group-name-label`
                                                : `${ testId }-group-name-label`
                                        }
                                    >
                                        {
                                            isGroup
                                                ? t("adminPortal:components.groups.edit.basics.fields.groupName.name")
                                                : t("adminPortal:components.roles.edit.basics.fields.groupName.name")
                                        }
                                    </label>
                                    <Field
                                        required={ true }
                                        name={ "groupName" }
                                        label={ labelText !== "" ? labelText + " /" : null }
                                        requiredErrorMessage={
                                            isGroup
                                                ? t("adminPortal:components.groups.edit.basics.fields.groupName" +
                                                ".required")
                                                : t("adminPortal:components.roles.edit.basics.fields.groupName" +
                                                ".required")
                                        }
                                        placeholder={
                                            isGroup
                                                ? t("adminPortal:components.groups.edit.basics.fields.groupName." +
                                                "placeholder")
                                                : t("adminPortal:components.roles.edit.basics.fields.groupName." +
                                                "placeholder")
                                        }
                                        value={ nameValue }
                                        onChange={ handleGroupNameChange }
                                        type="text"
                                        data-testid={
                                            isGroup
                                                ? `${ testId }-group-name-input`
                                                : `${ testId }-role-name-input`
                                        }
                                        loading={ isRegExLoading }
                                        readOnly={ isReadOnly }
                                    />
                                    {
                                        !isGroupNamePatternValid && (
                                            isGroup
                                                ?
                                                <Label basic color="red" pointing>
                                                    { t("adminPortal:components.roles.addRoleWizard.forms." +
                                                        "roleBasicDetails.groupName.validations.invalid",
                                                        { type: "group" }) }
                                                </Label>
                                                :
                                                <Label basic color="red" pointing>
                                                    { t("adminPortal:components.roles.addRoleWizard.forms." +
                                                        "roleBasicDetails.groupName.validations.invalid",
                                                        { type: "group" }) }
                                                </Label>
                                        )
                                    }
                                </Form.Field>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row columns={ 1 }>
                            <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                                {
                                    !isReadOnly && (
                                        <Button
                                            primary
                                            type="submit"
                                            size="small"
                                            className="form-button"
                                            data-testid={
                                                isGroup
                                                    ? `${ testId }-group-update-button`
                                                    : `${ testId }-role-update-button`
                                            }
                                            disabled={ !isGroupNamePatternValid && !isRegExLoading }
                                        >
                                            { t("adminPortal:components.roles.edit.basics.buttons.update") }
                                        </Button>
                                    )
                                }
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Forms>
            </EmphasizedSegment>
            <Divider hidden />
            {
                !isReadOnly && (
                    <DangerZoneGroup sectionHeader="Danger Zone">
                        <DangerZone
                            actionTitle={
                                isGroup
                                    ? t("adminPortal:components.roles.edit.basics.dangerZone.actionTitle",
                                    { type: "Group" })
                                    : t("adminPortal:components.roles.edit.basics.dangerZone.actionTitle",
                                    { type: "Role" })
                            }
                            header={
                                isGroup
                                    ? t("adminPortal:components.roles.edit.basics.dangerZone.header",
                                    { type: "group" })
                                    : t("adminPortal:components.roles.edit.basics.dangerZone.header",
                                    { type: "role" })
                            }
                            subheader={
                                isGroup
                                    ? t("adminPortal:components.roles.edit.basics.dangerZone.subheader",
                                    { type: "group" })
                                    : t("adminPortal:components.roles.edit.basics.dangerZone.subheader",
                                    { type: "role" })
                            }
                            onActionClick={ () => setShowDeleteConfirmationModal(!showGroupDeleteConfirmation) }
                            data-testid={
                                isGroup
                                    ? `${ testId }-group-danger-zone`
                                    : `${ testId }-role-danger-zone`
                            }
                        />
                    </DangerZoneGroup>
                )
            }
            {
                showGroupDeleteConfirmation &&
                <ConfirmationModal
                    onClose={ (): void => setShowDeleteConfirmationModal(false) }
                    type="warning"
                    open={ showGroupDeleteConfirmation }
                    assertion={ groupObject.displayName }
                    assertionHint={
                        (
                            <p>
                                <Trans
                                    i18nKey={
                                        "adminPortal:components.roles.edit.basics.confirmation.assertionHint"
                                    }
                                    tOptions={ { roleName: groupObject.displayName } }
                                >
                                    Please type <strong>{ groupObject.displayName }</strong> to confirm.
                                </Trans>
                            </p>
                        )
                    }
                    assertionType="input"
                    primaryAction="Confirm"
                    secondaryAction="Cancel"
                    onSecondaryActionClick={ (): void => setShowDeleteConfirmationModal(false) }
                    onPrimaryActionClick={ (): void => handleOnDelete(groupObject.id) }
                    data-testid={
                        isGroup
                            ? `${ testId }-group-confirmation-modal`
                            : `${ testId }-role-confirmation-modal`
                    }
                >
                    <ConfirmationModal.Header>
                        { t("adminPortal:components.roles.edit.basics.confirmation.header") }
                    </ConfirmationModal.Header>
                    <ConfirmationModal.Message attached warning>
                        { t("adminPortal:components.roles.edit.basics.confirmation.message",
                            { type: isGroup ? "group." : "role." }) }
                    </ConfirmationModal.Message>
                    <ConfirmationModal.Content>
                        { t("adminPortal:components.groups.edit.basics.confirmation.content",
                            { type: isGroup ? "group." : "role." }) }
                    </ConfirmationModal.Content>
                </ConfirmationModal>
            }
        </>
    )
};
