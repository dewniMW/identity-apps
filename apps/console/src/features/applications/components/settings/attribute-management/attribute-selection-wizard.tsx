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

import { TestableComponentInterface } from "@wso2is/core/models";
import {
    Heading,
    LinkButton,
    PrimaryButton,
    TransferComponent,
    TransferList,
    TransferListItem
} from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "semantic-ui-react";
import { ExtendedClaimInterface } from "./attribute-settings";

interface AttributeSelectionWizardPropsInterface extends TestableComponentInterface {
    availableClaims: ExtendedClaimInterface[];
    setAvailableClaims: any;
    selectedClaims: ExtendedClaimInterface[];
    setSelectedClaims: any;
    setInitialSelectedClaims: any;
    showAddModal: boolean;
    setShowAddModal: (showModal: boolean) => void;
    createMapping: any;
    removeMapping: any;
}

/**
 * Attribute selection wizard component.
 *
 * @param {AttributeSelectionWizardPropsInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const AttributeSelectionWizard: FunctionComponent<AttributeSelectionWizardPropsInterface> = (
    props: AttributeSelectionWizardPropsInterface
): ReactElement => {

    const {
        selectedClaims,
        showAddModal,
        setShowAddModal,
        availableClaims,
        setAvailableClaims,
        setInitialSelectedClaims,
        createMapping,
        removeMapping,
        [ "data-testid" ]: testId
    } = props;

    const { t } = useTranslation();

    const [tempAvailableClaims, setTempAvailableClaims] = useState<ExtendedClaimInterface[]>([]);
    const [tempSelectedClaims, setTempSelectedClaims] = useState<ExtendedClaimInterface[]>([]);
    const [filterTempAvailableClaims, setFilterTempAvailableClaims] = useState<ExtendedClaimInterface[]>([]);
    const [filterTempSelectedClaims, setFilterTempSelectedClaims] = useState<ExtendedClaimInterface[]>([]);
    const [checkedUnassignedListItems, setCheckedUnassignedListItems] = useState<ExtendedClaimInterface[]>([]);
    const [checkedAssignedListItems, setCheckedAssignedListItems] = useState<ExtendedClaimInterface[]>([]);
    const [isSelectUnassignedClaimsAllClaimsChecked, setSelectUnassignedClaimsAllClaimsChecked] = useState(false);
    const [isSelectAssignedAllClaimsChecked, setIsSelectAssignedAllClaimsChecked] = useState(false);

    const handleAttributeModal = () => {
        setShowAddModal(false);
    };

    // search operation for available claims.
    const searchTempAvailable = (event) => {
        const changeValue = event.target.value;
        if (changeValue.length > 0) {
            setFilterTempAvailableClaims(tempAvailableClaims.filter((item) =>
                item.claimURI.toLowerCase().indexOf(changeValue.toLowerCase()) !== -1))
        } else {
            setFilterTempAvailableClaims(tempAvailableClaims);
        }
    };

    // search operation for selected claims.
    const searchTempSelected = (event) => {
        const changeValue = event.target.value;
        if (changeValue.length > 0) {
            setFilterTempSelectedClaims(tempSelectedClaims.filter((item) =>
                item.claimURI.toLowerCase().indexOf(changeValue.toLowerCase()) !== -1))
        } else {
            setFilterTempSelectedClaims(tempSelectedClaims);
        }
    };

    const addAttributes = () => {
        const addedClaims = [...tempSelectedClaims];
        if (checkedUnassignedListItems?.length > 0) {
            checkedUnassignedListItems.map((claim) => {
                if (!(addedClaims?.includes(claim))) {
                    addedClaims.push(claim);
                }
            });
        }
        setTempSelectedClaims(addedClaims);
        setFilterTempSelectedClaims(addedClaims);
        setTempAvailableClaims(tempAvailableClaims.filter(x => !addedClaims?.includes(x)));
        setFilterTempAvailableClaims(filterTempAvailableClaims.filter(x => !addedClaims?.includes(x)));
        setSelectUnassignedClaimsAllClaimsChecked(false);
    };

    const removeAttributes = () => {
        const removedRoles = [...tempAvailableClaims];
        if (checkedAssignedListItems?.length > 0) {
            checkedAssignedListItems.map((claim) => {
                if (!(removedRoles?.includes(claim))) {
                    removedRoles.push(claim);
                }
            });
        }
        setTempAvailableClaims(removedRoles);
        setFilterTempAvailableClaims(removedRoles);
        setTempSelectedClaims(tempSelectedClaims?.filter(x => !removedRoles?.includes(x)));
        setFilterTempSelectedClaims(filterTempSelectedClaims?.filter(x => !removedRoles?.includes(x)));
        setCheckedAssignedListItems(checkedAssignedListItems.filter(x => !removedRoles?.includes(x)));
        setIsSelectAssignedAllClaimsChecked(false);
    };


    /**
     * The following method handles the onChange event of the
     * checkbox field of an unassigned item.
     */
    const handleUnassignedItemCheckboxChange = (claim) => {
        const checkedRoles = [...checkedUnassignedListItems];

        if (checkedRoles?.includes(claim)) {
            checkedRoles.splice(checkedRoles.indexOf(claim), 1);
            setCheckedUnassignedListItems(checkedRoles);
        } else {
            checkedRoles.push(claim);
            setCheckedUnassignedListItems(checkedRoles);
        }
    };

    /**
     * The following method handles the onChange event of the
     * checkbox field of an assigned item.
     */
    const handleAssignedItemCheckboxChange = (role) => {
        const checkedRoles = [...checkedAssignedListItems];

        if (checkedRoles?.includes(role)) {
            checkedRoles.splice(checkedRoles.indexOf(role), 1);
            setCheckedAssignedListItems(checkedRoles);
        } else {
            checkedRoles.push(role);
            setCheckedAssignedListItems(checkedRoles);
        }
    };

    /**
     * The following function enables the user to select all the attributes at once.
     */
    const selectAllUnAssignedList = () => {
        setSelectUnassignedClaimsAllClaimsChecked(!isSelectUnassignedClaimsAllClaimsChecked);
    };

    /**
     * The following function enables the user to deselect all the attributes at once.
     */
    const selectAllAssignedList = () => {
        setIsSelectAssignedAllClaimsChecked(!isSelectAssignedAllClaimsChecked);
    };

    /**
     *  Select all selected claims
     */
    useEffect(() => {
        if (isSelectAssignedAllClaimsChecked) {
            setCheckedAssignedListItems(tempSelectedClaims);
        } else {
            setCheckedAssignedListItems([])
        }
    }, [isSelectAssignedAllClaimsChecked]);

    /**
     * Select all available claims.
     */
    useEffect(() => {
        if (isSelectUnassignedClaimsAllClaimsChecked) {
            setCheckedUnassignedListItems(tempAvailableClaims);
        } else {
            setCheckedUnassignedListItems([])
        }
    }, [isSelectUnassignedClaimsAllClaimsChecked]);

    /**
     *  Set initial values for modal.
     */
    useEffect(() => {
        if (showAddModal) {
            setTempAvailableClaims(availableClaims);
            setFilterTempAvailableClaims(availableClaims);
            setTempSelectedClaims(selectedClaims);
            setFilterTempSelectedClaims(selectedClaims);
        } else {
            setTempAvailableClaims([]);
            setFilterTempAvailableClaims([]);
            setTempSelectedClaims([]);
            setFilterTempSelectedClaims([]);
        }
    }, [showAddModal]);

    /**
     *  Save the selected claims
     */
    const updateSelectedClaims = (() => {
        const selectedClaimsValues = [...tempSelectedClaims];
        const removedClaims = selectedClaims.filter((claim) => !selectedClaimsValues?.includes(claim));
        const added = selectedClaimsValues.filter((claim) => !selectedClaims?.includes(claim));
        added.map((claim) => createMapping(claim));
        removedClaims.map((claim) => removeMapping(claim));
        // setSelectedClaims(selectedClaimsValues);
        setInitialSelectedClaims(selectedClaimsValues);
        setAvailableClaims([...tempAvailableClaims]);
        setShowAddModal(false);
    });


    return (
        <Modal open={ showAddModal } size="small" className="user-roles" data-testid={ testId }>
            <Modal.Header>
                { t("devPortal:components.applications.edit.sections.attributes.selection.addWizard.header") }
                <Heading subHeading ellipsis as="h6">
                    { t("devPortal:components.applications.edit.sections.attributes.selection.addWizard." +
                        "subHeading") }
                </Heading>
            </Modal.Header>
            <Modal.Content image>
                <TransferComponent
                    searchPlaceholder={
                        t("devPortal:components.applications.edit.sections.attributes.selection.addWizard.steps" +
                            ".select.transfer.searchPlaceholders.attribute")
                    }
                    addItems={ addAttributes }
                    removeItems={ removeAttributes }
                    handleUnelectedListSearch={ searchTempAvailable }
                    handleSelectedListSearch={ searchTempSelected }
                    data-testid={ `${ testId }-transfer-component` }
                >
                    <TransferList
                        isListEmpty={ !(filterTempAvailableClaims.length > 0) }
                        listType="unselected"
                        listHeaders={ [
                            t("devPortal:components.applications.edit.sections.attributes.selection.addWizard.steps" +
                                ".select.transfer.headers.attribute")
                        ] }
                        handleHeaderCheckboxChange={ selectAllUnAssignedList }
                        isHeaderCheckboxChecked={ isSelectUnassignedClaimsAllClaimsChecked }
                        data-testid={ `${ testId }-unselected-transfer-list` }
                    >
                        {
                            filterTempAvailableClaims?.map((claim, index) => {
                                return (
                                    <TransferListItem
                                        handleItemChange={ () => handleUnassignedItemCheckboxChange(claim) }
                                        key={ claim.claimURI }
                                        listItem={ claim.displayName }
                                        listItemId={ claim.id }
                                        listItemIndex={ claim.claimURI }
                                        isItemChecked={ checkedUnassignedListItems.includes(claim) }
                                        showSecondaryActions={ false }
                                        showListSubItem={ true }
                                        listSubItem={ claim.claimURI }
                                        data-testid={ `${ testId }-unselected-transfer-list-item-${ index }` }
                                    />
                                )
                            })
                        }
                    </TransferList>
                    <TransferList
                        isListEmpty={ !(filterTempSelectedClaims.length > 0) }
                        listType="selected"
                        listHeaders={ [
                            t("devPortal:components.applications.edit.sections.attributes.selection.addWizard.steps" +
                                ".select.transfer.headers.attribute")
                        ] }
                        handleHeaderCheckboxChange={ selectAllAssignedList }
                        isHeaderCheckboxChecked={ isSelectAssignedAllClaimsChecked }
                        data-testid={ `${ testId }-selected-transfer-list` }
                    >
                        {
                            filterTempSelectedClaims?.map((claim, index) => {

                                return (
                                    <TransferListItem
                                        handleItemChange={ () => handleAssignedItemCheckboxChange(claim) }
                                        key={ claim.claimURI }
                                        listItem={ claim.displayName }
                                        listItemId={ claim.id }
                                        listItemIndex={ claim.claimURI }
                                        isItemChecked={ checkedAssignedListItems.includes(claim) }
                                        showSecondaryActions={ false }
                                        showListSubItem={ true }
                                        listSubItem={ claim.claimURI }
                                        data-testid={ `${ testId }-selected-transfer-list-item-${ index }` }
                                    />
                                )
                            })
                        }
                    </TransferList>
                </TransferComponent>
            </Modal.Content>
            <Modal.Actions>
                <LinkButton
                    onClick={ handleAttributeModal }
                    data-testid={ `${ testId }-cancel-button` }
                >
                    { t("common:cancel") }
                </LinkButton>
                <PrimaryButton
                    onClick={ updateSelectedClaims }
                    data-testid={ `${ testId }-save-button` }
                >
                    { t("common:save") }
                </PrimaryButton>
            </Modal.Actions>
        </Modal>
    )
};

/**
 * Default props for the application attribute selection wizard component.
 */
AttributeSelectionWizard.defaultProps = {
    "data-testid": "application-attribute-selection-wizard"
};
