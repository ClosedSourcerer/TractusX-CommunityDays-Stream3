/*
 *  *******************************************************************************
 *  Copyright (c) 2023 BMW AG
 *  Copyright (c) 2023 Contributors to the Eclipse Foundation
 *
 *    See the NOTICE file(s) distributed with this work for additional
 *    information regarding copyright ownership.
 *
 *    This program and the accompanying materials are made available under the
 *    terms of the Apache License, Version 2.0 which is available at
 *    https://www.apache.org/licenses/LICENSE-2.0.
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 *    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 *    License for the specific language governing permissions and limitations
 *    under the License.
 *
 *    SPDX-License-Identifier: Apache-2.0
 *    ********************************************************************************
 */

import { useContext, useEffect } from "react";
import Nav from "react-bootstrap/Nav";
import { FaArrowDown, FaArrowUp, FaHome, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AlertsContext } from "../../contexts/AlertsContextProvider";
import { useInfoMenu } from "../../contexts/InfoMenuContextProvider";


function InfoMenu() {
    const { data } = useInfoMenu();
    const { triggeredAlerts, fetchTriggeredAlertsWithRetry } = useContext(AlertsContext)!;

    const navigate = useNavigate();
    const handleNavigation = (path: string) => {
        navigate(path);
    }
    useEffect(() => {
        fetchTriggeredAlertsWithRetry();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const formatData = (data: number | null | undefined): number | string => {
        return data !== null && data !== undefined ? data : '0';
    };
    return (
        <>
            <Nav className="me-auto">
                <Nav.Link href="/"><FaHome /> Home</Nav.Link>
                <Nav.Link onClick={() => handleNavigation('/favorites')}><FaStar /> Favorites <span className="ms-1 badge rounded-pill text-bg-primary"
                    id="favorites-count">-</span></Nav.Link>

                <Nav.Link href="../alerts">Alerts
                    <span className="ms-1 badge rounded-pill text-bg-danger" id="alerts-count">
                        {formatData(triggeredAlerts.length)}
                    </span>
                </Nav.Link>

                <Nav.Link href="../up">
                    <FaArrowUp /> Status
                    <span className="ms-1 badge rounded-pill text-bg-success" id="status-plus-count">
                        {formatData(data?.statusImprovement)}
                    </span>
                </Nav.Link>
                <Nav.Link href="../down">
                    <FaArrowDown /> Status
                    <span className="ms-1 badge rounded-pill text-bg-danger" id="status-minus-count">
                        {formatData(data?.statusDegredation)}
                    </span>
                </Nav.Link>
                <Nav.Link href="../todo">
                    Todo
                    <span className="ms-1 badge rounded-pill text-bg-warning" id="todo-count">
                        {formatData(data?.todos)}
                    </span>
                </Nav.Link>
                <Nav.Link onClick={() => handleNavigation('/events')}>
                    Events
                    <span className="ms-1 badge rounded-pill text-bg-info" id="events-count">-</span>
                </Nav.Link>
            </Nav>
        </>
    );
}

export default InfoMenu;