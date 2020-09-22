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
import { ContentLoader, EmptyPlaceholder, PageLayout, TemplateGrid } from "@wso2is/react-components";
import isEqual from "lodash/isEqual";
import React, { FunctionComponent, ReactElement, SyntheticEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Divider, Dropdown, DropdownItemProps, DropdownProps, Grid, Icon, Input } from "semantic-ui-react";
import { AppConstants, AppState, EmptyPlaceholderIllustrations, history } from "../../core";
import { CustomApplicationTemplate, MinimalAppCreateWizard } from "../components";
import { ApplicationTemplateIllustrations } from "../configs";
import { ApplicationManagementConstants } from "../constants";
import { ApplicationTemplateCategories, ApplicationTemplateListItemInterface } from "../models";
import { ApplicationManagementUtils } from "../utils";

/**
 * Template filter types.
 * @type {{text: string; value: string; key: string}[]}
 */
const TEMPLATE_FILTER_TYPES: DropdownItemProps[] = [
    {
        key: "all",
        text: "All Types",
        value: "all"
    }
];

/**
 * Props for the Applications templates page.
 */
type ApplicationTemplateSelectPageInterface = TestableComponentInterface;

/**
 * Choose the application template from this page.
 *
 * @param {ApplicationTemplateSelectPageInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
const ApplicationTemplateSelectPage: FunctionComponent<ApplicationTemplateSelectPageInterface> = (
    props: ApplicationTemplateSelectPageInterface
): ReactElement => {

    const {
        [ "data-testid" ]: testId
    } = props;

    const { t } = useTranslation();

    const applicationTemplates: ApplicationTemplateListItemInterface[] = useSelector(
        (state: AppState) => state?.application?.groupedTemplates);

    const [ showWizard, setShowWizard ] = useState<boolean>(false);
    const [ selectedTemplate, setSelectedTemplate ] = useState<ApplicationTemplateListItemInterface>(null);
    const [
        isApplicationTemplateRequestLoading,
        setApplicationTemplateRequestLoadingStatus
    ] = useState<boolean>(false);
    const [
        filteredTemplateList,
        setFilteredTemplateList
    ] = useState<ApplicationTemplateListItemInterface[]>(undefined);
    const [ searchTriggered, setSearchTriggered ] = useState<boolean>(false);
    const [ templateFilterTypes, setTemplateFilterTypes ] = useState<DropdownItemProps[]>(TEMPLATE_FILTER_TYPES);

    /**
     *  Get Application templates.
     */
    useEffect(() => {
        if (applicationTemplates !== undefined) {
            return;
        }

        setApplicationTemplateRequestLoadingStatus(true);

        ApplicationManagementUtils.getApplicationTemplates()
            .finally(() => {
                setApplicationTemplateRequestLoadingStatus(false);
            });
    }, [ applicationTemplates ]);

    useEffect(() => {
        if (filteredTemplateList == undefined) {
            return;
        }

        if (isEqual(filteredTemplateList, applicationTemplates)) {
            setSearchTriggered(false);
        } else {
            setSearchTriggered(true);
        }
    }, [ filteredTemplateList ]);

    /**
     * Populate the filter types based on VENDOR template types.
     */
    useEffect(() => {
        if (!(applicationTemplates && applicationTemplates instanceof Array && applicationTemplates.length > 0)) {
            return;
        }

        const filterTypes: DropdownItemProps[] = TEMPLATE_FILTER_TYPES;

        [ ...applicationTemplates ].forEach((template: ApplicationTemplateListItemInterface) => {
            if (ApplicationManagementConstants.FILTERABLE_TEMPLATE_CATEGORIES
                .includes(template.category as ApplicationTemplateCategories)) {

                template.types.forEach((type: string) => {
                    const isAvailable = filterTypes.some((filterType: DropdownItemProps) => filterType.value === type);
                    
                    if (isAvailable) {
                        return;
                    }

                    filterTypes.push({
                        key: type,
                        text: type,
                        value: type
                    });
                });
            }
        });
        
        setTemplateFilterTypes(filterTypes);
    }, [ applicationTemplates ]);

    /**
     * Handles back button click.
     */
    const handleBackButtonClick = (): void => {
        history.push(AppConstants.getPaths().get("APPLICATIONS"));
    };

    /**
     * Handles template selection.
     *
     * @param {React.SyntheticEvent} e - Click event.
     * @param {string} id - Id of the template.
     */
    const handleTemplateSelection = (e: SyntheticEvent, { id }: { id: string }): void => {

        const selected = applicationTemplates?.find((template) => template.id === id);

        if (id === "custom-application") {
            setSelectedTemplate(CustomApplicationTemplate);
        } else {
            if (!selected) {
                return;
            }
            setSelectedTemplate(selected);
        }
        setShowWizard(true);
    };

    /**
     * Handles the template search.
     *
     * @param {React.SyntheticEvent} e - Click event.
     * @param {string} value - Search value.
     */
    const handleTemplateSearch = (e: SyntheticEvent, { value }: { value: string }): void => {
        if (value.length > 0) {
            setFilteredTemplateList(applicationTemplates.filter((item) =>
                item.name.toLowerCase().indexOf(value.toLowerCase()) !== -1))
        } else {
            setFilteredTemplateList(applicationTemplates);
        }
    };

    /**
     * Handles the template type change.
     *
     * @param event
     * @param data
     */
    const handleTemplateTypeChange = (event: React.MouseEvent<HTMLAnchorElement>, data: DropdownProps): void => {
        if (data.value === "all") {
            setFilteredTemplateList(applicationTemplates);
        } else {
            const filtered = applicationTemplates.filter((template: ApplicationTemplateListItemInterface) =>
                template.types?.includes(data.value));

            setFilteredTemplateList(filtered);
        }
    };

    /**
     * Generic function to render the template grid.
     *
     * @param {ApplicationTemplateCategories[]} categories - Filter categories. Not needed if `templates` is passed in.
     * @param {object} additionalProps - Additional props for the `TemplateGrid` component.
     * @param {React.ReactElement} placeholder - Empty placeholder for the grid.
     * @param {ApplicationTemplateListItemInterface[]} templates - Template array which will get precedence.
     * @return {React.ReactElement}
     */
    const renderTemplateGrid = (categories: ApplicationTemplateCategories[],
                                additionalProps: object,
                                placeholder?: ReactElement,
                                templates?: ApplicationTemplateListItemInterface[]): ReactElement => {

        return (
            <TemplateGrid<ApplicationTemplateListItemInterface>
                type="application"
                templates={
                    templates
                        ? templates
                        : applicationTemplates
                            && applicationTemplates instanceof Array
                            && applicationTemplates.length > 0
                                ? applicationTemplates.filter((template) =>
                                    categories.includes(template.category as ApplicationTemplateCategories))
                                : []
                }
                templateIcons={ ApplicationTemplateIllustrations }
                templateIconOptions={ {
                    fill: "primary"
                } }
                templateIconSize="tiny"
                onTemplateSelect={ handleTemplateSelection }
                paginate={ true }
                paginationLimit={ 5 }
                paginationOptions={ {
                    showLessButtonLabel: t("common:showLess"),
                    showMoreButtonLabel: t("common:showMore")
                } }
                emptyPlaceholder={ placeholder }
                { ...additionalProps }
            />
        );
    };

    /**
     * Renders the template grid based on the passed in view.
     *
     * @param {"CATEGORIZED" | "SEARCH_RESULTS"} view - Render view.
     * @return {React.ReactElement}
     */
    const renderTemplateGrids = (view: "CATEGORIZED" | "SEARCH_RESULTS"): ReactElement => {
        if (view === "CATEGORIZED") {
            return (
                <>
                    <div className="templates quick-start-templates">
                        {
                            renderTemplateGrid(
                                [ ApplicationTemplateCategories.DEFAULT, ApplicationTemplateCategories.DEFAULT_GROUP ],
                                {
                                    "data-testid": `${ testId }-quick-start-template-grid`,
                                    heading: "General Applications",
                                    subHeading: t("devPortal:components.applications.templates.quickSetup.subHeading"),
                                    tagsSectionTitle: t("common:technologies")
                                },
                                <EmptyPlaceholder
                                    image={ EmptyPlaceholderIllustrations.newList }
                                    imageSize="tiny"
                                    title={ t("devPortal:components.templates.emptyPlaceholder." +
                                        "title") }
                                    subtitle={ [t("devPortal:components.templates." +
                                        "emptyPlaceholder.subtitles")] }
                                    data-testid={
                                        `${ testId }-quick-start-template-grid-empty-placeholder`
                                    }
                                />
                            )
                        }
                    </div>
                    <Divider hidden/>
                    <div className="templates custom-templates">
                        {
                            renderTemplateGrid(
                                [ ApplicationTemplateCategories.VENDOR ],
                                {
                                    "data-testid": `${ testId }-custom-template-grid`,
                                    heading: "Vendor Integrations",
                                    showTagIcon: true,
                                    showTags:  true,
                                    subHeading: "Predefined set of applications to integrate your application " +
                                        "with popular vendors.",
                                    tagsAs: "default",
                                    tagsKey: "types"
                                },
                                <EmptyPlaceholder
                                    image={ EmptyPlaceholderIllustrations.newList }
                                    imageSize="tiny"
                                    title={ t("devPortal:components.templates.emptyPlaceholder" +
                                        ".title") }
                                    subtitle={ [t("devPortal:components.templates." +
                                        "emptyPlaceholder.subtitles")] }
                                    data-testid={ `${ testId }-custom-template-grid-empty-placeholder` }
                                />
                            )
                        }
                    </div>
                </>
            )
        }

        if (view === "SEARCH_RESULTS") {
            return (
                <div className="templates search-results">
                    {
                        renderTemplateGrid(
                            [],
                            {
                                "data-testid": `${ testId }-search-template-grid`
                            },
                            <Grid centered>
                                <Grid.Row>
                                    <Grid.Column>
                                        <EmptyPlaceholder
                                            image={ EmptyPlaceholderIllustrations.emptySearch }
                                            imageSize="tiny"
                                            title="No results found"
                                            subtitle={ ["We weren't able to find the type you" +
                                            " were looking for.", "Please try a different term or use one of" +
                                            " the following application types to create a new application."] }
                                            data-testid={ `${ testId }-quick-start-template-grid-empty-
                                                    placeholder` }
                                        />
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row>
                                    <Grid.Column textAlign="center">
                                        <div>
                                            {
                                                renderTemplateGrid(
                                                    [ ApplicationTemplateCategories.DEFAULT ],
                                                    {
                                                       "data-testid": `${ testId }-search-result-fallback-templates`
                                                    },
                                                    <EmptyPlaceholder
                                                        image={ EmptyPlaceholderIllustrations.newList }
                                                        imageSize="tiny"
                                                        title={ t("devPortal:components.templates." +
                                                            "emptyPlaceholder." +
                                                            "title") }
                                                        subtitle={ [t("devPortal:components.templates." +
                                                            "emptyPlaceholder.subtitles")] }
                                                        data-testid={ `${ testId }-quick-start-template-grid-
                                                                empty-placeholder` }
                                                    />
                                                )
                                            }
                                        </div>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>,
                            filteredTemplateList
                        )
                    }
                </div>
            )
        }

        return null;
    };

    return (
        <PageLayout
            title={ t("devPortal:pages.applicationTemplate.title") }
            contentTopMargin={ true }
            description={ t("devPortal:pages.applicationTemplate.subTitle") }
            backButton={ {
                onClick: handleBackButtonClick,
                text: t("devPortal:pages.applicationTemplate.backButton")
            } }
            titleTextAlign="left"
            bottomMargin={ false }
            showBottomDivider
            data-testid={ `${ testId }-page-layout` }
        >
            <Grid>
                <Grid.Row>
                    <Grid.Column>
                        <Input
                            data-testid="scope-mgt-claim-list-search-input"
                            icon={ <Icon name="search"/> }
                            onChange={ handleTemplateSearch }
                            placeholder="Search application type"
                            floated="left"
                            width={ 6 }
                            style={ { width: "270px" } }
                        />
                        <Dropdown
                            className="floated right"
                            placeholder="Select type"
                            selection
                            defaultValue="all"
                            options={ templateFilterTypes }
                            onChange={ handleTemplateTypeChange }
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <Divider hidden />
            {
                searchTriggered && filteredTemplateList
                    ? renderTemplateGrids("SEARCH_RESULTS")
                    : (
                        applicationTemplates && !isApplicationTemplateRequestLoading
                            ? renderTemplateGrids("CATEGORIZED")
                            : <ContentLoader dimmer/>

                    )
            }
            { showWizard && (
                <MinimalAppCreateWizard
                    title={ selectedTemplate?.name }
                    subTitle={ selectedTemplate?.description }
                    closeWizard={ (): void => setShowWizard(false) }
                    template={ selectedTemplate }
                    subTemplates={ selectedTemplate?.subTemplates }
                    subTemplatesSectionTitle={ selectedTemplate?.subTemplatesSectionTitle }
                    addProtocol={ false }
                />
            ) }
        </PageLayout>
    );
};

/**
 * Default props for the component.
 */
ApplicationTemplateSelectPage.defaultProps = {
    "data-testid": "application-templates"
};

/**
 * A default export was added to support React.lazy.
 * TODO: Change this to a named export once react starts supporting named exports for code splitting.
 * @see {@link https://reactjs.org/docs/code-splitting.html#reactlazy}
 */
export default ApplicationTemplateSelectPage;
