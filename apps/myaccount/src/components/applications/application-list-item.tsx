/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { FunctionComponent } from "react";
import { Icon, Item, List } from "semantic-ui-react";
import { Application } from "../../models";
import { AppAvatar } from "../shared";

/**
 * Proptypes for the application list item component.
 */
interface ApplicationListItemProps {
    app: Application;
    onAppNavigate: (id: string, url: string) => void;
    showFavouriteIcon: boolean;
}

/**
 * Application list item component.
 *
 * @return {JSX.Element}
 */
export const ApplicationListItem: FunctionComponent<ApplicationListItemProps> = (
    props: ApplicationListItemProps
): JSX.Element => {
    const { app, onAppNavigate, showFavouriteIcon } = props;

    return (
        <Item.Group unstackable onClick={ () => onAppNavigate(app.id, app.accessUrl) }>
            <Item className="application-list-item">
                <List.Content className="icon-container" floated="left">
                    <AppAvatar
                        spaced="right"
                        size={ app.image ? "mini" : "little" }
                        name={ app.name }
                        image={ app.image }
                    />
                </List.Content>
                <Item.Content className="text-content-container">
                    <Item.Header as="a">
                        <div className="item-header">{ app.name }</div>
                        {
                            (showFavouriteIcon && app.favourite)
                                ? (
                                    <Icon
                                        name={
                                            app.favourite ? "star" : "star outline"
                                        }
                                        size="small"
                                        className="favourite-icon favoured"
                                    />
                                )
                                : null
                        }
                    </Item.Header>
                    <Item.Meta className="item-description">{ app.description }</Item.Meta>
                    <Item.Extra>
                        {
                            (app.tags && app.tags.length && app.tags.length > 0)
                                ? (
                                    <>
                                        <Icon name="tag" size="small"/>
                                        {
                                            app.tags.map((tag, index) => {
                                                if (index === 0) {
                                                    return <span className="tag" key={ index }>{ " " }{ tag }</span>;
                                                }
                                                return <span className="tag" key={ index }>, { tag }</span>;
                                            })
                                        }
                                    </>
                                )
                                : null
                        }
                    </Item.Extra>
                </Item.Content>
            </Item>
        </Item.Group>
    );
};
